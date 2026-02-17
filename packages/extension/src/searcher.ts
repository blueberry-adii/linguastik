import { configManager } from './shims/config';

const SERPER_API_URL = "https://google.serper.dev/search";

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    displayUrl: string;
    language: string;
}

export async function fetchSearchResults(query: string, language: string, googleDomain: string): Promise<SearchResult[]> {
    const config = await configManager.load();
    const apiKey = config.serperApiKey;

    if (!apiKey) {
        throw new Error('Serper API Key is missing. Please set it in the extension settings.');
    }

    const body = {
        q: query,
        gl: googleDomain,
        hl: language,
        num: 5
    };

    try {
        const response = await fetch(SERPER_API_URL, {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Serper Error: ${await response.text()}`);
        }
        const data = await response.json();

        return (data.organic || []).map((result: any) => ({
            title: result.title,
            url: result.link,
            snippet: result.snippet,
            displayUrl: result.link,
            language: language,
        }));
    } catch (error: any) {
        console.error('Search fetch failed:', error);
        throw new Error(`Search failed for \${language}: \${error.message}`);
    }
}

function getCountryCode(language: string) {
    const map: Record<string, string> = {
        en: "us",
        ja: "jp",
        de: "de",
        fr: "fr",
        es: "es",
    };
    return map[language] || "us";
}
