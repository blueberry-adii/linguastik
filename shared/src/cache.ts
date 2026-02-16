import NodeCache from 'node-cache';
import * as crypto from 'crypto';

export class TranslationCache {
    private memoryCache: NodeCache;

    constructor(ttlSeconds: number = 3600) {
        this.memoryCache = new NodeCache({ stdTTL: ttlSeconds });
        this.ensureCacheDirs();
    }

    private getHash(text: string, sourceLang: string, targetLang: string): string {
        return crypto
            .createHash('md5')
            .update(`${text}:${sourceLang}:${targetLang}`)
            .digest('hex');
    }
}