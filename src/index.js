import JUSTC from 'justc';
import { name__, prefix } from '../lib/meta.js';
if ((String.fromCharCode(65536).charCodeAt(0) === 65536) || !(String.fromCharCode(256).charCodeAt(0) === 256)) {
    throw new Error(prefix+'Supported UTF-16 only!')
}

import { 
    stringCodes, 
    codesString,
    charCode,
    checkChar,
    stringChunks,
    chunkArray,
    decToBin,
    binToDec,
    B64Padding
} from './utils.js';
import { freqMap, freqMapSplitters } from './modes/freqMap.js';
import { segments, splitGraphemes } from './modes/segmentation.js';
import { _JSSC } from './encodings.js';
import { compressSequences, decompressSequences } from './sequences.js';
import { convertBase } from '../lib/third-party/convertBase.js';
import { compressB64, decompressB64 } from './modes/base64.js';
import { encode, decode } from '@strc/utf16-to-any-base';
import utf8 from "utf8"; const { eUTF8, dUTF8 } = (()=>{
    const { encode, decode } = utf8;
    return { eUTF8: encode, dUTF8: decode };
})();
import { compressToUTF16 as cLZ, decompressFromUTF16 as dLZ } from 'lz-string';

function cryptCharCode(
    code, get = false,
    repeatBefore = false, repeatAfter = false,
    beginId = -1, code2 = 0, sequences = false,
    code3 = -1
) {
    if (get) {
        const codeBin = decToBin(code, 16);
        const codeSet = codeBin.slice(8,11).split('');
        const codeDec = binToDec(codeBin.slice(11));
        const begid = binToDec(codeBin.slice(5,8));
        return {
            code: codeDec,
            repeatBefore: codeSet[0] === '1',
            repeatAfter: codeSet[1] === '1',
            beginId: codeSet[2] === '1' ? begid : -1,
            code2: binToDec(codeBin.slice(0,4)),
            sequences: codeBin.slice(4,5) === '1',
            code3: codeSet[2] === '0' ? begid : -1,
            bin: codeBin,
        }
    } else {
        const sixteenBits =                                               /* 16-bit Data/Header character */

            decToBin(code2, 4) +                                          /* Bits  0-3  :           code2 */
            (sequences ? '1' : '0') +                                     /* Bit    4   : sequences?|odd? */
            decToBin(beginId >= 0 ? beginId : code3 < 0 ? 0 : code3, 3) + /* Bits  5-7  : beginID | code3 */
            (repeatBefore ? '1' : '0') +                                  /* Bit    8   : inp RLE? | num? */
            (repeatAfter ? '1' : '0') +                                   /* Bit    9   :     output RLE? */
            (beginId >= 0 ? '1' : '0') +                                  /* Bit   10   :        beginID? */
            decToBin(code, 5);                                            /* Bits 11-15 :           code1 */
        
        return binToDec(sixteenBits);
    }
}
/*          Code 1 usage table          */ /* Mode ID */
/* ------------------------------------ */ /* ------- */
/* 00: No Compression                   */ /* 00      */
/* 01: Two-Digit CharCode Concatenation */ /* 01      */
/* 02: Two-Byte CharCode Concatenation  */ /* 02      */
/* 03: Decimal Integer Packing          */ /* 03      */
/* 04: Alphabet Encoding                */ /* 04      */
/* 05: Character Encoding               */ /* 05      */
/* 06: Inline Integer Encoding          */ /* 06      */
/* 07: Frequency Map                    */ /* 07      */
/* 08: URL                              */ /* 08      */
/* 09: Segmentation                     */ /* 09      */
/* 10: String Repetition                */ /* 10      */
/* 11: Emoji Packing                    */ /* 12      */
/* 12: Base-64 Integer Encoding         */ /* 13      */
/* 13: Base-64 Packing                  */ /* 14      */
/* 14 - 29: Reserved                    */ /* --      */
/* 30: Offset Encoding                  */ /* 15      */
/* 31: Recursive Compression            */ /* 11      */

async function tryRecursive(base, opts) {
    if (!opts.recursivecompression) return base;

    let cur = base;
    let depth = 0;

    while (depth < 15) {
        depth++;
        const next = await compress(cur, {
            ...opts,
            recursivecompression: false
        });

        if (next.length >= cur.length) break;

        const dec = await decompress(next, true);
        if (dec !== cur) break;

        cur = next;
    }

    if (depth === 0) return null;

    return (
        charCode(
            cryptCharCode(
                31,
                false,
                false,
                false,
                -1,
                depth,
                false,
                -1
            )
        ) + cur
    );
}

