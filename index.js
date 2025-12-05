/*

MIT License

Copyright (c) 2025 JustDeveloper <https://justdeveloper.is-a.dev/>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

/*
        _______________
    __ / / __/ __/ ___/
   / // /\ \_\ \/ /__  
   \___/___/___/\___/  
                       
   JavaScript String Compressor
   https://jssc.js.org/

*/

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);        /*   amd    */
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(); /*   node   */
    } else {
        root.JSSC = factory();      /* browsers */
        Object.freeze(root.JSSC);
    }
}(typeof self !== 'undefined' ? self : this, function () {

    if ((String.fromCharCode(65536).charCodeAt(0) === 65536) || !(String.fromCharCode(256).charCodeAt(0) === 256)) {
        throw new Error('Supported UTF-16 only!')
    }

    function stringCodes(str) {
        let output = [];
        let max = 0;
        let maxCharCode = 0;
        let min = Infinity;
        String(str).split('').forEach(char => {
            const code = char.charCodeAt();
            output.push(code);
            max = Math.max(max, code.toString().length);
            maxCharCode = Math.max(maxCharCode, code);
            min = Math.min(min, code.toString().length);
        });
        return {max, output, maxCharCode, min};
    }

    function codesString(cds) {
        let output = '';
        cds.forEach(code => {
            output += String.fromCharCode(code);
        });
        return output
    }

    function charCode(num) {
        return String.fromCharCode(num + 32);
    }
    function checkChar(cde) {
        return cde % 65535 === cde
    }

    function stringChunks(str, num) {
        const output = [];
        for (let i = 0; i < str.length; i += num) {
            output.push(str.slice(i, i + num))
        }
        return output
    }
    function chunkArray(array, num) {
        const result = [];
        for (let i = 0; i < array.length; i += num) {
            result.push(array.slice(i, i + num));
        }
        return result;
    }

    function decToBin(num, wnum) {
        return num.toString(2).padStart(wnum, '0');
    }
    function binToDec(str) {
        return parseInt(str, 2);
    }

    function charsBase() {
        const charsBase = {};
        function addChar(i) {
            charsBase[i] = String.fromCharCode(i);
        }
        for (let i = 0; i < 65; i++)    addChar(i); /* ASCII 00 - 40 */
        for (let i = 91; i < 97; i++)   addChar(i); /* ASCII 5B - 60 */
        for (let i = 123; i < 128; i++) addChar(i); /* ASCII 7B - 7F */
        return charsBase;
    }
    function charsLatin() {
        const charsLatin = {};
        for (let i = 0; i < 128; i++) {
            charsLatin[i] = String.fromCharCode(i); /* ASCII 00 - 7F */
        }
        return charsLatin;
    }

    const _JSSC = {};
    _JSSC._char = (cde) => String.fromCharCode(cde);
    _JSSC._IDs = {
        'BASE':  0,
        'RU':    1,
        'ENRU':  2,
        'ENKK':  3,
        'HI':    4,
        'ENHI':  5,
        'BN':    6,
        'ENBN':  7,
        'HIBN':  8,
        'JA':    9,
        'Telu': 10,
        'MR':   11,
    };
    _JSSC.BASE = function() { /* Base */
        const chrsBase = charsBase();
        const addCBase = [
            215,  247, 8722, 11800,
            174,  169,  171, 10003,
            182,  9834, 183, 10005,
            177,  181,  8960, 8211, 
            8212, 8228, 8229, 8230, 
            8240, 8241, 8249, 8250, 
            8252, 8253, 8263, 8264, 
            8267, 8270, 8274, 8451, 
            8457, 8470, 8471, 8482,

            402, 1423, 1547, 65020,
            2547, 2553, 2555, 2801, 
            3065, 3647, 6107, 8499, 
            2546,

            8304, 185, 178, 179,
            8585, 8319, 8305,

            8709, 8730, 8734,
        ];
        for (let i = 161; i < 168; i++) {
            addCBase.push(i);
        }
        for (let i = 187; i < 192; i++) {
            addCBase.push(i);
        }
        for (let i = 8308; i < 8317; i++) {
            addCBase.push(i);
        }
        for (let i = 8528; i < 8576; i++) {
            addCBase.push(i);
        }
        for (let i = 8352; i < 8385; i++) {
            addCBase.push(i);
        }
        for (let i = 8320; i < 8333; i++) {
            addCBase.push(i);
        }
        for (let i = 8712; i < 8718; i++) {
            addCBase.push(i);
        }
        let i = 65;
        for (const cde of addCBase) {
            chrsBase[i++] = _JSSC._char(cde);
            if (i === 91) {
                i = 97;
            } else if (i === 123) {
                i = 128;
            }
        }
        return chrsBase
    };
    _JSSC._BASE = [
        167, 8722, 8451, 169, 8211, 215, 247, 
        8457, 174, 8470, 8482, 8471, 8249, 
        8250, 171, 187, 8242, 8245, 8216, 
        8217, 8218, 8219, 8243, 8246, 8220, 
        8221, 8222, 8223, 8226, 182, 8267, 
        8270, 8240, 8241, 9834, 183, 8228, 
        8229, 8230, 161, 191, 8252, 8264
    ];
    _JSSC._MATH = [
        8544, 8547, 8550, 8553, 8556, 8572, 
        8545, 8548, 8551, 8554, 8557, 8573, 
        8546, 8549, 8552, 8555, 8558, 8574, 
        8560, 8563, 8566, 8569, 8559, 8575, 
        8561, 8564, 8567, 8570, 8562, 8565, 
        8568, 8571, 8712, 8715, 8713, 8716, 
        8730, 8721, 8734, 8804, 8805
    ];
    _JSSC._CURR = [
        165, 3647, 8363, 8361, 1423, 8364, 
        8377, 8362, 8378, 8353, 8358, 163, 
        8381, 8354, 8369, 2547, 8370, 8366, 
        8376, 8382, 8357, 6107, 8360, 8372, 
        8373, 8365, 1547, 2801, 162, 65020, 
        8355, 8383, 8380, 3065, 164, 8384, 
        8379, 402, 8359, 2546, 8371, 8367, 
        8356, 8375, 2553, 8368, 8352, 8499, 
        8374, 2555
    ];
    /*
        ASCII (charsLatin) // English, Spanish, Portuguese, French, German
    */
    _JSSC._RU = function(baseOrLatin) {
        const chrsBase = baseOrLatin();
        let maxI = 0;
        for (let i = 1040; i < 1104; i++) {
            const curI = i - 912;
            chrsBase[curI] = _JSSC._char(i);    /* Unicode 0410 - 044F */
            maxI = Math.max(maxI, curI);
        }
        chrsBase[maxI + 1] = _JSSC._char(1025); /*  Unicode 0401 ( Ё ) */
        chrsBase[maxI + 2] = _JSSC._char(1105); /*  Unicode 0451 ( ё ) */
        return chrsBase;
    };
    _JSSC.RU = function() { /* Russian, Ukrainian, Belarusian, Kazakh */
        const chrsBase = _JSSC._RU(charsBase);
        let i = 65;
        for (const char of _JSSC._BASE.concat(_JSSC._MATH, [
            105, 239, 1028, 1030, 1031, 1108, 1110, 1111,
            1118, 1038,
            1241, 1181, 1171, 1199, 1201, 1179, 1257, 1211, 1240, 1186, 1170, 1198, 1200, 1178, 1256, 1210,
            8381, 8364, 165, 8376, 8372
        ])) {
            chrsBase[i++] = _JSSC._char(char);
            if (i === 91) {
                i = 97;
            } else if (i === 123) {
                i = 193;
            }
        }
        chrsBase[110] = 'i';
        chrsBase[111] = 'I';

        return chrsBase;
    };
    _JSSC.ENRU = function() { /* English, Russian, Ukrainian, Belarusian */
        const chrsBase = _JSSC._RU(charsLatin);
        let i = 194;
        for (const char of _JSSC._BASE.concat([
            105, 239, 1028, 1030, 1031, 1108, 1110, 1111,
            1118, 1038,
            8381, 8364, 165, 8376, 8372, 163, 8380
        ], [
            215, 247
        ])) {
            chrsBase[i++] = _JSSC._char(char);
        }
        return chrsBase;
    };
    _JSSC.ENKK = function() { /* English, Russian, Kazakh */
        const chrsBase = _JSSC._RU(charsLatin);
        let i = 194;
        for (const char of _JSSC._BASE.concat([
            1241, 1181, 1171, 1199, 1201, 1179, 1257, 1211, 1240, 1186, 1170, 1198, 1200, 1178, 1256, 1210,
            8381, 163, 8376
        ])) {
            chrsBase[i++] = _JSSC._char(char);
        }
        return chrsBase;
    };
    _JSSC._HI = function(baseOrLatin) {
        const chrsBase = baseOrLatin();
        for (let i = 2304; i < 2432; i++) {
            chrsBase[i - 2176] = _JSSC._char(i); /* Unicode 0900 - 097F */
        }
        return chrsBase;
    };
    _JSSC._Ind = [
        8377, 8360, 78, 2547,
        2404, 
        215, 247,
    ];
    _JSSC.HI = function() { /* Hindi */
        const chrsBase = _JSSC._HI(charsBase);
        let i = 65;
        for (const char of _JSSC._BASE.concat(_JSSC._Ind)) {
            chrsBase[i++] = _JSSC._char(char);
            if (i === 91) {
                i = 97
            }
        }
        return chrsBase
    };
    _JSSC.ENHI = function() { /* English, Hindi */
        return _JSSC._HI(charsLatin); 
    };
    _JSSC._BN = function(baseOrLatin) {
        const chrsBase = baseOrLatin();
        for (let i = 2432; i < 2559; i++) {
            chrsBase[i - 2304] = _JSSC._char(i) /* Unicode 0980 - 09FF */
        }
        chrsBase[255] = _JSSC._char(2404);
        return chrsBase;
    };
    _JSSC.BN = function() { /* Bengali */
        const chrsBase = _JSSC._BN(charsBase);
        let i = 65;
        for (const char of _JSSC._BASE.concat(_JSSC._Ind)) {
            chrsBase[i++] = _JSSC._char(char);
            if (i === 91) {
                i = 97
            }
        }
        return chrsBase;
    };
    _JSSC.ENBN = function() { /* English, Bengali */
        return _JSSC._BN(charsLatin);
    };
    _JSSC.HIBN = function() { /* Hindi, Bengali */
        const chrsBase = {};
        for (let i = 2304; i < 2559; i++) {
            chrsBase[i - 2176 - 128] = _JSSC._char(i);
        }
        chrsBase[255] = ' ';
        return chrsBase;
    };
    _JSSC._JA = [
        [
            65371, 65373,  65288, 65289,  65339, 65341,  12304, 12305,
            12289, 65292,
            12290,
            12349,
            12300, 12301,  12302, 12303,
            12288,
            12316,
            65306,
            65281,
            65311,
            12445, 12541,
            183,
        ],
        [
            8230, 8229, 
            165,
        ]
    ];
    _JSSC.JA = function() { /* English, Hiragana (Japanese), Katakana (Japanese) */
        const chrsBase = charsLatin();
        let i = 128;
        for (const char of _JSSC._JA[0].concat(
            Array.from({ length : 46 }, (v, j) => j + 12352 ), /* Unicode 3040 - 309F */
            Array.from({ length : 46 }, (v, j) => j + 12448 ), /* Unicode 30A0 - 30FF */
            _JSSC._JA[1], [
                19968, 20108, 19977, 
                22235, 20116, 20845, 
                19971, 20843, 20061
            ]
        )) {
            chrsBase[i++] = _JSSC._char(char);
        }
        chrsBase[17] = _JSSC._char(21313);
        chrsBase[18] = _JSSC._char(30334);
        chrsBase[19] = _JSSC._char(21315);
        chrsBase[20] = _JSSC._char(19975);
        return chrsBase;
    };
    _JSSC.Telu = function() { /* English, Telugu */
        const chrsBase = charsLatin();
        for (let i = 3073; i < 3184; i++) { /* Unicode 0C01 - 0C6F */
            chrsBase[i - 2945] = _JSSC._char(i);
        }
        let i = 239;
        for (const char of _JSSC._Ind.concat([
            8364, 0xA3, 0xA2, 0xA5, 0xA7, 0xA9, 0xAE, 8482, 0x2030, 0x2031
        ])) {
            chrsBase[i++] = _JSSC._char(char);
        }
        return chrsBase;
    };
    _JSSC.MR = function() { /* English, Marathi */
        const chrsBase = charsLatin();
        for (let i = 0x900; i < 0x980; i++) {
            chrsBase[i - 2176] = _JSSC._char(i);
        }
        return chrsBase;
    };
    _JSSC.use = class {
        constructor() {
            let output = {};
            for (const [name, func] of Object.entries(_JSSC)) {
                if (typeof func === 'function' && !name.startsWith('_') && name != 'use') {
                    output['JSSC'+name] = func;
                }
            }
            Object.freeze(output);
            return output;
        }
    };
    _JSSC._begin = [
        'https://', 'http://', 'file://', 'mailto:', 'ftp://', 'data:', 'tel:', 'sms:'
    ];
    Object.freeze(_JSSC.use);

    function cryptCharCode(
        code, get = false,
        repeatBefore = false, repeatAfter = false,
        beginId = -1, code2 = 0, sequences = false
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
                code3: codeSet[2] === '0' ? begid : -1, /* currently unused */
                bin: codeBin,
            }
        } else {
            const sixteenBits =                                 /* 16-bit Data/Header character */

                decToBin(code2, 4) +                            /* Bits  0-3  :           code2 */
                (sequences ? '1' : '0') +                       /* Bit    4   :      sequences? */
                (beginId >= 0 ? decToBin(beginId, 3) : '000') + /* Bits  5-7  : beginID | code3 */
                (repeatBefore ? '1' : '0') +                    /* Bit    8   :      input RLE? */
                (repeatAfter ? '1' : '0') +                     /* Bit    9   :     output RLE? */
                (beginId >= 0 ? '1' : '0') +                    /* Bit   10   :        beginID? */
                decToBin(code, 5);                              /* Bits 11-15 :           code1 */
            
            return binToDec(sixteenBits);
        }
    }

    const SEQUENCE_MARKER = '\uDBFF'; /* Private Use Area */

    function findSequences(str, minLength = 2, minCount = 3) {
        const repeats = [];
        const n = str.length;
        
        for (let i = 0; i < n - minLength * minCount + 1; i++) {
            for (let len = 2; len <= Math.min(30, Math.floor((n - i) / minCount)); len++) {
                const pattern = str.substr(i, len);
                if (pattern.includes(SEQUENCE_MARKER)) continue;
                
                let count = 1;
                for (let j = i + len; j <= n - len; j += len) {
                    if (str.substr(j, len) === pattern) {
                        count++;
                    } else {
                        break;
                    }
                }
                
                if (count >= minCount) {
                    const end = i + len * count;
                    let overlaps = false;
                    for (const r of repeats) {
                        if (i < r.end && end > r.start) {
                            overlaps = true;
                            break;
                        }
                    }
                    
                    if (!overlaps) {
                        repeats.push({
                            start: i,
                            end: end,
                            length: len,
                            pattern: pattern,
                            count: count,
                            saved: (len * count) - (len + 3)
                        });
                        i = end - 1;
                        break;
                    }
                }
            }
        }
        
        return repeats.sort((a, b) => b.saved - a.saved);
    }

    function compressSequences(str) {
        if (str.length < 20) return {compressed: str, sequences: false};
        
        if (str.includes(SEQUENCE_MARKER)) {
            return {compressed: str, sequences: false};
        }
        
        const repeats = findSequences(str, 2, 3);
        if (repeats.length === 0) return {compressed: str, sequences: false};
        
        const selected = [];
        let covered = new Array(str.length).fill(false);
        
        for (const repeat of repeats) {
            let canUse = true;
            for (let i = repeat.start; i < repeat.end; i++) {
                if (covered[i]) {
                    canUse = false;
                    break;
                }
            }
            
            if (canUse && repeat.saved > 0) {
                selected.push(repeat);
                for (let i = repeat.start; i < repeat.end; i++) {
                    covered[i] = true;
                }
            }
        }
        
        if (selected.length === 0) return {compressed: str, sequences: false};

        let result = '';
        let pos = 0;
        
        for (const repeat of selected) {
            if (pos < repeat.start) {
                result += str.slice(pos, repeat.start);
            }
            
            /* sequence encoding: [marker][length][count][pattern] */
            const lengthChar = String.fromCharCode(Math.min(repeat.length, 30) + 32);
            const countChar = String.fromCharCode(Math.min(repeat.count, 65535) + 32);
            result += SEQUENCE_MARKER + lengthChar + countChar + repeat.pattern;
            
            pos = repeat.end;
        }
        
        if (pos < str.length) {
            result += str.slice(pos);
        }
        
        /* check if it's worth it */
        if (result.length < str.length * 0.9) { /* at least 10% */
            return {compressed: result, sequences: true};
        }
        
        return {compressed: str, sequences: false};
    }

    function decompressSequences(str) {
        let result = '';
        let i = 0;
        
        while (i < str.length) {
            if (str.charCodeAt(i) === 0xDBFF) {
                i++;
                
                if (i + 2 >= str.length) {
                    result += SEQUENCE_MARKER;
                    continue;
                }
                
                const length = str.charCodeAt(i) - 32;
                const count = str.charCodeAt(i + 1) - 32;
                i += 2;
                
                if (i + length > str.length) {
                    result += SEQUENCE_MARKER + 
                             String.fromCharCode(length + 32) + 
                             String.fromCharCode(count + 32) +
                             str.slice(i);
                    break;
                }
                
                const pattern = str.substr(i, length);
                i += length;
                
                for (let j = 0; j < count; j++) {
                    result += pattern;
                }
            } else {
                result += str.charAt(i);
                i++;
            }
        }
        
        return result;
    }

    /**
     * **JavaScript String Compressor - compress function.**
     * @param {string} str string
     * @returns {string} Compressed string
     * @example compress('Hello, World!');
     * @since 1.0.0
     */
    function compress(str) {
        if (typeof str != 'string') throw new Error('Invalid input.');
        let repeatBefore = false;
        function repeatChars(txt) {
            return txt.replace(/(.)\1+/g, ( a , b ) => b + a.length);
        }
        let beginId = -1;
        for (const begin of _JSSC._begin) {
            if (str.startsWith(begin)) {
                beginId = _JSSC._begin.indexOf(begin);
                str = str.slice(begin.length);
                break;
            }
        }
        const d = (txt) => !/\d/.test(txt);
        if (d(str)) {
            str = repeatChars(str);
            repeatBefore = true;
        }
        const strdata = stringCodes(str);
        const ascii = strdata.maxCharCode < 256;
        let repeatAfter = false;
        let sequences = false;
        
        function processCompression(output) {
            const hasDigits = /\d/.test(output);
            if (!hasDigits) {
                repeatAfter = true;
                output = repeatChars(output);
            }
            
            if (true) {
                const compressed = compressSequences(output);
                if (compressed.sequences) {
                    sequences = true;
                    return compressed.compressed;
                }
            }
            
            return output;
        }

        const UniqueCodes = [...new Set(strdata.output)];
        if (/^\d+$/.test(str)) { /* Numbers */
            /* Up to 8:1 compression ratio */
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
            let output = '';
            function binPadStart(bin) {
                if (bin.length < 16) {
                    const numm = 4 - stringChunks(bin, 4).length;
                    return decToBin(15, 4).repeat(numm)+bin;
                } else return bin;
            }
            for (const character of chunkArray(binOut, 4)) {
                output += String.fromCharCode(binToDec(binPadStart(character.join(''))));
            }
            output = processCompression(output);
            return charCode(cryptCharCode(3, false, false, repeatAfter, -1, 0, sequences)) + output;
            
        } else if (strdata.max === 2 && strdata.min === 2) {
            let chars = strdata.output;
            let output = '';
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
            output = processCompression(output);
            return charCode(cryptCharCode(1, false, repeatBefore, repeatAfter, beginId, 0, sequences)) + output;
            
        } else if (ascii) {
            /* Up to 2:1 compression ratio */
            /*
                Bytes

                ---

                UTF16 : xxxx xxxx  xxxx xxxx
                ASCII : xxxx xxxx

                ---

                input: UTF16 => ASCII

                output: ASCII => UTF16
                        1 UTF16 char = 2 ASCII chars
            */
            const twoChars = [];
            let output = '';
            for (const chars_ of stringChunks(str, 2)) {
                let charsCode = '';
                for (const char of chars_.split('')) {
                    charsCode += decToBin(char.charCodeAt(0), 8);
                }
                twoChars.push(charsCode);
            }
            for (const char of twoChars) {
                output += String.fromCharCode(binToDec(char));
            }
            output = processCompression(output);
            return charCode(cryptCharCode(2, false, repeatBefore, repeatAfter, beginId, 0, sequences)) + output;
            
        } else {
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
                let outputStr = '';
                for (const characterCode of convertCharCodes) {
                    outputStr += String.fromCharCode(binToDec(characterCode))
                }
                /* Up to 2:1 compression ratio */
                outputStr = processCompression(outputStr);
                return charCode(cryptCharCode(charEncodingID + 5, false, repeatBefore, repeatAfter, beginId, 0, sequences)) + outputStr;
                
            } else if (UniqueCodes.length < 16) {
                /* Up to 4:1 compression ratio */
                const chars = UniqueCodes;
                let output = '';
                for (const char of chars) {
                    output += String.fromCharCode(char);
                }
                
                let char_ = [];
                for (const charCode of strdata.output) {
                    const index = UniqueCodes.indexOf(charCode);
                    
                    if (char_.length === 4) {
                        let outchar = '';
                        for (const index of char_) {
                            outchar += decToBin(index, 4);
                        }
                        output += String.fromCharCode(binToDec(outchar));
                        char_ = [];
                    }
                    char_.push(index);
                }
                
                if (char_.length > 0) {
                    let outchar = '';
                    for (const index of char_) {
                        outchar += decToBin(index, 4);
                    }
                    output += String.fromCharCode(binToDec(outchar.padStart(16, '1')));
                }
                
                output = processCompression(output);
                return charCode(cryptCharCode(4, false, repeatBefore, repeatAfter, beginId, UniqueCodes.length, sequences)) + output;
            }

            /* 1:1 compression ratio (no compression) */
            let output = processCompression(str);
            return charCode(cryptCharCode(0, false, repeatBefore, repeatAfter, beginId, 0, sequences)) + output;
        }
    }

    function characterEncodings(strcode, realstr) {
        const strcode2charencoding = {};
        for (const [name, code] of Object.entries(_JSSC._IDs)) {
            strcode2charencoding[code] = name
        }
        const possibleCharEncoding = strcode2charencoding[strcode - 5];
        if (possibleCharEncoding) {
            const characterEncodings_ = new _JSSC.use();
            const characterEncoding = characterEncodings_['JSSC'+possibleCharEncoding]();
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

    /**
     * **JavaScript String Compressor - decompress function.**
     * @param {string} str Compressed string
     * @returns {string} Decompressed string
     * @since 1.0.0
     */
    function decompress(str) {
        if (typeof str != 'string') throw new Error('Invalid input.');
        const strcodes = cryptCharCode(str.charCodeAt(0) - 32, true);
        const strcode = strcodes.code;
        
        function repeatChars(txt) {
            return txt.replace(/(\D)(\d+)/g, (_, g1, g2) => g1.repeat(g2));
        }
        
        /* sequences */
        let realstr = str.slice(1);
        if (strcodes.sequences) {
            realstr = decompressSequences(realstr);
        }
        
        /* RLE */
        if (strcodes.repeatAfter) {
            realstr = repeatChars(realstr);
        }
        
        function begin(out) {
            if (strcodes.beginId >= 0) {
                return _JSSC._begin[strcodes.beginId] + out;
            } else return out;
        }
        
        function processOutput(out) {
            if (strcodes.repeatBefore) {
                return repeatChars(begin(out));
            } else return begin(out);
        }
        
        let output = '';
        switch (strcode) {
            case 0:
                return processOutput(realstr);
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
                return processOutput(output);
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
                return processOutput(output);
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
                return processOutput(output);
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
                return processOutput(output);
            default:
                const decoded = characterEncodings(strcode, realstr);
                if (decoded) {
                    return processOutput(decoded);
                }
                throw new Error('Invalid compressed string');
        }
    }

    return {
        compress,
        decompress,
        get [Symbol.toStringTag]() {
            return 'JSSC';
        }
    };

}));
