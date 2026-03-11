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

export async function runInWorkers(candidateNames, context, workerURL, custom = false) {
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
                    (
                        custom ? new URL(workerURL) : 
                        new URL(workerURL, import.meta.url)
                    ), {
                        type: 'module'
                    }
                );

                active++;

                const finish = (result) => {
                    results.push(result ?? null);
                    worker.terminate();
                    active--;
                    next();
                };

                if (isNode) {
                    worker.on('message', (msg) => {
                        finish(msg?.result);
                    });

                    worker.on('error', () => {
                        finish(null);
                    });
                } else {
                    worker.onmessage = (e) => {
                        finish(e.data?.result);
                    };

                    worker.onerror = () => {
                        finish(null);
                    };
                }

                worker.postMessage({
                    candidate: name,
                    context
                });
            }
        }

        next();
    });
}

export const workerURL = './worker.js';
export const workerMin = './worker.min.js';
