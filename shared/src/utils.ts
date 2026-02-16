export function pLimit(concurrency: number) {
    const queue: (() => void)[] = [];
    let activeCount = 0;

    const next = () => {
        activeCount--;
        if (queue.length > 0) {
            queue.shift()!();
        }
    };

    const run = async <T>(fn: () => Promise<T>): Promise<T> => {
        activeCount++;
        const result = await fn();
        next();
        return result;
    };

    const enqueue = <T>(fn: () => Promise<T>): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
            const runTask = async () => {
                try {
                    resolve(await run(fn));
                } catch (err) {
                    reject(err);
                }
            };

            if (activeCount < concurrency) {
                runTask();
            } else {
                queue.push(runTask);
            }
        });
    };

    return enqueue;
}
