import { AggregatedResults } from '../aggregator';


export function renderSidebar(data: {
    query: string;
    summary: string;
    results: AggregatedResults
}): string {
    const sourcesHtml = data.results.combined.slice(0, 5).map(r => `
        <a href="${r.url}" target="_blank" class="source-item">
            <span class="source-title">${r.title}</span>
            <div class="source-meta">
                <span>${new URL(r.url).hostname}</span>
            </div>
        </a>
    `).join('');

    return `
        <section>
            <h2>Analysis</h2>
            <div class="summary-card">
                ${data.summary}
            </div>
        </section>

        <section>
            <h2>Top Sources</h2>
            <div class="source-list">
                ${sourcesHtml}
            </div>
        </section>
        
        <div style="margin-top: 24px; text-align: center; opacity: 0.3; font-size: 10px;">
            Powered by Lingo.dev & Serper
        </div>
    `;
}

export function renderLoading(query: string): string {
    return `
        <div class="loader">
            <div class="spinner"></div>
            <div>Analyzing multiple languages...</div>
            <div style="font-size: 12px; color: #444;">"${query}"</div>
        </div>
    `;
}

export function renderError(message: string): string {
    return `
        <div style="padding: 24px; text-align: center; color: #ff6b6b;">
            <div style="font-size: 24px; margin-bottom: 12px;">⚠️</div>
            <div>${message}</div>
            <div style="margin-top: 12px; font-size: 12px; color: #666;">Check your API keys in settings.</div>
        </div>
    `;
}
