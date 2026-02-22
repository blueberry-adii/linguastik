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

        let spinner = format.spinner(`Running ${command}...`).start();

        type QueueEntry = {
            isStderr: boolean;
            result: string | null;
        };

        const outputQueue: QueueEntry[] = [];
        let nextToPrint = 0;

        const pendingTranslations: Promise<void>[] = [];

        const flushQueue = () => {
            while (nextToPrint < outputQueue.length && outputQueue[nextToPrint].result !== null) {
                const entry = outputQueue[nextToPrint];
                spinner.stop();
                if (entry.isStderr) {
                    process.stderr.write(entry.result! + '\n');
                } else {
                    process.stdout.write(entry.result! + '\n');
                }
                nextToPrint++;
            }
            if (child.exitCode === null && nextToPrint < outputQueue.length) {
                spinner.start('Translating...');
            }
        };

        const queueLine = (line: string, isStderr: boolean) => {
            if (!line.trim()) return;

            const index = outputQueue.length;
            outputQueue.push({ isStderr, result: null });

            const p = limit(async () => {
                try {
                    const translated = await translator.translate(line);
                    outputQueue[index].result = (translated && translated.trim().length > 0) ? translated : line;
                } catch {
                    outputQueue[index].result = line;
                }
                flushQueue();
            });

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

            if (!spinner.isSpinning) spinner.start('Finishing translations...');

            await Promise.all(pendingTranslations);

            spinner.stop();

            resolve();
            process.exit(code || 0);
        });

        child.on('error', (err) => {
            spinner.stop();
            console.error('Failed to start process:', err);
            reject(err);
        });
    });
}

export async function execAndCapture(command: string, args: string[]): Promise<{ output: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: ['inherit', 'pipe', 'pipe'],
            shell: false,
        });

        let captured = '';

        child.stdout.on('data', (data) => {
            const chunk = data.toString();
            captured += chunk;
            process.stdout.write(chunk);
        });

        child.stderr.on('data', (data) => {
            const chunk = data.toString();
            captured += chunk;
            process.stderr.write(chunk);
        });

        child.on('close', (code) => {
            resolve({ output: captured, exitCode: code || 0 });
        });

        child.on('error', (err) => {
            reject(err);
        });
    });
}