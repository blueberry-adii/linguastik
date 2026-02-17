import { pLimit } from "@linguastik/shared";

export async function execWithTranslation(command: string, args: string[]) {
    return new Promise<void>((resolve, reject) => {
        let stdoutBuffer = '';
        let stderrBuffer = '';

        const limit = pLimit(5);

        let stdoutQueue = Promise.resolve();
        let stderrQueue = Promise.resolve();
    });
}