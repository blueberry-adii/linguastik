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

    public get(text: string, sourceLang: string, targetLang: string): string | null {
        const hash = this.getHash(text, sourceLang, targetLang);

        const cached = this.memoryCache.get<string>(hash);
        if (cached) {
            return cached;
        }

        const filePath = this.getFilePath(hash);
        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const data = JSON.parse(content);
                this.memoryCache.set(hash, data.translation);
                return data.translation;
            } catch (err) {
                console.error('Error reading cache file:', err);
            }
        }

        return null;
    }

    public set(text: string, sourceLang: string, targetLang: string, translation: string) {
        const hash = this.getHash(text, sourceLang, targetLang);

        this.memoryCache.set(hash, translation);

        const filePath = this.getFilePath(hash);
        try {
            fs.writeFileSync(
                filePath,
                JSON.stringify({
                    original: text,
                    translation,
                    sourceLang,
                    targetLang,
                    timestamp: Date.now(),
                })
            );
        } catch (err) {
            console.error('Error writing cache file:', err);
        }
    }
}

export const translationCache = new TranslationCache();