function readOptions(options, defaults) {
    if (typeof options != 'object') throw new Error(prefix+'Invalid options input.');
    for (const [key, value] of Object.entries(options)) {
        if (typeof value == 'undefined') continue;
        if (typeof value != 'boolean') throw new Error(prefix+'Invalid options input.');
        if (key.toLowerCase() in defaults) {
            defaults[key.toLowerCase()] = value;
            continue;
        }
        console.warn(prefix+`Unknown option: "${key}".`);
    }
    return defaults;
}

class JSSC {
    constructor (com, dec, opts, m = 0) {
        const headerchar = decToBin(com.charCodeAt(0), 16);
        const code1 = headerchar.slice(11);
        const code2 = headerchar.slice(0,4);
        const code3 = headerchar.slice(5,8);
        const s = headerchar.slice(4,5);
        const i = headerchar.slice(8,9);
        const o = headerchar.slice(9,10);
        const b = headerchar.slice(10,11);

        const compressed = {
                string: com,
                header: {
                    code: binToDec(headerchar),
                    bin: headerchar,
                    blocks: [
                        code2,
                        s,
                        code3,
                        i,
                        o,
                        b,
                        code1
                    ],
                    code1, code2, code3,
                    s: s == '1',
                    i: i == '1',
                    o: o == '1',
                    b: b == '0'
                },
                mode: binToDec(code1)
            }

        this.output = m == 0 ? compressed : dec;
        this.options = opts;
        this.input = m == 0 ? dec : compressed;
        Object.freeze(this);
    }
}

/**
 * **JavaScript String Compressor - compress function.**
 * @param {string|object|number} input string
 * @param {{segmentation?: boolean, recursiveCompression?: boolean, JUSTC?: boolean, base64IntegerEncoding?: boolean, base64Packing?: boolean, offsetEncoding?: boolean, offsetEncode?: boolean, debug?: boolean}} [options]
 * @returns {Promise<string>} Compressed string
 * @example await compress('Hello, World!');
 * @since 1.0.0
 */
