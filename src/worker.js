import {
    IIE,
    DIP,
    B64IE,
    TDCCC,
    TBCCC,
    CE,
    AE,
    FM,
    URL_,
    S,
    SR,
    EP,
    B64P,
    OE,
    LZS,
    AXOR,
} from './core.js';

const map = {
    IIE,
    DIP,
    B64IE,
    TDCCC,
    TBCCC,
    CE,
    AE,
    FM,
    URL_,
    S,
    SR,
    EP,
    B64P,
    OE,
    LZS,
    AXOR
};

let port;

const isNode =
    typeof process !== 'undefined' &&
    process.versions &&
    process.versions.node;

if (isNode) {
    const { parentPort } = await import('node:worker_threads');
    port = parentPort;
} else {
    port = self;
}

port.onmessage = async (e) => {
    const { candidate, context } = e.data;

    try {
        const fn = map[candidate];

        if (!fn) {
            port.postMessage({ result: null });
            return;
        }

        const ctx = {
            ...context,
            opts: {
                ...context.opts,
                worker: context.opts.worker + 1
            }
        };

        const result = await fn(ctx);

        port.postMessage({ result });
    } catch {
        port.postMessage({ result: null });
    }
};
