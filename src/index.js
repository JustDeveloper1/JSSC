import { prefix } from '../lib/meta.js';
if ((String.fromCharCode(65536).charCodeAt(0) === 65536) || !(String.fromCharCode(256).charCodeAt(0) === 256)) {
    throw new Error(prefix+'Supported UTF-16 only!')
}

import { 
    compress, decompress, compressLarge,
    compressToBase64, compressLargeToBase64, decompressFromBase64
} from './core.js';
import { setMaxCache, getMaxCache } from './cache.js';

export {
    compress, decompress, compressLarge,
    compressToBase64, compressLargeToBase64, decompressFromBase64,

    getMaxCache, setMaxCache
}
