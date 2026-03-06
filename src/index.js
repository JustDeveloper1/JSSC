import { prefix, version } from '../lib/meta.js';
if ((String.fromCharCode(65536).charCodeAt(0) === 65536) || !(String.fromCharCode(256).charCodeAt(0) === 256)) {
    throw new Error(prefix+'Supported UTF-16 only!')
}

import { 
    compress, decompress, compressLarge,
    compressToBase64, compressLargeToBase64, decompressFromBase64
} from './core.js';
import { setMaxCache, getMaxCache, validateCache } from './cache.js';

const cache = {
    get['max'] () {
        return getMaxCache();
    },
    set['max'] (number) {
        setMaxCache(number);
    },
    get['clear'] () {
        return function() {
            validateCache.clear();
        }
    },
    get['size'] () {
        return validateCache.size;
    }
}

export {
    compress, decompress, compressLarge,
    compressToBase64, compressLargeToBase64, decompressFromBase64,

    cache, version
}
