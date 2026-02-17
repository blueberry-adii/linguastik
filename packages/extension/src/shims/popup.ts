document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['serperApiKey', 'lingoApiKey', 'userLanguage', 'enabled'], (result) => {
        if (result.serperApiKey) (document.getElementById('serperApiKey') as HTMLInputElement).value = result.serperApiKey;
        if (result.lingoApiKey) (document.getElementById('lingoApiKey') as HTMLInputElement).value = result.lingoApiKey;
        if (result.userLanguage) (document.getElementById('userLanguage') as HTMLSelectElement).value = result.userLanguage;
        const enabled = result.enabled !== undefined ? result.enabled : true;
        (document.getElementById('enabled') as HTMLInputElement).checked = enabled;
    });

    document.getElementById('saveBtn')?.addEventListener('click', () => {
        const serperApiKey = (document.getElementById('serperApiKey') as HTMLInputElement).value;
        const lingoApiKey = (document.getElementById('lingoApiKey') as HTMLInputElement).value;
        const userLanguage = (document.getElementById('userLanguage') as HTMLSelectElement).value;
        const enabled = (document.getElementById('enabled') as HTMLInputElement).checked;

        chrome.storage.sync.set({
            serperApiKey,
            lingoApiKey,
            userLanguage,
            enabled
        }, () => {
            const status = document.getElementById('status');
            if (status) {
                status.textContent = 'Settings Saved!';
                setTimeout(() => status.textContent = '', 2000);
            }
        });
    });
});
