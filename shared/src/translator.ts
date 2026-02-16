import { LingoDotDevEngine } from 'lingo.dev/sdk';
import { configManager } from './config.js';

export class Translator {
    private lingo: LingoDotDevEngine;

    constructor() {
        const apiKey = configManager.getApiKey();
        this.lingo = new LingoDotDevEngine({
            apiKey: apiKey || 'dummy-key',
        });
    }
}