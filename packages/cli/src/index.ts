#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'module';
import { configManager, translator } from '@linguastik/shared';
import { execWithTranslation, execAndCapture } from './wrapper.js';
import { format } from './formatter.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program
    .name('lingo')
    .description('Wraps terminal commands and translates their output in real-time')
    .version(pkg.version);

program
    .option('-l, --lang <lang>', 'Target language code (e.g., es, ja, fr)')
    .option('-k, --key <key>', 'Set Lingo.dev API key')
    .option('-p, --precise', 'Run command and send full output to lingo.dev for an accurate, context-aware translation')
    .argument('[command...]', 'Command to run and translate')
    .allowUnknownOption(true)
    .passThroughOptions(true)
    .action(async (commandParts, options) => {
        if (options.key) {
            configManager.set('apiKey', options.key);
            console.log(format.success('API key updated successfully.'));
        }

        if (options.lang) {
            configManager.set('targetLang', options.lang);
            if (!commandParts || commandParts.length === 0) {
                console.log(format.success(`Target language set to: ${options.lang}`));
            }
        }

        if (!commandParts || commandParts.length === 0) {
            if (!options.key && !options.lang) {
                program.help();
            }
            return;
        }

        const command = commandParts[0];
        const args = commandParts.slice(1);

        if (!configManager.getApiKey()) {
            console.log(format.warn('Warning: No API key found. Translation will be disabled.'));
            console.log(format.info('Run `lingo --key <your-api-key>` to set it.'));
        }

        try {
            if (options.precise) {
                const { output, exitCode } = await execAndCapture(command, args);

                if (output.trim() && configManager.getApiKey()) {
                    const spinner = format.spinner('Analyzing output...').start();
                    const summary = await translator.summarize(output);
                    spinner.stop();

                    console.log('\n' + format.box('✦ Linguastik', summary, 'blue'));
                }

                process.exit(exitCode);
            } else {
                await execWithTranslation(command, args);
            }
        } catch (error: any) {
            console.error(format.error(`Execution failed: ${error.message || error}`));
            process.exitCode = 1;
            process.exit(1);
        }
    });

program.parse(process.argv);