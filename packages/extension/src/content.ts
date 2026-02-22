import { styles } from './ui/styles';
import { renderSidebar, renderLoading, renderError } from './ui/sidebar';

console.log('Linguastik Lens Content Script Loaded');

if ((window as any).hasLingoContentScriptLoaded) {
    console.log('Linguastik Lens Content Script already loaded. Skipping initialization.');
}
(window as any).hasLingoContentScriptLoaded = true;

function getQueryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
}

let lastQuery = getQueryFromURL();
setInterval(() => {
    const current = getQueryFromURL();
    if (current !== lastQuery) {
        lastQuery = current;
        updateRightToggleVisibility(current);
        if (current) {
            checkEnabledAndSearch(current);
        }
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
        <div id="sidebarTranslationOverlay" class="translation-overlay">
            <div class="translation-overlay-spinner"></div>
            <div class="translation-overlay-text" data-i18n="translatingOverlay">Analyzing...</div>
        </div>
    `;
    shadow.appendChild(container);

    // Left Sidebar (Translations)
    const leftSidebar = document.createElement('div');
    leftSidebar.className = 'sidebar-left';
    leftSidebar.style.pointerEvents = 'auto';
    leftSidebar.innerHTML = `
        <header>
            <h1>
                <svg viewBox="0 0 24 24"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.09-.09 2.54-2.51.13.56zm5.66-2.54l-2.53 7L14 19l4.5 9H20l1.25-3.5h5.5L28 28h1.5l4.5-9h-1.97l-2.53-7H18.53zM22.5 22h-3l1.5-4.25L22.5 22z"/></svg>
                Quick Translate
            </h1>
            <button class="close-btn-left">&times;</button>
        </header>
        <div id="translation-content" class="content-padding">
            <div class="empty-state">No translations yet</div>
        </div>
        <div id="sidebarLeftTranslationOverlay" class="translation-overlay">
            <div class="translation-overlay-spinner"></div>
            <div class="translation-overlay-text" data-i18n="translatingOverlay">Translating...</div>
        </div>
    `;
    shadow.appendChild(leftSidebar);

    // Toggle Button (Right - Search)
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-btn';
    toggleBtn.id = 'linguastik-toggle-right';
    toggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
    `;
    toggleBtn.title = "Open Linguastik Lens";
    toggleBtn.style.pointerEvents = 'auto';

    if (!query) {
        toggleBtn.style.display = 'none';
    }
    shadow.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', () => {
        container.classList.add('visible');
    });

    // Toggle Button (Left - Quick Translate)
    const toggleBtnLeft = document.createElement('button');
    toggleBtnLeft.className = 'toggle-btn-left';
    toggleBtnLeft.id = 'linguastik-toggle-left';
    toggleBtnLeft.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg> 
    `;
    toggleBtnLeft.title = "Open Quick Translate";
    toggleBtnLeft.style.pointerEvents = 'auto';
    shadow.appendChild(toggleBtnLeft);

    toggleBtnLeft.addEventListener('click', () => {
        leftSidebar.classList.add('visible');
    });

    // Close Handlers
    container.querySelector('.close-btn')?.addEventListener('click', () => {
        container.classList.remove('visible');
    });

    leftSidebar.querySelector('.close-btn-left')?.addEventListener('click', () => {
        leftSidebar.classList.remove('visible');
    });


}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
                regionContainer.innerHTML = (message.data.regions as string[]).map((r) =>
                    `<span class="region-tag" title="${r}">${r.toUpperCase()}</span>`
                ).join('');
            }
            const overlay = host.shadowRoot.getElementById('sidebarTranslationOverlay');
            if (overlay) overlay.classList.remove('active');
        }
    } else if (message.type === "SEARCH_ERROR") {
        const host = document.getElementById('linguastik-lens-host');
        if (host && host.shadowRoot) {
            const content = host.shadowRoot.getElementById('result-content');
            if (content) {
                content.innerHTML = renderError(message.error);
            }
            const overlay = host.shadowRoot.getElementById('sidebarTranslationOverlay');
            if (overlay) overlay.classList.remove('active');
        }
    } else if (message.type === "SEARCH_LOADING") {
        createSidebarIfNeeded(message.query);
        const host = document.getElementById('linguastik-lens-host');
        if (host && host.shadowRoot) {
            const sidebar = host.shadowRoot.querySelector('.sidebar');
            if (sidebar) sidebar.classList.add('visible');

            const content = host.shadowRoot.getElementById('result-content');
            if (content) {
                content.innerHTML = renderLoading(message.query);
            }

            const overlay = host.shadowRoot.getElementById('sidebarTranslationOverlay');
            if (overlay) overlay.classList.add('active');
        }
        sendResponse({ received: true });
        return true;
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
        showFloatingButton(rect.left + (rect.width / 2), rect.bottom + 10, text, range);
    } else {
        removeFloatingButton();
    }
}

function showFloatingButton(x: number, y: number, text: string, range: Range) {
    createSidebarIfNeeded();
    const host = document.getElementById('linguastik-lens-host');
    if (!host || !host.shadowRoot) return;

    const savedRange = range.cloneRange();

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

    floatingBtn.style.left = `${finalX}px`;
    floatingBtn.style.top = `${y}px`;

    floatingBtn.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    floatingBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        removeFloatingButton();
        replaceSelectionWithTranslation(text, savedRange);
    };
}

function replaceSelectionWithTranslation(text: string, range: Range) {
    if (!document.getElementById('linguastik-inline-style')) {
        const style = document.createElement('style');
        style.id = 'linguastik-inline-style';
        style.textContent = `
            @keyframes lg-shimmer {
                0%   { background-position: -200% center; }
                100% { background-position:  200% center; }
            }
            .lg-shimmer {
                display: inline-block;
                min-width: 60px;
                height: 0.85em;
                border-radius: 4px;
                vertical-align: middle;
                background: linear-gradient(
                    90deg,
                    rgba(0,229,255,0.06) 25%,
                    rgba(0,229,255,0.22) 50%,
                    rgba(0,229,255,0.06) 75%
                );
                background-size: 200% auto;
                animation: lg-shimmer 1.3s linear infinite;
            }
            .lg-translated {
                text-decoration: underline;
                text-decoration-style: dashed;
                text-decoration-color: rgba(0,229,255,0.55);
                text-underline-offset: 3px;
                cursor: help;
            }
            #lg-tooltip {
                position: fixed;
                z-index: 2147483647;
                background: #1a1a2e;
                border: 1px solid rgba(0,229,255,0.3);
                border-radius: 8px;
                padding: 8px 12px;
                font-family: system-ui, sans-serif;
                font-size: 13px;
                color: #e0e0e0;
                box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                max-width: 280px;
                pointer-events: auto;
                opacity: 0;
                transition: opacity 0.15s ease;
            }
            #lg-tooltip.lg-visible { opacity: 1; }
            #lg-tooltip .lg-orig-label {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: rgba(0,229,255,0.55);
                margin-bottom: 4px;
            }
            #lg-tooltip .lg-orig-text {
                margin: 0 0 8px;
                line-height: 1.4;
                color: #a0a0b8;
            }
            #lg-tooltip .lg-revert-btn {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 4px 10px;
                border-radius: 5px;
                border: 1px solid rgba(0,229,255,0.35);
                background: transparent;
                color: rgba(0,229,255,0.9);
                font-size: 12px;
                cursor: pointer;
                transition: background 0.15s;
            }
            #lg-tooltip .lg-revert-btn:hover { background: rgba(0,229,255,0.08); }
        `;
        document.head.appendChild(style);

        const tooltip = document.createElement('div');
        tooltip.id = 'lg-tooltip';
        document.body.appendChild(tooltip);

        let hideTimer: ReturnType<typeof setTimeout> | null = null;

        const showTooltip = (span: HTMLElement) => {
            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
            const original = span.dataset.lgOriginal || '';
            tooltip.innerHTML = `
                <div class="lg-orig-label">Original</div>
                <p class="lg-orig-text">${original}</p>
                <button class="lg-revert-btn">↩ Revert</button>
            `;
            tooltip.querySelector('.lg-revert-btn')!.addEventListener('click', () => {
                span.replaceWith(document.createTextNode(original));
                tooltip.classList.remove('lg-visible');
            });

            const rect = span.getBoundingClientRect();
            const tipW = 280;
            const left = Math.min(Math.max(8, rect.left + rect.width / 2 - tipW / 2), window.innerWidth - tipW - 8);
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${rect.top - 8}px`;
            tooltip.style.transform = 'translateY(-100%)';
            tooltip.classList.add('lg-visible');
        };

        const hideTooltip = () => {
            hideTimer = setTimeout(() => tooltip.classList.remove('lg-visible'), 200);
        };

        document.addEventListener('mouseover', (e) => {
            const span = (e.target as Element).closest('.lg-translated') as HTMLElement | null;
            if (span) showTooltip(span);
        });
        document.addEventListener('mouseout', (e) => {
            const span = (e.target as Element).closest('.lg-translated');
            if (span) hideTooltip();
        });
        tooltip.addEventListener('mouseenter', () => { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } });
        tooltip.addEventListener('mouseleave', hideTooltip);
    }

    range.deleteContents();
    const shimmer = document.createElement('span');
    shimmer.className = 'lg-shimmer';
    shimmer.style.width = `${Math.min(Math.max(60, text.length * 7), 300)}px`;
    range.insertNode(shimmer);
    window.getSelection()?.removeAllRanges();

    chrome.runtime.sendMessage({ type: 'TRANSLATE_SELECTION', text }, (response) => {
        if (response && response.success && response.translation) {
            const span = document.createElement('span');
            span.className = 'lg-translated';
            span.dataset.lgOriginal = text;
            span.textContent = response.translation;
            shimmer.replaceWith(span);
        } else {
            shimmer.replaceWith(document.createTextNode(text));
        }
    });
}

