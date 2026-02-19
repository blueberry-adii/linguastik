import { spawn } from 'child_process';
import { translator } from '@linguastik/shared';
import { pLimit } from "@linguastik/shared";
import { format } from './formatter.js';
import { configManager } from '@linguastik/shared';

export async function execWithTranslation(command: string, args: string[]) {
    return new Promise<void>((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: ['inherit', 'pipe', 'pipe'],
            shell: false,
        });

        let stdoutBuffer = '';
        let stderrBuffer = '';

        const limit = pLimit(5);

        const targetLang = configManager.get().targetLang || 'en';

        const pendingTranslations: Promise<void>[] = [];

        const processLine = async (line: string, isStderr: boolean) => {
            try {
                const translated = await limit(() => translator.translate(line));
                const output = (translated && translated.trim().length > 0) ? translated : line;

                if (isStderr) {
                    process.stderr.write(output + '\n');
                } else {
                    process.stdout.write(output + '\n');
                }
            } catch (e) {
                if (isStderr) process.stderr.write(line + '\n');
                else process.stdout.write(line + '\n');
            }
        };

        const queueLine = (line: string, isStderr: boolean) => {
            if (!line.trim()) return;
            const p = processLine(line, isStderr);
            pendingTranslations.push(p);
        };

        child.stdout.on('data', (data) => {
            const chunk = data.toString();
            stdoutBuffer += chunk;
            if (stdoutBuffer.includes('\n')) {
                const lines = stdoutBuffer.split('\n');
                stdoutBuffer = lines.pop() || '';
                for (const line of lines) {
                    queueLine(line, false);
                }
            }
        });

        child.stderr.on('data', (data) => {
            const chunk = data.toString();
            stderrBuffer += chunk;
            if (stderrBuffer.includes('\n')) {
                const lines = stderrBuffer.split('\n');
                stderrBuffer = lines.pop() || '';
                for (const line of lines) {
                    queueLine(line, true);
                }
            }
        });

        child.on('close', async (code) => {
            if (stdoutBuffer) queueLine(stdoutBuffer, false);
            if (stderrBuffer) queueLine(stderrBuffer, true);
            await Promise.all(pendingTranslations);

            resolve();
            process.exit(code || 0);
        });

        child.on('error', (err) => {
            console.error('Failed to start process:', err);
            reject(err);
        });
    });
}