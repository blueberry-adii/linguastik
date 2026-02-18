import { fetchSearchResults } from './searcher';
import { aggregateResults } from './aggregator';

import { translator } from './translator';
import { configManager } from './shims/config';

console.log('Linguastik Lens Background Service Started');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'NEW_SEARCH') {
        if (sender.tab?.id) {
            handleSearch(message.query, sender.tab.id)
                .catch(err => {
                    console.error('Search handling error:', err);
                    chrome.tabs.sendMessage(sender.tab!.id!, {
                        type: 'SEARCH_ERROR',
                        error: err.message
                    });
                });
        } else {
            console.warn('Received NEW_SEARCH without tab ID');
        }
        return true;
    } else if (message.type === 'TRANSLATE_SELECTION') {
        handleQuickTranslation(message.text)
            .then(result => sendResponse({ success: true, ...result }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }
});

async function handleQuickTranslation(text: string) {
    const config = await configManager.load();
    const targetLang = config.userLanguage || 'en';
    const translation = await translator.translate(text, targetLang);
    return { translation, lang: targetLang };
}

async function handleSearch(query: string, tabId: number) {
    console.log(`Processing search: "${query}"`);

    try {
        const config = await configManager.load();
        /* 
        console.log('Background Loaded Config:', {
            hasSerper: !!config.serperApiKey,
            // serperKeyStart: config.serperApiKey ? config.serperApiKey.substring(0, 4) + '...' : 'MISSING',
            hasLingo: !!config.lingoApiKey,
            // lingoKeyStart: config.lingoApiKey ? config.lingoApiKey.substring(0, 4) + '...' : 'MISSING',
            lang: config.userLanguage
        }); 
        */
        const userLang = config.userLanguage || 'es';
        const preferredLang = config.preferredLanguage || 'auto';

        const detectedLang = await translator.detectLanguage(query);
        console.log(`Detected Query Language: ${detectedLang}`);

        const outputLang = (preferredLang === 'auto' ? detectedLang : preferredLang) || 'en';
        console.log(`Output Language: ${outputLang} (Preferred: ${preferredLang})`);

        console.log('Determining relevant regions...');
        let regions = await translator.determineRelevantLanguages(query, userLang);
        console.log('Target Regions:', regions);

        regions = regions.slice(0, 3);

        const translatedQueries = await Promise.all(
            regions.map(r => translator.translate(query, r.lang))
        );

        console.log('Translated queries:', translatedQueries);
        const searchPromises = regions.map((r, index) => {
            const translatedQuery = translatedQueries[index];
            const finalQuery = translatedQuery || query;
            if (!translatedQuery) {
                console.warn(`Translation failed for ${r.lang}, falling back to original: "${query}"`);
            }
            return fetchSearchResults(finalQuery, r.lang, r.country);
        });

        const searchResults = await Promise.all(searchPromises);
        const resultsMap: Record<string, any> = {};
        regions.forEach((r, i) => {
            resultsMap[r.lang] = searchResults[i];
        });

        const aggregated = aggregateResults(resultsMap);

        console.log(`Translating top results to ${outputLang}...`);
        const topResultsToTranslate = aggregated.combined.slice(0, 5);

        await Promise.all(topResultsToTranslate.map(async (result, idx) => {
            try {
                console.log(`[Translate Source ${idx}] Original: "${result.title}"`);
                const translatedTitle = await translator.translate(result.title, outputLang);
                console.log(`[Translate Source ${idx}] Translated: "${translatedTitle}"`);

                if (translatedTitle) {
                    result.title = translatedTitle;
                }
            } catch (e) {
                console.warn(`[Translate Source ${idx}] Failed:`, e);
            }
        }));

        console.log('Top results after translation:', aggregated.combined.slice(0, 5).map(r => r.title));

        const topSnippets = aggregated.combined.slice(0, 5).map(r => r.snippet);
        let summary = "Summary unavailable.";
        try {
            summary = await translator.generateSummary(topSnippets, outputLang);
        } catch (error: any) {
            console.error('Summary generation failed:', error);
            if (error.message.includes('Lingo API Key is missing')) {
                summary = "⚠️ Lingo API Key is missing. Please set it in the extension settings to enable summaries.";
            } else {
                summary = "⚠️ Failed to generate summary. Please check your Lingo API Key.";
            }
        }

        chrome.tabs.sendMessage(tabId, {
            type: 'SEARCH_RESULTS',
            data: {
                query,
                detectedLang,
                results: aggregated,
                summary,
                regions
            }
        });
    } catch (error: any) {
        console.error('Orchestration failed:', error);
        chrome.tabs.sendMessage(tabId, {
            type: 'SEARCH_ERROR',
            error: error.message
        });
    }
}
