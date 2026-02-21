export interface LinguastikConfig {
    serperApiKey?: string;
    lingoApiKey?: string;
    geminiApiKey?: string;
    foreignLanguage?: string;
    userLanguage?: string;
    enabled?: boolean;
}

const defaultConfig: LinguastikConfig = {
    serperApiKey: '',
    lingoApiKey: '',
    geminiApiKey: '',
    foreignLanguage: 'en',
    userLanguage: 'auto',
    enabled: true
};

export class ConfigManager {
    private config: LinguastikConfig = { ...defaultConfig };

    constructor() { }

    public get() {
        return this.config;
    }

    public async load(): Promise<LinguastikConfig> {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['serperApiKey', 'lingoApiKey', 'geminiApiKey', 'foreignLanguage', 'userLanguage', 'enabled'], (items) => {
                // console.log('Config Shim Loaded Items:', items); // REMOVED FOR SECURITY
                this.config = {
                    ...defaultConfig,
                    serperApiKey: items.serperApiKey || process.env.SERPER_API_KEY || '',
                    lingoApiKey: items.lingoApiKey || process.env.LINGO_API_KEY || '',
                    geminiApiKey: items.geminiApiKey || process.env.GEMINI_API_KEY || '',
                    foreignLanguage: items.foreignLanguage || defaultConfig.foreignLanguage,
                    userLanguage: items.userLanguage || defaultConfig.userLanguage,
                    enabled: items.enabled !== undefined ? items.enabled : defaultConfig.enabled
                };
                resolve(this.config);
            });
        });
    }

    public set(key: string, value: any) {
        (this.config as any)[key] = value;
        chrome.storage.sync.set({ [key]: value });
    }
}

export const configManager = new ConfigManager();