export async function compress(input, options) {
    if (typeof input != 'string' && typeof input != 'object' && typeof input != 'number') throw new Error(prefix+'Invalid input.');
    let opts = {
        segmentation: true,
        recursivecompression: true,
        justc: JUSTC ? true : false,
        base64integerencoding: true,
        base64packing: true,
        offsetencoding: true,
        
        offsetencode: false,

        debug: false
    };

    /* Read options */
    if (options) opts = readOptions(options, opts);

    const originalInput = input;
    let str = input;
    let isNum = false;

    if (typeof str === 'number') {
        isNum = true;
        str = str.toString();
        if (str.includes('.')) throw new Error(prefix+'Invalid input.');
    }

    let repeatBefore = false;
    function repeatChars(txt) {
        return txt.replace(/(.)\1+/g, ( a , b ) => b + a.length);
    }

    let beginId = -1;
    if (typeof str == 'string') for (const begin of _JSSC._begin) {
        if (str.startsWith(begin)) {
            beginId = _JSSC._begin.indexOf(begin);
            str = str.slice(begin.length);
            break;
        }
    };

    let code3 = -1;
    async function toJUSTC(obj) {
        try {
            const result = await JUSTC.stringify(obj);
            if (result && typeof result.then === 'function') {
                return await result;
            }
            return result;
        } catch (_) {
            /* Browsers */
            await JUSTC.initialize();
            return JUSTC.stringify(obj);
        }
    }
    if (beginId == -1) {
        /* JSON Array (as object) */
        if (typeof str == 'object' && Array.isArray(str)) {
            str = JSON.stringify(str).slice(1,-1);
            code3 = 4;
        } else
        /* JSON Object (as object) */
        if (typeof str == 'object') try {
            if (opts.justc) {
                const JUSTCobj = await toJUSTC(str);
                str = JUSTCobj;
                code3 = 2;
            } else {
                str = JSON.stringify(str);
                code3 = 6;
            }
        } catch (error) {
            const msg = new Error(prefix+'Invalid input.');
            throw new AggregateError([msg, error], msg.message);
        } else
        /* JSON Object (as string) */
        try {
            const obj = JSON.parse(str);
            if (!Array.isArray(obj) && typeof obj == 'object') {
            
            const JUSTCobj = opts.justc ? await toJUSTC(obj) : false;

            if (JUSTCobj && JUSTCobj.length < str.length && str == JSON.stringify(obj)) {                
                str = JUSTCobj;
                code3 = 1;
            } else {
                str = str.slice(1,-1);
                code3 = 5;
            }
        } else if (typeof obj == 'object') {
        /* JSON Array (as string) */
        str = str.slice(1,-1);
        code3 = 3;
        }} catch (_) {
    }}

    if (!/\d/.test(str)) {
        str = repeatChars(str);
        repeatBefore = true;
    }
    
    function processOutput(output, disableSeq = false) {
        let repeatAfter = false;
        let sequences = false;

        const hasDigits = /\d/.test(output);
        if (!hasDigits) {
            repeatAfter = true;
            output = repeatChars(output);
        }
        
        if (!disableSeq) {
            const compressed = compressSequences(output);
            if (compressed.sequences) {
                sequences = true;
                return [compressed.compressed, repeatAfter, sequences];
            }
        }
        
        return [output, repeatAfter, sequences];
    }

    const safeTry = async (fn) => {
        try {
            return await fn();
        } catch (err) {
            if (opts.debug) console.warn(err);
            return null;
        }
    };

    const validate = async (compressed) => {
        try {
            const dec = await decompress(compressed, true);
            return dec === String(originalInput);
        } catch {
            return false;
        }
    };

    const candidates = [];

    if (/^\d+$/.test(str)) {
        /* Inline Integer Encoding */
        candidates.push(async () => {
            const out = await (async () => {
                const num = parseInt(str);
                if (num < 15) {
                    return charCode(
                        cryptCharCode(isNum ? 6 : 0, false, false, false, -1, num + 1, false, code3)
                    );
                }
                return null;
            })();
            if (!out) return null;
            if (!(await validate(out))) return null;
            return out;
        });
        /* Decimal Integer Packing */
        candidates.push(async () => {
            const convertNums = {
                'A': 10,
                'B': 11,
                'C': 12,
                'D': 13,
                'E': 14
            };
            const inputt = str
                .replaceAll('10', 'A')
                .replaceAll('11', 'B')
                .replaceAll('12', 'C')
                .replaceAll('13', 'D')
                .replaceAll('14', 'E');
            const binOut = [];
            for (const character of inputt.split('')) {
                if (/\d/.test(character)) {
                    binOut.push(decToBin(parseInt(character), 4));
                } else {
                    binOut.push(decToBin(convertNums[character], 4));
                }
            };
            let [output, RLE, sequences] = ['', false, false];
            function binPadStart(bin) {
                if (bin.length < 16) {
                    const numm = 4 - stringChunks(bin, 4).length;
                    return decToBin(15, 4).repeat(numm)+bin;
                } else return bin;
            }
            for (const character of chunkArray(binOut, 4)) {
                output += String.fromCharCode(binToDec(binPadStart(character.join(''))));
            }
            [output, RLE, sequences] = processOutput(output);
            output = charCode(cryptCharCode(3, false, isNum, RLE, -1, 0, sequences, code3)) + output;
            if (!(await validate(output))) return null;
            return output;
        });
        /* Base-64 Integer Encoding */
        if (opts.base64integerencoding) candidates.push(async () => {
            let [output, RLE, seq] = processOutput(convertBase(str, 10, 64));
            output = await compress(output, {
                JUSTC: false,
                segmentation: false,
                recursiveCompression: false,
                base64IntegerEncoding: false
            });
            output = charCode(cryptCharCode(12, false, isNum, RLE, -1, 0, seq, code3)) + output;
            if (!(await validate(output))) return null;
            return output;
        });
    }

    /* Two-Digit CharCode Concatenation */
    candidates.push(async () => {
        const strdata = stringCodes(str);
        if (!(strdata.max === 2 && strdata.min === 2)) return null;

        let chars = strdata.output;
        let [output, repeatAfter, seq] = ['', false, false];
        function addChar(codee) {
            output += String.fromCharCode(codee);
        }
        function sliceChars(numbr) {
            chars = chars.slice(numbr);
        }
        while (chars.length > 0) {
            if (chars.length === 1) {
                addChar(chars[0]);
                sliceChars(1);
            } else if (chars.length < 3) {
                for (const char of chars) {
                    addChar(char);
                }
                sliceChars(chars.length)
            } else {
                const a1 = parseInt(String(chars[0]) + String(chars[1]) + String(chars[2]));
                const a2 = parseInt(String(chars[0]) + String(chars[1]));
                if (checkChar(a1)) {
                    addChar(a1);
                    sliceChars(3)
                } else if (checkChar(a2)) {
                    addChar(a2);
                    sliceChars(2)
                } else {
                    addChar(chars[0]);
                    sliceChars(1)
                }
            }
        }
        [output, repeatAfter, seq] = processOutput(output);
        const res = charCode(cryptCharCode(1, false, repeatBefore, repeatAfter, beginId, 0, seq, code3)) + output;
        if (!(await validate(res))) return null;
        return res;
    });

    /* Two-Byte CharCode Concatenation */
    candidates.push(async () => {
        const strdata = stringCodes(str);
        if (strdata.maxCharCode >= 256) return null;

        let [out, repeatAfter, seq] = ['', false, false];
        for (const pair of stringChunks(str, 2)) {
            let bin = '';
            for (const c of pair) bin += decToBin(c.charCodeAt(0), 8);
            out += String.fromCharCode(binToDec(bin));
        }

        [out, repeatAfter, seq] = processOutput(out);
        const res = charCode(cryptCharCode(2, false, repeatBefore, repeatAfter, beginId, 0, seq, code3)) + out;
        if (!(await validate(res))) return null;
        return res;
    });

    /* Character Encoding */
    candidates.push(async () => {
        const characterEncodings = new _JSSC.use();
        const stringArray = str.split('');
        let useCharacterEncoding;
        let charEncodingID = NaN;
        
        for (const [characterEncodingName, characterEncoding] of Object.entries(characterEncodings)) {
            const table = characterEncoding();
            table.length = 256;
            const arrayy = Array.from(table);
            let usethisone = true;
            for (const character of stringArray) {
                if (!arrayy.includes(character)) {
                    usethisone = false;
                    break;
                }
            }
            if (usethisone) {
                useCharacterEncoding = characterEncoding();
                charEncodingID = _JSSC._IDs[characterEncodingName.slice(4)];
                break;
            }
        }
        
        if (useCharacterEncoding) {
            const reverseCharacterEncoding = {};
            for (const [charCode, character] of Object.entries(useCharacterEncoding)) {
                reverseCharacterEncoding[character] = charCode;
            }
            const binaryCharCodes = [];
            const convertCharCodes = [];
            for (const character of stringArray) {
                binaryCharCodes.push(decToBin(parseInt(reverseCharacterEncoding[character]), 8));
            }
            for (const binCharCodes of chunkArray(binaryCharCodes, 2)) {
                convertCharCodes.push(binCharCodes.join('').padStart(16, '0'));
            }
            let [outputStr, repeatAfter, seq] = ['', false, false];
            for (const characterCode of convertCharCodes) {
                outputStr += String.fromCharCode(binToDec(characterCode))
            }

            [outputStr, repeatAfter, seq] = processOutput(outputStr);
            outputStr = charCode(cryptCharCode(5, false, repeatBefore, repeatAfter, beginId, charEncodingID, seq, code3)) + outputStr;
            if (await validate(outputStr)) return outputStr;
        }
        return null;
    });

    /* Alphabet Encoding */
    candidates.push(async () => {
        const uniq = [...new Set(str.split('').map(c => c.charCodeAt(0)))];
        if (uniq.length >= 16) return null;

        let out = uniq.map(c => String.fromCharCode(c)).join('');
        let buf = [];
        let [repeatAfter, seq] = [false, false];

        for (const c of str) {
            buf.push(uniq.indexOf(c.charCodeAt(0)));
            if (buf.length === 4) {
                out += String.fromCharCode(binToDec(buf.map(n => decToBin(n, 4)).join('')));
                buf = [];
            }
        }

        if (buf.length) {
            out += String.fromCharCode(
                binToDec(buf.map(n => decToBin(n, 4)).join('').padStart(16, '1'))
            );
        }

        [out, repeatAfter, seq] = processOutput(out);
        const res = charCode(cryptCharCode(4, false, repeatBefore, repeatAfter, beginId, uniq.length, seq, code3)) + out;
        if (!(await validate(res))) return null;
        return res;
    });

    /* Frequency Map */
    candidates.push(async () => {
        for (const splitter of freqMapSplitters) {
            const test = freqMap.test(str, splitter);
            if (!Array.isArray(test)) continue;

            const [, , sp, packed] = test;
            const code2 = binToDec((test[0] - 1).toString() + decToBin(freqMapSplitters.indexOf(sp), 3));
            const res = charCode(cryptCharCode(7, false, false, false, -1, code2)) + packed;

            if (await validate(res)) return res;
        }
        return null;
    });

    /* URL */
    candidates.push(async () => {
        if (typeof str !== 'string') return null;

        let url;
        try {
            url = new URL(_JSSC._begin[beginId] + str);
        } catch {
            return null;
        }

        const originalHref = url.href;

        let hasPercent = /%[0-9A-Fa-f]{2}/.test(originalHref);
        let hasPunycode = url.hostname.includes('xn--');
        let hasQuery = !!url.search;
        let hasFragment = !!url.hash;

        /* normalize */
        let normalized = originalHref.slice(_JSSC._begin[beginId].length);

        /* punycode to unicode */
        if (hasPunycode && typeof punycode !== 'undefined') {
            url.hostname = punycode.toUnicode(url.hostname);
            normalized = url.href.slice(_JSSC._begin[beginId].length);
        }

        /* percent to bytes */
        let bytes = [];
        for (let i = 0; i < normalized.length; i++) {
            const ch = normalized[i];
            if (ch === '%' && i + 2 < normalized.length) {
                const hex = normalized.slice(i + 1, i + 3);
                if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
                    bytes.push(parseInt(hex, 16));
                    i += 2;
                    continue;
                }
            }
            bytes.push(normalized.charCodeAt(i));
        }
        
        let odd = bytes.length & 1;
        if (odd) bytes.push(0);

        /* bytes to UTF16 */
        let out = '';
        for (let i = 0; i < bytes.length; i += 2) {
            out += String.fromCharCode(
                (bytes[i] << 8) | (bytes[i + 1] ?? 0)
            );
        }

        let code2 =
            (hasPercent ? 1 : 0) |
            (hasPunycode ? 2 : 0) |
            (hasQuery ? 4 : 0) |
            (hasFragment ? 8 : 0);

        let repeatAfter = false;
        [out, repeatAfter,] = processOutput(out, true);

        const res =
            charCode(
                cryptCharCode(
                    8,
                    false,
                    repeatBefore,
                    repeatAfter,
                    beginId,
                    code2,
                    odd,
                    code3
                )
            ) + out;

        if (!(await validate(res))) return null;
        return res;
    });

    /* Segmentation */
    if (opts.segmentation) candidates.push(
        async () => {
            const segs = segments(str);

            if (segs.length < 2) return null;

            let out = segs.length - 2 < 15 ? '' : String.fromCharCode(segs.length - 2);

            for (const seg of segs) {
                const segOpts = {
                    ...opts,
                    segmentation: false
                }
                const compressed = await compress(seg, segOpts);

                out += String.fromCharCode(seg.length);
                out += compressed;
            }

            const res =
                charCode(
                    cryptCharCode(
                        9,
                        false,
                        repeatBefore,
                        opts.justc,
                        beginId,
                        Math.min(segs.length - 2, 15),
                        opts.recursivecompression,
                        code3
                    )
                ) + out;

            if (!(await validate(res))) return null;
            return res;
        }
    );

    /* String Repetition */
    const rcheck = str.match(/^(.{1,7}?)(?:\1)+$/);
    if (rcheck) candidates.push(async () => {
        const main = rcheck[1];
        const count = str.length / main.length;
        if (Math.floor(count) != count || count < 1 || count > 65535 + 15) return null;
        let [out, repeatAfter, seq] = ['', false, false];
        [out, repeatAfter, seq] = processOutput(main);

        const res =
            charCode(
                cryptCharCode(
                    10,
                    false,
                    repeatBefore,
                    repeatAfter,
                    beginId,
                    Math.min(count - 1, 15),
                    seq,
                    code3
                )
            ) + (
                (count - 1) > 14 ? String.fromCharCode(count - 15) : ''
            ) + out;

        if (!(await validate(res))) return null;
        return res;
    });

    /* Emoji Packing */
    candidates.push(async () => {
        const graphemes = splitGraphemes(str);
        function isEmojiCluster(cluster) {
            const code = cluster.codePointAt(0);
            return (code >= 0x1F300 && code <= 0x1FAFF);
        }
        
        if (!graphemes.every(isEmojiCluster)) return null;

        const base = 0x1F300;
        let bits = '';

        for (const g of graphemes) {
            const cps = Array.from(g).map(c => c.codePointAt(0));
            bits += decToBin(cps.length, 3);
            for (const cp of cps) {
                bits += decToBin(cp - base, 11);
            }
        }

        let out = '';
        for (const chunk of stringChunks(bits, 16)) {
            out += String.fromCharCode(binToDec(chunk.padEnd(16,'0')));
        }

        const [outPostprocessed, repeatAfter, seq] = processOutput(out);

        function hchar(ra = false, sq = false) {
            return cryptCharCode(11, false, repeatBefore, ra, beginId, 0, sq, code3);
        }
        const resA = charCode(hchar(repeatAfter, seq)) + outPostprocessed;
        const resB = charCode(hchar()) + out;

        if (await validate(resA)) return resA;
        if (await validate(resB)) return resB;
        return null;
    });

    /* Base-64 Packing */
    if (/^[0-9a-zA-Z+/]+$/.test(str) && opts.base64packing) candidates.push(async () => {
        const { data, length } = compressB64(str);

        let len = '';
        if (length > 15) {
            const lng = length - 16
            if (lng > 0xFFFF) return null;
            len = String.fromCharCode(lng);
        }

        const res = charCode(cryptCharCode(13, false, repeatBefore, false, beginId, Math.min(length, 16), false, code3)) + len + data;
        if (await validate(res)) return res;
        return null;
    });

    /* Offset Encoding */
    function offsetEncoding(string) {
        const group = Math.floor(stringCodes(string).minCharCode / 32);
        const offset = group * 32;
        let result = '';
        for (let i = 0; i < string.length; i++) {
            result += String.fromCharCode(string.charCodeAt(i) - offset);
        }
        const char = charCode(binToDec(decToBin(group, 11) + decToBin(30, 5)));
        return [result, char, group];
    }
    async function validateOffsetEncoding(string, inp, group) {
        try {
            return group > 0 && (
                eUTF8(string).length < eUTF8(inp).length ||
                encode(string).length < encode(inp).length ||
                opts.offsetencode
            ) && await validate(string);
        } catch (_) {
            return false;
        }
    }
    if (opts.offsetencoding) candidates.push(async () => {
        const enc = offsetEncoding(originalInput);
        const res = enc[1] + await compress(enc[0], {
            ...opts,
            offsetencoding: false
        });
        if (await validateOffsetEncoding(res, originalInput, enc[2])) return res;
        return null;
    });

    /* lz-string */
    candidates.push(async () => {
        const res = charCode(cryptCharCode(29, false, repeatBefore, false, beginId, 0, false, code3)) + cLZ(str);
        if (await validate(res)) return res;
        return null;
    });

    /* run all */
    const results = (await Promise.all(candidates.map(fn => safeTry(fn))))
        .filter(r => typeof r === 'string' && r.length <= String(originalInput).length);

    let best;
    if (!results.length) {
        let [repeatAfter, sequences] = [false, false];
        const savedStr = str;
        [str, repeatAfter, sequences] = processOutput(str);
        if (await validate(str)) best = charCode(cryptCharCode(0, false, repeatBefore, repeatAfter, beginId, 0, sequences, code3)) + str;
        else best = charCode(cryptCharCode(0, false, repeatBefore, false, beginId, 0, false, code3)) + savedStr;
    } else best = results.reduce((a, b) => (b.length < a.length ? b : a));

    if (opts.recursivecompression) try {
        for (const r of results) {
            const rc = await tryRecursive(r, opts);
            if (rc && rc.length <= best.length && await validate(rc)) {
                best = rc;
            }
        }
    } catch (_){};

    /* postprocessing */
    if (opts.offsetencoding) {
        const enc = offsetEncoding(best);
        const res = enc[1] + enc[0];
        if (await validateOffsetEncoding(res, best, enc[2])) best = res;
    }

    if (opts.debug) return new JSSC(best, originalInput, opts, 0);

    return best;
}

