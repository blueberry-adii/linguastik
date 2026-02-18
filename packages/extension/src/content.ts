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

    const host = document.getElementById('linguastik-lens-host');
    if (host && host.shadowRoot) {
        const sidebar = host.shadowRoot.querySelector('.sidebar');
        sidebar?.classList.add('visible');

        const content = host.shadowRoot.getElementById('result-content');
        if (content) {
            content.innerHTML = renderLoading(query);
        }
    }
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
    container.className = query ? 'sidebar visible' : 'sidebar';
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

    // Toggle Button ( Only show if this is a persistent search page (URL has query) )
    const pageQuery = getQueryFromURL();
    if (pageQuery) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-btn';
        toggleBtn.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        `;
        toggleBtn.title = "Open Linguastik Lens";
        toggleBtn.style.pointerEvents = 'auto';
        shadow.appendChild(toggleBtn);

        // Toggle Handler
        toggleBtn.addEventListener('click', () => {
            container.classList.add('visible');
        });
    }

    // Close Handler
    container.querySelector('.close-btn')?.addEventListener('click', () => {
        container.classList.remove('visible');
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

let floatingBtn: HTMLElement | null = null;

document.addEventListener('mouseup', (e) => {
    handleSelection();
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        handleSelection();
    }
});

document.addEventListener('scroll', () => {
    removeFloatingButton();
}, true);

document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
        removeFloatingButton();
    }
    removeFloatingButton();
});

document.addEventListener('resize', () => {
    removeFloatingButton();
});

function handleSelection() {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
        const range = selection!.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        showFloatingButton(rect.left + (rect.width / 2), rect.bottom + 10, text);
    } else {
        removeFloatingButton();
    }
}

function showFloatingButton(x: number, y: number, text: string) {
    createSidebarIfNeeded();
    const host = document.getElementById('linguastik-lens-host');
    if (!host || !host.shadowRoot) return;

    if (!floatingBtn) {
        floatingBtn = document.createElement('div');
        floatingBtn.className = 'linguastik-floating-btn';
        floatingBtn.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.09-.09 2.54-2.51.13.56zm5.66-2.54l-2.53 7L14 19l4.5 9H20l1.25-3.5h5.5L28 28h1.5l4.5-9h-1.97l-2.53-7H18.53zM22.5 22h-3l1.5-4.25L22.5 22z"/></svg>
        `;
        host.shadowRoot.appendChild(floatingBtn);
    }

    const btnWidth = 110;
    const finalX = Math.max(10, Math.min(window.innerWidth - btnWidth - 10, x - (btnWidth / 2)));
    const finalY = y + window.scrollY;

    floatingBtn.style.left = `${finalX}px`;
    floatingBtn.style.top = `${y}px`;

    floatingBtn.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    floatingBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();


        const rect = floatingBtn!.getBoundingClientRect();
        removeFloatingButton();

        showPopup(rect.left, rect.top + window.scrollY, text);
    };
}

let floatingPopup: HTMLElement | null = null;

function showPopup(x: number, y: number, text: string) {
    createSidebarIfNeeded();
    const host = document.getElementById('linguastik-lens-host');
    if (!host || !host.shadowRoot) return;

    if (floatingPopup) floatingPopup.remove();

    floatingPopup = document.createElement('div');
    floatingPopup.className = 'linguastik-popup';

    floatingPopup.innerHTML = `
        <div class="linguastik-popup-header">
            <div class="linguastik-popup-spinner"></div>
            Translating...
        </div>
    `;

    floatingPopup.style.left = `${x}px`;
    floatingPopup.style.top = `${y}px`;

    host.shadowRoot.appendChild(floatingPopup);

    setTimeout(() => {
        if (!floatingPopup) return;
        floatingPopup.innerHTML = `
            <div class="linguastik-popup-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#00E5FF"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.09-.09 2.54-2.51.13.56zm5.66-2.54l-2.53 7L14 19l4.5 9H20l1.25-3.5h5.5L28 28h1.5l4.5-9h-1.97l-2.53-7H18.53zM22.5 22h-3l1.5-4.25L22.5 22z"/></svg>
                English
            </div>
            <div class="linguastik-popup-content">
                ${text}
            </div>
        `;
    }, 1500);
}

function removeFloatingButton() {
    if (floatingBtn) {
        floatingBtn.remove();
        floatingBtn = null;
    }
    if (floatingPopup) {
        floatingPopup.remove();
        floatingPopup = null;
    }
}
