export const styles = `
:host {
    all: initial;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 380px;
    height: 100vh;
    background: #0F0F12;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    color: #E2E2E2;
    z-index: 2147483647;
    box-shadow: -10px 0 30px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateX(100%);
    backdrop-filter: blur(10px);
}

.sidebar.visible {
    transform: translateX(0);
}

/* Toggle Button */
.toggle-btn {
    position: fixed;
    top: 120px;
    right: 0;
    background: #0F0F12;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-right: none;
    color: #00E5FF;
    padding: 10px 8px;
    border-radius: 8px 0 0 8px;
    cursor: pointer;
    z-index: 2147483646;
    box-shadow: -2px 0 10px rgba(0,0,0,0.3);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateX(0);
}

.toggle-btn:hover {
    padding-right: 12px;
    background: rgba(15, 15, 18, 0.95);
}

/* Hide button when sidebar is visible */
.sidebar.visible ~ .toggle-btn {
    transform: translateX(100%);
}

.toggle-btn svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
}

/* Header */
header {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(15, 15, 18, 0.8);
}

header h1 {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

header h1 svg {
    width: 20px;
    height: 20px;
    fill: #00E5FF;
}

.close-btn {
    background: transparent;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 20px;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
    line-height: 1;
}

.close-btn:hover {
    color: #fff;
    background: rgba(255,255,255,0.1);
}


/* Region Tags */
.region-tags {
    display: flex;
    gap: 6px;
    align-items: center;
}

.region-tag {
    font-size: 9px;
    background: rgba(0, 229, 255, 0.1);
    color: #00E5FF;
    border: 1px solid rgba(0, 229, 255, 0.2);
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
}

/* Content Area */
#result-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    scrollbar-width: thin;
    scrollbar-color: #333 transparent;
}

#result-content::-webkit-scrollbar {
    width: 6px;
}

#result-content::-webkit-scrollbar-thumb {
    background-color: #333;
    border-radius: 3px;
}

/* Sections */
section {
    margin-bottom: 24px;
    animation: fadeIn 0.4s ease-out;
}

h2 {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #666;
    margin: 0 0 12px 0;
    font-weight: 600;
}

/* Summary Box */
.summary-card {
    background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 16px;
    font-size: 14px;
    line-height: 1.6;
    color: #EEE;
    position: relative;
    overflow: hidden;
}

.summary-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.5), transparent);
}

/* Insights */
.insight-card {
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    display: flex;
    gap: 12px;
    border-left: 2px solid transparent;
}

.insight-card.highlight { border-left-color: #00E5FF; }
.insight-card.warning { border-left-color: #FFAB00; }
.insight-card.info { border-left-color: #2979FF; }

.insight-flag { font-size: 18px; }
.insight-text { font-size: 13px; color: #CCC; line-height: 1.4; }

/* Sources */
.source-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.source-item {
    display: block;
    text-decoration: none;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    padding: 10px;
    border-radius: 8px;
    transition: all 0.2s;
}

.source-item:hover {
    background: rgba(255,255,255,0.06);
    transform: translateY(-1px);
    border-color: rgba(255,255,255,0.1);
}

.source-title {
    font-size: 13px;
    color: #4FB3D9;
    font-weight: 500;
    margin-bottom: 4px;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.source-meta {
    font-size: 11px;
    color: #666;
    display: flex;
    justify-content: space-between;
}

/* Loader */
.loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    gap: 16px;
    color: #666;
}

.spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255,255,255,0.1);
    border-top-color: #00E5FF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes popIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

/* Floating Translate Button */
.linguastik-floating-btn {
    position: absolute;
    z-index: 2147483647;
    background: #0F0F12;
    border: 1px solid rgba(0, 229, 255, 0.3);
    border-radius: 8px;
    padding: 6px 10px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 6px;
    color: #00E5FF;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: auto;
}

.linguastik-floating-btn:hover {
    background: rgba(15, 15, 18, 0.75);
    border-color: rgba(0, 229, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.linguastik-floating-btn svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
}
/* Floating Popup */
.linguastik-popup {
    position: absolute;
    z-index: 2147483647;
    background: #0F0F12;
    border: 1px solid rgba(0, 229, 255, 0.3);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    color: #E2E2E2;
    font-size: 14px;
    min-width: 200px;
    max-width: 300px;
    animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.linguastik-popup-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}

.linguastik-popup-content {
    line-height: 1.5;
    color: #FFF;
}

.linguastik-popup-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.1);
    border-top-color: #00E5FF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Left Sidebar for Quick Translations */
.sidebar-left {
    position: fixed;
    top: 0;
    left: 0;
    width: 380px;
    height: 100vh;
    background: #0F0F12;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    color: #E2E2E2;
    z-index: 2147483647;
    box-shadow: 10px 0 30px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateX(-100%);
    backdrop-filter: blur(10px);
}

.sidebar-left.visible {
    transform: translateX(0);
}

/* Left Toggle Button */
.toggle-btn-left {
    position: fixed;
    top: 120px;
    left: 0;
    background: #0F0F12;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-left: none;
    color: #00E5FF;
    padding: 10px 8px;
    border-radius: 0 8px 8px 0;
    cursor: pointer;
    z-index: 2147483646;
    box-shadow: 2px 0 10px rgba(0,0,0,0.3);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: none; /* Hidden by default until used */
    align-items: center;
    justify-content: center;
    transform: translateX(0);
}

.toggle-btn-left:hover {
    padding-left: 12px;
    background: rgba(15, 15, 18, 0.95);
}

.sidebar-left.visible ~ .toggle-btn-left {
    transform: translateX(-100%);
}

.toggle-btn-left svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
}
`;