function characterEncodings(id, realstr) {
    const strcode2charencoding = {};
    for (const [name, code] of Object.entries(_JSSC._IDs)) {
        strcode2charencoding[code] = name
    }
    const possibleCharEncoding = strcode2charencoding[id];
    if (possibleCharEncoding) {
        const characterEncodings_ = new _JSSC.use();
        const characterEncoding = characterEncodings_[name__+possibleCharEncoding]();
        let output = '';
        for (const characters of realstr.split('')) {
            const characterCode = characters.charCodeAt();
            const binCode0 = decToBin(characterCode, 0);
            function binCodeToChar(charr) {
                return String(characterEncoding[String(binToDec(charr))]);
            }
            if (binCode0.length > 8) {
                const [character1, character2] = stringChunks(decToBin(characterCode, 16), 8);
                output += binCodeToChar(character1) + binCodeToChar(character2);
            } else {
                const character = decToBin(characterCode, 8);
                output += binCodeToChar(character);
            }
        }
        return output;
    }
}

async function parseJUSTC(str) {
    try {
        const result = JUSTC.parse(str);

        if (result && typeof result.then === 'function') {
            return await result;
        }

        return result;
    } catch (err) {
        if (typeof window !== 'undefined') { /* Browsers */
            try {
                await JUSTC.initialize();

                const retry = JUSTC.parse(str);
                if (retry && typeof retry.then === 'function') {
                    return await retry;
                }

                return retry;
            } catch {
                return null;
            }
        }

        return null;
    }
}

