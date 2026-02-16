import NodeCache from 'node-cache';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';

const CACHE_DIR = path.join(os.homedir(), '.lingo-dev', 'cache');
const TRANSLATIONS_DIR = path.join(CACHE_DIR, 'translations');

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

    private ensureCacheDirs() {
        if (!fs.existsSync(TRANSLATIONS_DIR)) {
            fs.mkdirSync(TRANSLATIONS_DIR, { recursive: true });
        }
    }

    private getFilePath(hash: string): string {
        const shard = hash.substring(0, 2);
        const shardDir = path.join(TRANSLATIONS_DIR, shard);
        if (!fs.existsSync(shardDir)) {
            fs.mkdirSync(shardDir, { recursive: true });
        }
        return path.join(shardDir, `${hash}.json`);
    }
}