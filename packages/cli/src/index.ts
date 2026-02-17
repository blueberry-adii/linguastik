#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'module';
import { configManager } from '@linguastik/shared';
import { execWithTranslation } from './wrapper.js';
import { format } from './formatter.js';
import { explainer } from '@linguastik/shared';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program
    .name('lingo-dev')
    .description('Wraps terminal commands and translates their output in real-time')
    .version(pkg.version);

program
    .option('-l, --lang <lang>', 'Target language code (e.g., es, ja, fr)')
    .option('-k, --key <key>', 'Set Lingo.dev API key')
    .option('--explain', 'Explain any errors encountered')
    .argument('[command...]', 'Command to run and translate')