import { configManager } from './shims/config';

const LINGO_API_URL = "https://engine.lingo.dev";

export class ExtensionTranslator {

    async translate(text: string, targetLang: string): Promise<string | null> {
        const config = await configManager.load();
        const apiKey = config.lingoApiKey;

        if (!apiKey) {
            console.error('Lingo API Key missing in translate() call');
            return null;
        }

        try {
            console.log(`Calling Lingo API: ${LINGO_API_URL}/i18n`);

            const response = await fetch(`${LINGO_API_URL}/i18n`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "params": {
                        "workflowId": crypto.randomUUID(),
                        "fast": true
                    },
                    "locale": {
                        "source": null,
                        "target": targetLang
                    },
                    "data": {
                        "text": text
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            const jsonResponse = await response.json();
            return jsonResponse.data?.text || null;

        } catch (e: any) {
            console.error('Translation failed:', e.message || e);
            return null;
        }
    }

    async detectLanguage(text: string): Promise<string> {
        const config = await configManager.load();
        const apiKey = config.lingoApiKey;

        if (!apiKey) return 'en';

        try {
            const response = await fetch(`${LINGO_API_URL}/recognize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) return 'en';

            const data = await response.json();
            return data.locale || 'en';
        } catch (e) {
            console.error('Language detection failed:', e);
            return 'en';
        }
    }

    async generateSummary(texts: string[], targetLang: string): Promise<string> {
        const combined = texts.slice(0, 3).join("\n\n");
        const translation = await this.translate(combined, targetLang);
        return translation || "Summary unavailable (Translation failed).";
    }

    async determineRelevantLanguages(query: string, userLang: string = 'en'): Promise<{ lang: string, country: string }[]> {
        const detectedLang = await this.detectLanguage(query);
        console.log(`Lingo Detected Language for "${query}": ${detectedLang}`);

        const explicitLang = this.detectExplicitLanguage(query);
        if (explicitLang) {
            console.log(`Explicit Language Requested: ${explicitLang}`);
        }

        const langs = new Set<string>();

        if (explicitLang) langs.add(explicitLang);

        if (detectedLang && detectedLang !== 'en') langs.add(detectedLang);

        if (userLang && userLang !== 'en') langs.add(userLang);

        langs.add('en');

        const regions: { lang: string, country: string }[] = [];
        const LANGUAGE_TO_COUNTRY: Record<string, string> = {
            'en': 'us',
            'ja': 'jp',
            'hi': 'in',
            'es': 'es',
            'fr': 'fr',
            'de': 'de',
            'it': 'it',
            'pt': 'br',
            'ru': 'ru',
            'zh': 'cn',
            'ko': 'kr',
            'ar': 'sa'
        };

        for (const lang of langs) {
            regions.push({
                lang: lang,
                country: LANGUAGE_TO_COUNTRY[lang] || 'us'
            });
        }

        return regions.slice(0, 3);
    }

    private detectExplicitLanguage(query: string): string | null {
        const lower = query.toLowerCase();
        if (lower.includes('in hindi')) return 'hi';
        if (lower.includes('in japanese')) return 'ja';
        if (lower.includes('in spanish')) return 'es';
        if (lower.includes('in french')) return 'fr';
        if (lower.includes('in german')) return 'de';
        if (lower.includes('in italian')) return 'it';
        if (lower.includes('in portuguese')) return 'pt';
        if (lower.includes('in russian')) return 'ru';
        if (lower.includes('in chinese')) return 'zh';
        if (lower.includes('in korean')) return 'ko';
        if (lower.includes('in arabic') || lower.includes('arabic')) return 'ar';
        return null;
    }
}

export const translator = new ExtensionTranslator();
