export class TranslationCache {
    constructor(ttlSeconds: number = 3600) {

    }

    private getHash(text: string, sourceLang: string, targetLang: string): Promise<string> {
        const msg = `${text}:${sourceLang}:${targetLang}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(msg);
        return crypto.subtle.digest('SHA-256', data).then(hash => {
            return Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        });
    }

    public get(text: string, sourceLang: string, targetLang: string): string | null {
        return null;
    }

    public set(text: string, sourceLang: string, targetLang: string, translation: string) {
        this.getHash(text, sourceLang, targetLang).then(hash => {
            const key = `cache_${hash}`;
            chrome.storage.local.set({
                [key]: {
                    translation,
                    timestamp: Date.now()
                }
            });
        });
    }
}

export const translationCache = new TranslationCache();
