import { spawn } from 'child_process';
import { translator } from '@linguastik/shared';
import { pLimit } from "@linguastik/shared";

export async function execWithTranslation(command: string, args: string[]) {
    return new Promise<void>((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: ['inherit', 'pipe', 'pipe'],
            shell: false,
        });

        let stdoutBuffer = '';
        let stderrBuffer = '';

        const limit = pLimit(5);

        let stdoutQueue = Promise.resolve();
        let stderrQueue = Promise.resolve();

        const processLine = (line: string, isStderr: boolean) => {
            const translationTask = limit(() => translator.translate(line));

            if (isStderr) {
                stderrQueue = stderrQueue.then(async () => {
                    try {
                        const result = await translationTask;
                        process.stderr.write(result + '\n');
                    } catch (err) {
                        process.stderr.write(line + '\n');
                    }
                });
            } else {
                stdoutQueue = stdoutQueue.then(async () => {
                    try {
                        const result = await translationTask;
                        process.stdout.write(result + '\n');
                    } catch (err) {
                        process.stdout.write(line + '\n');
                    }
                });
            }
        };

        child.on('close', async (code) => {
            await Promise.all([stdoutQueue, stderrQueue]);

            if (stdoutBuffer) {
                const translated = await translator.translate(stdoutBuffer);
                process.stdout.write(translated);
            }
            if (stderrBuffer) {
                const translated = await translator.translate(stderrBuffer);
                process.stderr.write(translated);
            }
            process.exit(code || 0);
        });

        child.on('error', (err) => {
            console.error('Failed to start process:', err);
            reject(err);
        });
    });
}