import { prefix } from "../lib/meta.js";

export const validateCache = new Map();
let maxCache = 5000;

function isMemHigh() {
    const threshold = 0.9;
    if (typeof process !== 'undefined' && process.memoryUsage) {
        const { heapUsed, heapTotal } = process.memoryUsage();
        return heapUsed / heapTotal > threshold;
    } else if (performance && performance.memory) {
        const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
        return usedJSHeapSize / totalJSHeapSize > threshold;
    }
    return false;
}

function clear(warn = true) {
    validateCache.clear();
    if (warn && typeof process !== 'undefined') console.warn(prefix+'Memory high, cache cleared');
}

export function setCache(key, value) {
    if (validateCache.size > maxCache) {
        const firstKey = validateCache.keys().next().value;
        validateCache.delete(firstKey);
    }
    validateCache.set(key, value);
    if (isMemHigh()) clear();
}

export function setMaxCache(number) {
    if (typeof number != 'number') throw new Error(prefix+'Invalid argument 0');
    const imh = isMemHigh();
    if (number < maxCache || imh) clear(imh);
    maxCache = number;
}
export function getMaxCache() {
    return maxCache;
}
