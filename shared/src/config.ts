import * as os from 'os';
import * as path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const CONFIG_DIR = path.join(os.homedir(), '.lingo-dev');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const ConfigSchema = z.object({
    apiKey: z.string().optional(),
    targetLang: z.string().default('en'),
});

type Config = z.infer<typeof ConfigSchema>;

const defaultConfig: Config = {
    targetLang: 'en',
};

export class ConfigManager {
    private config: Config;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): Config {
        if (process.env.LINGO_API_KEY) {
            return {
                ...defaultConfig,
                apiKey: process.env.LINGO_API_KEY,
                targetLang: process.env.LINGO_TARGET_LANG || defaultConfig.targetLang,
            };
        }

        if (fs.existsSync(CONFIG_FILE)) {
            try {
                const fileContent = fs.readFileSync(CONFIG_FILE, 'utf-8');
                const parsed = JSON.parse(fileContent);
                return ConfigSchema.parse({ ...defaultConfig, ...parsed });
            } catch (error) {
                console.warn('Failed to load config file, using defaults:', error);
            }
        }

        return defaultConfig;
    }
}