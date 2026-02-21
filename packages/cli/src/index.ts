#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'module';
import { configManager, explainer } from '@linguastik/shared';
import { execWithTranslation } from './wrapper.js';
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
    .option('--explain', 'Explain any errors encountered')
    .argument('[command...]', 'Command to run and translate')
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

        let capturedStderr = '';
        try {
            if (options.explain) {
                const originalStderrWrite = process.stderr.write;
                process.stderr.write = function (chunk: any, encoding?: any, cb?: any): boolean {
                    capturedStderr += chunk.toString();
                    return originalStderrWrite.call(process.stderr, chunk, encoding, cb);
                } as any;
            }
            await execWithTranslation(command, args);
        }
        catch (error: any) {
            if (options.explain && error.message) {
                capturedStderr += '\n' + error.message;
            }
            console.error(format.error(`Execution failed: ${error.message || error}`));
            process.exitCode = 1;
        } finally {
            if (options.explain && capturedStderr) {
                console.log('\n--- Error Explanation ---\n');
                const explanation = await explainer.explain(capturedStderr);
                if (explanation) {
                    const severityColor = explanation.severity === 'error' ? 'red' :
                        explanation.severity === 'warning' ? 'yellow' : 'blue';

                    const content = `
${format.dim(`Tool: ${explanation.tool}`)}
${format.error(`Problem: ${explanation.problem}`)}

${explanation.causes && explanation.causes.length > 0 ? format.dim('Possible causes:') + '\n' + explanation.causes.map((c: string) => `  - ${c}`).join('\n') : ''}

${explanation.fixes && explanation.fixes.length > 0 ? format.success('Suggested fixes:') + '\n' + explanation.fixes.map((f: string) => `  - ${f}`).join('\n') : ''}

${explanation.learnMoreUrl ? format.dim(`Learn more: ${explanation.learnMoreUrl}`) : ''}
                    `.trim();

                    console.log(format.box(`[${explanation.severity.toUpperCase()}] ${explanation.title}`, content, severityColor));
                } else {
                    console.log(format.dim('No specific error pattern matched for explanation.'));
                }
            }

            if (process.exitCode) {
                process.exit(process.exitCode);
            }
        }
    });

program.parse(process.argv);