const eyeBtn = document.getElementById('eyeBtn');
const visionContainer = document.getElementById('visionContainer');
const visionUploadBtn = document.getElementById('visionUploadBtn');
const visionInput = document.getElementById('visionInput') as HTMLInputElement;

const visionEmptyState = document.getElementById('visionEmptyState');
const visionPreviewState = document.getElementById('visionPreviewState');
const visionPreviewImg = document.getElementById('visionPreviewImg') as HTMLImageElement;
const visionFileName = document.getElementById('visionFileName');
const visionClearBtn = document.getElementById('visionClearBtn');

function handleFileSelection(file: File) {
    if (!file.type.startsWith('image/')) {
        console.error('Invalid file type');
        return;
    }

    console.log('File selected:', file.name);

    if (visionEmptyState) visionEmptyState.style.display = 'none';
    if (visionPreviewState) visionPreviewState.style.display = 'flex';

    if (visionFileName) visionFileName.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
        if (visionPreviewImg && e.target?.result) {
            const result = e.target.result as string;
            visionPreviewImg.src = result;

            processImage(result);
        }
    };
    reader.readAsDataURL(file);
}

function processImage(dataUrl: string) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > maxDim || height > maxDim) {
            if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
            } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
            }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64Data = compressedDataUrl.split(',')[1];

        chrome.storage.sync.get(['geminiApiKey'], (result) => {
            if (result.geminiApiKey) {
                if (visionFileName) visionFileName.textContent = 'Analyzing...';

                chrome.runtime.sendMessage({
                    type: 'IDENTIFY_OBJECT',
                    payload: {
                        image: base64Data,
                        apiKey: result.geminiApiKey
                    }
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError);
                        if (visionFileName) visionFileName.textContent = 'Error: ' + chrome.runtime.lastError.message;
                        return;
                    }

                    if (response && response.success) {
                        console.log('Gemini Analysis:', response.data);
                        if (visionFileName) {
                            const objectName = response.data.object;
                            const confidence = Math.round(response.data.confidence * 100);
                            visionFileName.innerHTML = `<strong>${objectName}</strong> <span style="font-size: 0.9em; opacity: 0.8;">(${confidence}%)</span>`;
                        }
                    } else {
                        console.error('Gemini Error:', response?.error);
                        if (visionFileName) {
                            visionFileName.textContent = `Analysis Failed: ${response?.error || 'Unknown error'}`;
                            visionFileName.title = response?.error || '';
                        }
                    }
                });
            } else {
                if (visionFileName) visionFileName.textContent = 'Missing Gemini API Key';
            }
        });
    };
    img.onerror = (err) => {
        console.error('Image load failed:', err);
        if (visionFileName) visionFileName.textContent = 'Image Load Error';
    };
    img.src = dataUrl;
}

chrome.storage.sync.get(['serperApiKey', 'lingoApiKey', 'geminiApiKey', 'userLanguage', 'preferredLanguage', 'enabled', 'visionEnabled'], (result) => {
    if (result.serperApiKey) (document.getElementById('serperApiKey') as HTMLInputElement).value = result.serperApiKey;
    if (result.lingoApiKey) (document.getElementById('lingoApiKey') as HTMLInputElement).value = result.lingoApiKey;
    if (result.geminiApiKey) (document.getElementById('geminiApiKey') as HTMLInputElement).value = result.geminiApiKey;
    if (result.userLanguage) (document.getElementById('userLanguage') as HTMLSelectElement).value = result.userLanguage;
    const preferredLang = result.preferredLanguage || 'auto';
    (document.getElementById('preferredLanguage') as HTMLSelectElement).value = preferredLang;

    const enabled = result.enabled !== undefined ? result.enabled : true;
    (document.getElementById('enabled') as HTMLInputElement).checked = enabled;

    if (result.visionEnabled && eyeBtn) {
        eyeBtn.classList.add('active');
        if (visionContainer) visionContainer.style.display = 'flex';
    }

    const initialLang = result.preferredLanguage === 'auto' ? 'en' : result.preferredLanguage || 'en';
    if (initialLang !== 'en') {
        translateUI(initialLang, result.lingoApiKey);
    }

    if (localStorage.getItem('show_settings_saved') === 'true') {
        localStorage.removeItem('show_settings_saved');
        const status = document.getElementById('status');
        const settingsSavedMsg = document.getElementById('msgSettingsSaved')?.textContent || 'Settings Saved!';
        if (status) {
            status.textContent = settingsSavedMsg;
            setTimeout(() => status.textContent = '', 2000);
        }
    }
});

