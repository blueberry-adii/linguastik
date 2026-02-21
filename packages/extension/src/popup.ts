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

            localStorage.setItem('visionImageData', result);
            localStorage.setItem('visionImageName', file.name);
            localStorage.removeItem('visionAnalysisResult');

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
                        localStorage.setItem('visionAnalysisResult', JSON.stringify(response.data));
                        if (visionFileName) {
                            const query = response.data.query || response.data.object || 'Unknown Object';
                            const confidence = Math.round((response.data.confidence || 0) * 100);
                            visionFileName.innerHTML = `<strong>Generating Search:</strong> ${query} <span style="font-size: 0.9em; opacity: 0.8;">(${confidence}%)</span>`;

                            triggerSearchForQuery(query);
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

chrome.storage.sync.get(['serperApiKey', 'lingoApiKey', 'geminiApiKey', 'foreignLanguage', 'userLanguage', 'enabled', 'visionEnabled'], (result) => {
    if (result.serperApiKey) (document.getElementById('serperApiKey') as HTMLInputElement).value = result.serperApiKey;
    if (result.lingoApiKey) (document.getElementById('lingoApiKey') as HTMLInputElement).value = result.lingoApiKey;
    if (result.geminiApiKey) (document.getElementById('geminiApiKey') as HTMLInputElement).value = result.geminiApiKey;
    if (result.foreignLanguage) (document.getElementById('foreignLanguage') as HTMLSelectElement).value = result.foreignLanguage;
    const userLang = result.userLanguage || 'auto';
    (document.getElementById('userLanguage') as HTMLSelectElement).value = userLang;

    const enabled = result.enabled !== undefined ? result.enabled : true;
    (document.getElementById('enabled') as HTMLInputElement).checked = enabled;

    if (result.visionEnabled && eyeBtn) {
        eyeBtn.classList.add('active');
        if (visionContainer) visionContainer.style.display = 'flex';

        const savedImageData = localStorage.getItem('visionImageData');
        const savedImageName = localStorage.getItem('visionImageName');
        const savedAnalysis = localStorage.getItem('visionAnalysisResult');

        if (savedImageData && savedImageName) {
            if (visionEmptyState) visionEmptyState.style.display = 'none';
            if (visionPreviewState) visionPreviewState.style.display = 'flex';
            if (visionPreviewImg) visionPreviewImg.src = savedImageData;
            if (visionFileName) visionFileName.textContent = savedImageName;

            if (savedAnalysis) {
                try {
                    const data = JSON.parse(savedAnalysis);
                    const query = data.query || data.object || 'Unknown Object';
                    const confidence = Math.round((data.confidence || 0) * 100);
                    if (visionFileName) {
                        visionFileName.innerHTML = `<strong>Generating Search:</strong> ${query} <span style="font-size: 0.9em; opacity: 0.8;">(${confidence}%)</span>`;
                    }
                } catch (e) {
                    console.error('Failed to parse saved analysis:', e);
                }
            } else {
                processImage(savedImageData);
            }
        }
    }

    const initialLang = result.userLanguage === 'auto' ? 'en' : result.userLanguage || 'en';
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
                            "source": "auto",
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
    const foreignLanguage = (document.getElementById('foreignLanguage') as HTMLSelectElement).value;
    const userLanguage = (document.getElementById('userLanguage') as HTMLSelectElement).value;
    const enabled = (document.getElementById('enabled') as HTMLInputElement).checked;
    const visionEnabled = eyeBtn?.classList.contains('active') || false;

    chrome.storage.sync.set({
        serperApiKey,
        lingoApiKey,
        geminiApiKey,
        foreignLanguage,
        userLanguage,
        enabled,
        visionEnabled
    }, async () => {
        // Trigger translation on save if language changed
        const targetLang = userLanguage === 'auto' ? 'en' : userLanguage;
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

    localStorage.removeItem('visionImageData');
    localStorage.removeItem('visionImageName');
    localStorage.removeItem('visionAnalysisResult');
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


function triggerSearchForQuery(query: string) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            const tabId = tabs[0].id;
            console.log('Target Tab ID:', tabId);

            chrome.tabs.sendMessage(tabId, {
                type: 'SEARCH_LOADING',
                query: query
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn('Content script not ready. Injecting...', chrome.runtime.lastError);

                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['content.js']
                    }, () => {
                        if (chrome.runtime.lastError) {
                            console.error('Failed to inject content script:', chrome.runtime.lastError);
                        } else {
                            console.log('Content script injected. Retrying SEARCH_LOADING...');
                            chrome.tabs.sendMessage(tabId, {
                                type: 'SEARCH_LOADING',
                                query: query
                            });
                        }
                    });
                } else {
                    console.log('SEARCH_LOADING sent directly to tab');
                }
            });

            console.log('Sending NEW_SEARCH to background for tab:', tabId);
            chrome.runtime.sendMessage({
                type: 'NEW_SEARCH',
                query: query,
                tabId: tabId
            }, (resp) => {
                if (chrome.runtime.lastError) {
                    console.error('Failed to send NEW_SEARCH:', chrome.runtime.lastError);
                } else {
                    console.log('NEW_SEARCH sent successfully');
                }
            });
        } else {
            console.error('No active tab found to send search');
        }
    });
}