function offsetEncoding(str, group) {
    const offset = group * 32;
    let result = "";
    
    for (let i = 0; i < str.length; i++) {
        result += String.fromCharCode(str.charCodeAt(i) + offset);
    }
    
    return result;
}

/**
 * **JavaScript String Compressor - decompress function.**
 * @param {string} str Compressed string
 * @param {boolean?} [stringify] Return only string in any way
 * @returns {Promise<string|object|number>} Decompressed string/object/integer
 * @since 1.0.0
 */
export async function decompress(str, stringify = false) {
    if (typeof str != 'string') throw new Error(prefix+'Invalid input.');
    const s = str;
    let opts = {
        stringify: false,

        debug: false
    }

    /* Read options */
    switch (typeof stringify) {
        case 'boolean':
            opts.stringify = stringify;
            break;
        case 'object':
            opts = readOptions(stringify, opts);
            break;
        default:
            opts.stringify = Boolean(stringify);
            break;
    }

    const charcode = (str.charCodeAt(0) - 32 + 65535) % 65535;
    const strcodes = cryptCharCode(charcode, true);
    const strcode = strcodes.code;
    
    function repeatChars(txt) {
        return txt.replace(/(\D)(\d+)/g, (_, g1, g2) => g1.repeat(g2));
    }
    
    /* sequences */
    let realstr = str.slice(1);
    if (strcodes.sequences && ![8,9,13,30].includes(strcode)) {
        realstr = decompressSequences(realstr);
    }
    
    /* RLE */
    if (strcodes.repeatAfter && ![9,13,30].includes(strcode)) {
        realstr = repeatChars(realstr);
    }
    
    async function begin(out) {
        if (strcodes.beginId >= 0) {
            return _JSSC._begin[strcodes.beginId] + out;
        } else if (strcodes.code3 == 1 || strcodes.code3 == 2) {
            /* JSON Object */
            const result = await parseJUSTC(out);
            if (result && typeof result.then === 'function') {
                return JSON.stringify(await result);
            } else return JSON.stringify(result);
        } else return out;
    }
    
    function checkOutput(out) {
        if (opts.debug) return new JSSC(s, out, opts, 1);
        return out;
    }
    async function processOutput(out, checkOut = true) {
        let output = out;

        if (strcodes.repeatBefore && strcode != 3 && strcode != 12) {
            output = repeatChars(await begin(out));
        } else output = await begin(out);

        if ((strcodes.repeatBefore && (strcode == 3 || strcode == 12)) || strcode == 30) output = parseInt(output); else { /*            Integer            */
        if (strcodes.code3 == 3 || strcodes.code3 == 4) output = '[' + output + ']';                                       /*          JSON  Array          */
        else if (strcodes.code3 == 5) output = '{' + output + '}';                                                         /*    JSON Object (as string)    */
        if (strcodes.code3 == 2 || strcodes.code3 == 4 || strcodes.code3 == 6) output = JSON.parse(output);}               /* JSON Object/Array (as object) */

        if (opts.stringify) {
            if (typeof output == 'object') output = JSON.stringify(output);
            else if (typeof output == 'number') output = output.toString();
        }

        return checkOut ? checkOutput(output) : output;
    }
    
    let output = '';
    switch (strcode) {
        case 0: case 6:
            if (strcodes.code2 > 0) return await processOutput(String(strcodes.code2 - 1));
            return await processOutput(realstr);
        case 1:
            function addChar(cde) {
                output += String.fromCharCode(cde);
            }
            for (const char of realstr.split('')) {
                const charcde = String(char.charCodeAt(0));
                if (charcde.length > 2) {
                    const charcds = stringChunks(charcde, 2);
                    for (const chrcode of charcds) {
                        addChar(parseInt(chrcode));
                    }
                } else {
                    addChar(char.charCodeAt(0));
                }
            }
            return await processOutput(output);
        case 2:
            function toChar(binCode) {
                return String.fromCharCode(binToDec(binCode));
            }
            for (const char of realstr.split('')) {
                const binCode = decToBin(char.charCodeAt(0), 16);
                const binCode0 = decToBin(char.charCodeAt(0), 0);
                if (binCode0.length > 8) {
                    const [bin1, bin2] = stringChunks(binCode, 8);
                    output += toChar(bin1) + toChar(bin2);
                } else {
                    const binCode8 = decToBin(char.charCodeAt(0), 8);
                    output += toChar(binCode8);
                }
            }
            return await processOutput(output);
        case 3:
            for (const char of realstr.split('')) {
                const binCodes = stringChunks(decToBin(char.charCodeAt(0), 16), 4);
                for (const binCode of binCodes) {
                    const numm = binToDec(binCode);
                    if (numm != 15) {
                        output += numm.toString(10);
                    }
                }
            }
            return await processOutput(output);
        case 4:
            const chars = [];
            for (const char of realstr.slice(0, strcodes.code2).split('')) {
                chars.push(char);
            }
            for (const char of realstr.slice(strcodes.code2).split('')) {
                const binCodes = stringChunks(decToBin(char.charCodeAt(0), 16), 4);
                for (const binCode of binCodes) {
                    if (binCode != '1111') {
                        const numm = binToDec(binCode);
                        output += chars[numm];
                    }
                }
            }
            return await processOutput(output);
        case 5:
            const decoded = characterEncodings(strcodes.code2, realstr);
            if (decoded) {
                return await processOutput(decoded);
            } else throw new Error(prefix+'Invalid compressed string');
        case 7:
            const splitter = freqMapSplitters[binToDec(decToBin(strcodes.code2).slice(1))];
            output = freqMap.decompress(realstr, splitter);
            if (parseInt(decToBin(strcodes.code2).slice(0,1)) == 1) output = output.slice(0,-1);
            return await processOutput(output);
        case 8: {
            let bytes = [];
            for (const ch of realstr) {
                const c = ch.charCodeAt(0);
                bytes.push((c >> 8) & 0xFF, c & 0xFF);
            }
            if (strcodes.sequences) bytes.pop();

            let out = '';
            for (const b of bytes) {
                out += String.fromCharCode(b);
            }

            /* percent restore if needed */
            if (strcodes.code2 & 1) {
                out = out.replace(
                    /[\x00-\x20\x7F-\xFF]/g,
                    c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase()
                );
            }

            /* punycode restore */
            if (strcodes.code2 & 2 && typeof punycode !== 'undefined') {
                const u = new URL(out);
                u.hostname = punycode.toASCII(u.hostname);
                out = u.href;
            }

            return await processOutput(out);}
        case 9: {
            let idx = 0;
            const segCount = strcodes.code2 < 15 ? strcodes.code2 + 2 : realstr.charCodeAt(idx++) + 2;
            let out = '';

            for (let i = 0; i < segCount; i++) {
                const len = realstr.charCodeAt(idx++);
                const segmentCompressed = realstr.slice(idx);

                const seg = (await decompress(
                    segmentCompressed, true
                )).slice(0, len);

                out += seg;
                idx += (await compress(seg, {segmentation: false, justc: strcodes.repeatAfter, recursivecompression: strcodes.sequences})).length;
            }

            return await processOutput(out);}
        case 10:
            const sliceChar = strcodes.code2 == 15;
            const repeatCount = sliceChar ? realstr.charCodeAt(0) + 15 : strcodes.code2;
            if (sliceChar) realstr = realstr.slice(1);
            return await processOutput(realstr.repeat(repeatCount));
        case 11: {
            const base = 0x1F300;

            let bits = '';

            for (let i = 0; i < realstr.length; i++) {
                const code = realstr.charCodeAt(i);
                bits += code.toString(2).padStart(16, '0');
            }

            let pos = 0;
            let result = '';
            
            while (pos + 3 <= bits.length) {
                const length = parseInt(bits.slice(pos, pos + 3), 2);
                pos += 3;

                if (length === 0) break;

                if (pos + (length * 11) > bits.length) break;

                let cluster = '';

                for (let i = 0; i < length; i++) {
                    const delta = parseInt(bits.slice(pos, pos + 11), 2);
                    pos += 11;

                    const cp = base + delta;
                    cluster += String.fromCodePoint(cp);
                }

                result += cluster;
            }

            return checkOutput(result);
        }
        case 12:
            return checkOutput(await decompress(
                await processOutput(convertBase(realstr, 64, 10), false)
            ));
        case 13:
            let len = strcodes.code2;
            let slice = len == 16;
            if (slice) len = realstr.slice(0,1).charCodeAt(0) + 16;
            return await processOutput(decompressB64(slice ? realstr.slice(1) : realstr, len));
        case 29:
            return await processOutput(dLZ(realstr));
        case 30:
            const dec = offsetEncoding(realstr, binToDec(decToBin(charcode, 16).slice(0,11)));
            return checkOutput(await decompress(dec));
        case 31: {
            let out = realstr;
            const depth = strcodes.code2;

            for (let i = 0; i < depth; i++) {
                const first = out.charCodeAt(0) - 32;
                const meta = cryptCharCode(first, true);

                if (meta.code === 31) {
                    throw new Error(prefix+'Attempt to nested recursive compression');
                }

                out = await decompress(out, true);
            }

            return checkOutput(out);
        }
        default:
            throw new Error(prefix+'Invalid compressed string');
    }
}

export async function compressToBase64(...input) {
    const compressed = await compress(...input);

    if (compressed instanceof JSSC) throw new Error(prefix+'Invalid options input.');

    return B64Padding(encode(compressed));
}

export async function decompressFromBase64(base64, ...input) {
    const decompressed = await decompress(decode(base64.replace(/=+$/, '')), ...input);

    if (decompressed instanceof JSSC) throw new Error(prefix+'Invalid options input.');

    return decompressed;
}