async function translateUI(targetLang: string, apiKey: string) {
    if (!apiKey) return;

    const elements = document.querySelectorAll('[data-i18n]');
    const textsToTranslate: { key: string, text: string }[] = [];

    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');

        if (!el.getAttribute('data-original-text')) {
            const currentText = el.textContent?.trim();
            if (currentText) {
                el.setAttribute('data-original-text', currentText);
            }
        }

        const text = el.getAttribute('data-original-text');
        if (key && text) {
            textsToTranslate.push({ key, text });
        }
    });

    if (textsToTranslate.length === 0) return;
    const cacheKey = `lingo_ui_cache_v2_${targetLang}`;
    const cached = localStorage.getItem(cacheKey);
    let cache = cached ? JSON.parse(cached) : {};

    const needsTranslation = textsToTranslate.filter(item => !cache[item.key]);

    if (needsTranslation.length > 0) {
        await Promise.all(needsTranslation.map(async (item) => {
            try {
                console.log(`[translateUI] Fetching translation for: "${item.text}"`);
                const response = await fetch('https://engine.lingo.dev/i18n', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "params": {
                            "workflowId": crypto.randomUUID(),
                            "fast": true
                        },
                        "locale": {
                            "source": "en",
                            "target": targetLang
                        },
                        "data": {
                            "text": item.text
                        }
                    })
                });

                if (!response.ok) {
                    console.error(`[translateUI] API Error: ${response.status} ${response.statusText}`);
                    const errText = await response.text();
                    console.error(`[translateUI] API Error Body:`, errText);
                    return;
                }

                const jsonResponse = await response.json();
                console.log(`[translateUI] API Response for "${item.key}":`, jsonResponse);

                const translation = jsonResponse.data?.text;
                if (translation) {
                    cache[item.key] = translation;
                }
            } catch (error) {
                console.error('Translation failed for', item.key, error);
            }
        }));

        localStorage.setItem(cacheKey, JSON.stringify(cache));
    }

    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && cache[key]) {
            el.textContent = cache[key];
        }
    });
}

document.getElementById('saveBtn')?.addEventListener('click', () => {
    const serperApiKey = (document.getElementById('serperApiKey') as HTMLInputElement).value;
    const lingoApiKey = (document.getElementById('lingoApiKey') as HTMLInputElement).value;
    const geminiApiKey = (document.getElementById('geminiApiKey') as HTMLInputElement).value;
    const userLanguage = (document.getElementById('userLanguage') as HTMLSelectElement).value;
    const preferredLanguage = (document.getElementById('preferredLanguage') as HTMLSelectElement).value;
    const enabled = (document.getElementById('enabled') as HTMLInputElement).checked;
    const visionEnabled = eyeBtn?.classList.contains('active') || false;

    chrome.storage.sync.set({
        serperApiKey,
        lingoApiKey,
        geminiApiKey,
        userLanguage,
        preferredLanguage,
        enabled,
        visionEnabled
    }, async () => {
        // Trigger translation on save if language changed
        const targetLang = preferredLanguage === 'auto' ? 'en' : preferredLanguage;
        if (targetLang !== 'en') {
            await translateUI(targetLang, lingoApiKey);
        } else {
            localStorage.setItem('show_settings_saved', 'true');
            location.reload();
            return;
        }

        const status = document.getElementById('status');
        const settingsSavedMsg = document.getElementById('msgSettingsSaved')?.textContent || 'Settings Saved!';

        if (status) {
            status.textContent = settingsSavedMsg;
            setTimeout(() => status.textContent = '', 2000);
        }
    });
});

eyeBtn?.addEventListener('click', () => {
    const isActive = eyeBtn.classList.toggle('active');
    if (visionContainer) {
        visionContainer.style.display = isActive ? 'flex' : 'none';
    }
});

visionUploadBtn?.addEventListener('click', () => {
    visionInput?.click();
});

visionInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleFileSelection(file);
});

visionClearBtn?.addEventListener('click', () => {
    if (visionInput) visionInput.value = '';
    if (visionPreviewState) visionPreviewState.style.display = 'none';
    if (visionEmptyState) visionEmptyState.style.display = 'flex';
    if (visionPreviewImg) visionPreviewImg.src = '';
});

if (visionContainer) {
    visionContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        visionContainer.classList.add('drag-over');
    });

    visionContainer.addEventListener('dragleave', () => {
        visionContainer.classList.remove('drag-over');
    });

    visionContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        visionContainer.classList.remove('drag-over');
        const file = e.dataTransfer?.files[0];
        if (file) handleFileSelection(file);
    });
}

