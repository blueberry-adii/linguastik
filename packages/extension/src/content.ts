import { styles } from './ui/styles';
import { renderSidebar, renderLoading, renderError } from './ui/sidebar';

console.log('Linguastik Lens Content Script Loaded');

function getQueryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
}

let lastQuery = getQueryFromURL();
setInterval(() => {
    const current = getQueryFromURL();
    if (current && current !== lastQuery) {
        lastQuery = current;
        checkEnabledAndSearch(current);
    }
}, 1000);

if (lastQuery) {
    checkEnabledAndSearch(lastQuery);
}

function checkEnabledAndSearch(query: string) {
    chrome.storage.sync.get(['enabled'], (result) => {
        // Default to enabled if not set
        if (result.enabled !== false) {
            handleNewSearch(query);
        } else {
            console.log('Linguastik: Extension disabled by user setting.');
        }
    });
}

function handleNewSearch(query: string) {
    console.log('Linguastik: New search detected', query);
    chrome.runtime.sendMessage({
        type: "NEW_SEARCH",
        query: query,
    });
    createSidebarIfNeeded(query);
}

function createSidebarIfNeeded(query: string = '') {
    if (document.getElementById('linguastik-lens-host')) return;

    const host = document.createElement("div");
    host.id = "linguastik-lens-host";
    host.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 2147483647;
        pointer-events: none;
    `;
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    shadow.appendChild(styleEl);

    const container = document.createElement('div');
    container.className = 'sidebar visible';
    container.style.pointerEvents = 'auto';

    container.innerHTML = `
        <header>
            <h1>
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                Linguastik
            </h1>
            <div id="region-tags-container" class="region-tags"></div>
            <button class="close-btn">&times;</button>
        </header>
        <div id="result-content">
            ${renderLoading(query)}
        </div>
    `;
    shadow.appendChild(container);

    // Toggle Button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-btn';
    toggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
    `;
    toggleBtn.title = "Open Linguastik Lens";
    toggleBtn.style.pointerEvents = 'auto';
    shadow.appendChild(toggleBtn);

    // Close Handler
    container.querySelector('.close-btn')?.addEventListener('click', () => {
        container.classList.remove('visible');
    });

    // Toggle Handler
    toggleBtn.addEventListener('click', () => {
        container.classList.add('visible');
    });
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SEARCH_RESULTS") {
        const host = document.getElementById('linguastik-lens-host');
        if (host && host.shadowRoot) {
            const content = host.shadowRoot.getElementById('result-content');
            if (content) {
                content.innerHTML = renderSidebar(message.data);
            }
            // Update regions in header
            const regionContainer = host.shadowRoot.getElementById('region-tags-container');
            if (regionContainer && message.data.regions) {
                regionContainer.innerHTML = message.data.regions.map((r: any) =>
                    `<span class="region-tag" title="${r.country}">${r.lang.toUpperCase()}</span>`
                ).join('');
            }
        }
    } else if (message.type === "SEARCH_ERROR") {
        const host = document.getElementById('linguastik-lens-host');
        if (host && host.shadowRoot) {
            const content = host.shadowRoot.getElementById('result-content');
            if (content) {
                content.innerHTML = renderError(message.error);
            }
        }
    }
});
