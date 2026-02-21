import { LingoDotDevEngine } from 'lingo.dev/sdk';
import { translationCache } from './cache.js';
import { configManager } from './config.js';

export class Translator {
    private lingo: LingoDotDevEngine;

    constructor() {
        const apiKey = configManager.getApiKey();
        this.lingo = new LingoDotDevEngine({
            apiKey: apiKey || 'dummy-key',
        });
    }

    public async translate(text: string): Promise<string> {
        const config = configManager.get();
        const sourceLang = 'auto';
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

            const translatedText = await this.lingo.localizeText(text, {
                sourceLocale: 'auto',
                targetLocale: targetLang,
            });

            translationCache.set(text, sourceLang, targetLang, translatedText);

            return translatedText;
        } catch (error) {
            return text;
        }
    }
}

export const translator = new Translator();