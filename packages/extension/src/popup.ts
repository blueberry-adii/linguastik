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
            visionPreviewImg.src = e.target.result as string;
        }
    };
    reader.readAsDataURL(file);
}

chrome.storage.sync.get(['serperApiKey', 'lingoApiKey', 'userLanguage', 'preferredLanguage', 'enabled', 'visionEnabled'], (result) => {
    if (result.serperApiKey) (document.getElementById('serperApiKey') as HTMLInputElement).value = result.serperApiKey;
    if (result.lingoApiKey) (document.getElementById('lingoApiKey') as HTMLInputElement).value = result.lingoApiKey;
    if (result.userLanguage) (document.getElementById('userLanguage') as HTMLSelectElement).value = result.userLanguage;
    const preferredLang = result.preferredLanguage || 'auto';
    (document.getElementById('preferredLanguage') as HTMLSelectElement).value = preferredLang;

    const enabled = result.enabled !== undefined ? result.enabled : true;
    (document.getElementById('enabled') as HTMLInputElement).checked = enabled;

    // Vision Button State
    if (result.visionEnabled && eyeBtn) {
        eyeBtn.classList.add('active');
        if (visionContainer) visionContainer.style.display = 'flex';
    }
});

document.getElementById('saveBtn')?.addEventListener('click', () => {
    const serperApiKey = (document.getElementById('serperApiKey') as HTMLInputElement).value;
    const lingoApiKey = (document.getElementById('lingoApiKey') as HTMLInputElement).value;
    const userLanguage = (document.getElementById('userLanguage') as HTMLSelectElement).value;
    const preferredLanguage = (document.getElementById('preferredLanguage') as HTMLSelectElement).value;
    const enabled = (document.getElementById('enabled') as HTMLInputElement).checked;
    const visionEnabled = eyeBtn?.classList.contains('active') || false;

    chrome.storage.sync.set({
        serperApiKey,
        lingoApiKey,
        userLanguage,
        preferredLanguage,
        enabled,
        visionEnabled
    }, () => {
        const status = document.getElementById('status');
        if (status) {
            status.textContent = 'Settings Saved!';
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

