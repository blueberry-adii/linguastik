import { SearchResult } from './searcher';

export interface AggregatedResults {
    en: SearchResult[];
    ja: SearchResult[];
    de: SearchResult[];
    combined: SearchResult[];
}

export function aggregateResults(results: Record<string, SearchResult[]>): AggregatedResults {
    const values = Object.values(results);
    const combined: SearchResult[] = [];
    const maxLen = values.length > 0 ? Math.max(...values.map(v => v.length)) : 0;

    for (let i = 0; i < maxLen; i++) {
        for (const list of values) {
            if (i < list.length) {
                combined.push(list[i]);
            }
        }
    }

    return {
        en: results['en'] || [],
        ja: results['ja'] || [],
        de: results['de'] || [],
        combined: combined
    };
}
