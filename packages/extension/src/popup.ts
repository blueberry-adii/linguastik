document.addEventListener('DOMContentLoaded', () => {
    const eyeBtn = document.getElementById('eyeBtn');

    chrome.storage.sync.get(['serperApiKey', 'lingoApiKey', 'userLanguage', 'enabled', 'visionEnabled'], (result) => {
        if (result.serperApiKey) (document.getElementById('serperApiKey') as HTMLInputElement).value = result.serperApiKey;
        if (result.lingoApiKey) (document.getElementById('lingoApiKey') as HTMLInputElement).value = result.lingoApiKey;
        if (result.userLanguage) (document.getElementById('userLanguage') as HTMLSelectElement).value = result.userLanguage;
        const enabled = result.enabled !== undefined ? result.enabled : true;
        (document.getElementById('enabled') as HTMLInputElement).checked = enabled;

        // Vision Button State
        if (result.visionEnabled && eyeBtn) {
            eyeBtn.classList.add('active');
        }
    });

    document.getElementById('saveBtn')?.addEventListener('click', () => {
        const serperApiKey = (document.getElementById('serperApiKey') as HTMLInputElement).value;
        const lingoApiKey = (document.getElementById('lingoApiKey') as HTMLInputElement).value;
        const userLanguage = (document.getElementById('userLanguage') as HTMLSelectElement).value;
        const enabled = (document.getElementById('enabled') as HTMLInputElement).checked;
        const visionEnabled = eyeBtn?.classList.contains('active') || false;

        chrome.storage.sync.set({
            serperApiKey,
            lingoApiKey,
            userLanguage,
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
        eyeBtn.classList.toggle('active');
    });
});