function showTranslationInSidebar(text: string) {
    createSidebarIfNeeded();
    const host = document.getElementById('linguastik-lens-host');
    if (!host || !host.shadowRoot) return;

    const leftSidebar = host.shadowRoot.querySelector('.sidebar-left');
    const content = host.shadowRoot.getElementById('translation-content');
    const toggleLeft = host.shadowRoot.getElementById('linguastik-toggle-left');

    if (leftSidebar && content) {
        leftSidebar.classList.add('visible');
        if (toggleLeft) toggleLeft.style.display = 'flex';

        content.innerHTML = `
            <div class="linguastik-popup-header">
                Translating...
            </div>
        `;

        const overlay = host.shadowRoot.getElementById('sidebarLeftTranslationOverlay');
        if (overlay) overlay.classList.add('active');

        chrome.runtime.sendMessage({ type: 'TRANSLATE_SELECTION', text }, (response) => {
            if (overlay) overlay.classList.remove('active');

            if (response && response.success) {
                const langName = getLangName(response.lang);
                content.innerHTML = `
                     <div class="translation-result">
                        <div class="translation-meta">
                            <span class="lang-tag">${langName}</span>
                        </div>
                        <p class="translated-text">${response.translation}</p>
                        <div class="original-text-preview">
                            <small>Original:</small>
                            <p>${text}</p>
                        </div>
                    </div>
                `;
            } else {
                content.innerHTML = `
                    <div class="error-message">
                        ${response?.error || "Failed to translate."}
                    </div>
                `;
            }
        });
    }
}

const LANG_MAP: Record<string, string> = {
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
    'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'zh': 'Chinese',
    'ja': 'Japanese', 'ko': 'Korean', 'hi': 'Hindi', 'ar': 'Arabic',
    'tr': 'Turkish', 'nl': 'Dutch', 'pl': 'Polish', 'sv': 'Swedish'
};

function getLangName(code: string): string {
    return LANG_MAP[code] || code.toUpperCase();
}

function updateRightToggleVisibility(query: string) {
    const host = document.getElementById('linguastik-lens-host');
    if (!host || !host.shadowRoot) return;
    const toggleBtn = host.shadowRoot.getElementById('linguastik-toggle-right') as HTMLElement | null;
    if (toggleBtn) {
        toggleBtn.style.display = query ? '' : 'none';
    }
}

function removeFloatingButton() {
    if (floatingBtn) {
        floatingBtn.remove();
        floatingBtn = null;
    }
}
