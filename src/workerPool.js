let WorkerImpl = null;
let maxWorkers = 4;

const isNode =
    typeof process !== 'undefined' &&
    process.versions &&
    process.versions.node;

async function init() {
    if (WorkerImpl) return;

    if (isNode) {
        const os = await import('node:os');
        const wt = await import('node:worker_threads');
        WorkerImpl = wt.Worker;
        maxWorkers = os.cpus()?.length || 4;
    } else if (typeof Worker !== 'undefined') {
        WorkerImpl = Worker;
        maxWorkers = navigator.hardwareConcurrency || 4;
    }
}

export async function canUseWorkers() {
    await init();
    return !!WorkerImpl;
}

export async function runInWorkers(candidateNames, context) {
    await init();

    const queue = [...candidateNames];
    const results = [];
    let active = 0;

    return new Promise((resolve) => {
        function next() {
            if (!queue.length && active === 0) {
                resolve(results);
                return;
            }

            while (active < maxWorkers && queue.length) {
                const name = queue.shift();

                const worker = new WorkerImpl(
                    new URL('./candidateWorker.js', import.meta.url),
                    { type: 'module' }
                );

                active++;

                worker.onmessage = (e) => {
                    results.push(e.data?.result ?? null);
                    worker.terminate();
                    active--;
                    next();
                };

                worker.onerror = () => {
                    results.push(null);
                    worker.terminate();
                    active--;
                    next();
                };

                worker.postMessage({
                    candidate: name,
                    context
                });
            }
        }

        next();
    });
}
