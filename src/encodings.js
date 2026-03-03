import { name__ } from "../lib/meta.js";

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

export const _JSSC = {};
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
    'B':    12,
    'E':    13,
    'AR':   14
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
    chrsBase[229] = chrsBase[0];
    chrsBase[0] = "\x00";
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
_JSSC.B = function() { /* Baltic */
    const chrsBase = charsLatin();
    for (let i = 0x100; i < 0x17F; i++) {
        chrsBase[i - 128] = _JSSC._char(i);
    }
    chrsBase[255] = _JSSC._char(0x17F); /* U+017F */
    return chrsBase;
};
_JSSC.E = function() { /* European */
    const chrsBase = charsLatin();
    for (let i = 0x80; i < 0xFF; i++) {
        chrsBase[i] = _JSSC._char(i);
    }
    chrsBase[255] = _JSSC._char(0x17F); /* U+017F */
    return chrsBase;
};
_JSSC.AR = function() { /* Arabic */
    const chrsBase = {};
    for (let i = 0x600; i < 0x6FF; i++) {
        chrsBase[i - 1536] = _JSSC._char(i);
    }
    chrsBase[255] = chrsBase[0];
    chrsBase[0] = "\x00";
    return chrsBase;
}
_JSSC.use = class {
    constructor() {
        let output = {};
        for (const [name, func] of Object.entries(_JSSC)) {
            if (typeof func === 'function' && !name.startsWith('_') && name != 'use') {
                output[name__+name] = func;
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
