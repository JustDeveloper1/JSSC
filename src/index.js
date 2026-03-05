import { prefix } from '../lib/meta.js';
if ((String.fromCharCode(65536).charCodeAt(0) === 65536) || !(String.fromCharCode(256).charCodeAt(0) === 256)) {
    throw new Error(prefix+'Supported UTF-16 only!')
}

import { 
    compress, decompress,
    compressToBase64, decompressFromBase64
} from './core.js';
export {
    compress, decompress,
    compressToBase64, decompressFromBase64
}
