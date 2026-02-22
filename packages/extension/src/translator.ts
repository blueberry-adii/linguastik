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
                        "source": "auto",
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

    async translateHtml(html: string, targetLang: string): Promise<string | null> {
        const config = await configManager.load();
        const apiKey = config.lingoApiKey;

        if (!apiKey) return null;

        try {
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
                        "source": "auto",
                        "target": targetLang
                    },
                    "data": {
                        "html": html
                    }
                })
            });

            if (!response.ok) return null;

            const jsonResponse = await response.json();
            return jsonResponse.data?.html || null;

        } catch (e: any) {
            console.error('HTML translation failed:', e.message || e);
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


}

export const translator = new ExtensionTranslator();
