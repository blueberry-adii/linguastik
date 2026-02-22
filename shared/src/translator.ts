import { LingoDotDevEngine } from 'lingo.dev/sdk';
import { translationCache } from './cache.js';
import { configManager } from './config.js';

const SIMPLE_MODE_HINTS = [
    'Keep the translation short and concise',
    'Summarize long or complex lines into a brief phrase',
    'Prefer plain, everyday words over technical jargon',
];

export class Translator {
    private lingo: LingoDotDevEngine;
    private simpleMode: boolean = false;

    constructor() {
        const apiKey = configManager.getApiKey();
        this.lingo = new LingoDotDevEngine({
            apiKey: apiKey || 'dummy-key',
        });
    }

    public setSimpleMode(enabled: boolean) {
        this.simpleMode = enabled;
    }

    public async translate(text: string): Promise<string> {
        const config = configManager.get();
        const sourceLang = 'en';
        const targetLang = config.targetLang;

        const cached = translationCache.get(text, sourceLang, targetLang);
        if (cached) {
            return cached;
        }

        try {
            if (!text.trim() || text.length < 2) {
                return text;
            }

            if (!configManager.getApiKey()) {
                return text;
            }

            const params: Parameters<typeof this.lingo.localizeText>[1] = {
                sourceLocale: 'en',
                targetLocale: targetLang,
                ...(this.simpleMode ? { hints: { text: SIMPLE_MODE_HINTS } } : {}),
            };

            const translatedText = await this.lingo.localizeText(text, params);

            translationCache.set(text, sourceLang, targetLang, translatedText);

            return translatedText;
        } catch (error) {
            return text;
        }
    }

    public async summarize(fullOutput: string, targetLang?: string): Promise<string> {
        const config = configManager.get();
        const lang = targetLang || config.targetLang || 'en';

        if (!configManager.getApiKey() || !fullOutput.trim()) {
            return fullOutput;
        }

        try {
            const result = await this.lingo.localizeText(fullOutput, {
                sourceLocale: 'en',
                targetLocale: lang,
                hints: {
                    text: [
                        'This is raw terminal command output. Do not translate command names, flags, or file paths.',
                        'Summarize what this command output means in plain language.',
                        'Explain what the command did and what the output tells the user.',
                        'Don\'t cause confusion and don\'t skip important parts, being to the point is ideal.',
                    ],
                },
            });
            return result || fullOutput;
        } catch {
            return fullOutput;
        }
    }
}

export const translator = new Translator();