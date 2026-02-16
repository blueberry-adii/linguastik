import NodeCache from 'node-cache';

export class TranslationCache {
    private memoryCache: NodeCache;

    constructor(ttlSeconds: number = 3600) {
        this.memoryCache = new NodeCache({ stdTTL: ttlSeconds });
        this.ensureCacheDirs();
    }
}