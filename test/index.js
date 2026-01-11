const JSSC = require('../index.js');

function stringChunks(str, num) {
    const output = [];
    for (let i = 0; i < str.length; i += num) {
        output.push(str.slice(i, i + num))
    }
    return output
}

const modes = [
    '00: No compression',
    '01: 2-3 characters in 1',
    '02: ASCII in UTF-16',
    '03: Integers (Any)',
    '04: Build alphabet',
    '05: Character encoding',
    '06: Integers ( < 15 )',
    '07: Frequency map',
    '08: URL',
    '09: Segmentation',
    '10: Repeating strings',
    '11: RESERVED',
    '12: RESERVED',
    '13: RESERVED',
    '14: RESERVED',
    '15: RESERVED',
    '16: RESERVED',
    '17: RESERVED',
    '18: RESERVED',
    '19: RESERVED',
    '20: RESERVED',
    '21: RESERVED',
    '22: RESERVED',
    '23: RESERVED',
    '24: RESERVED',
    '25: RESERVED',
    '26: RESERVED',
    '27: RESERVED',
    '28: RESERVED',
    '29: RESERVED',
    '30: RESERVED',
    '31: Recursive compression',
];

async function test(text, name) {
    console.info('\n\n\n\n\nRunning compress tests (', name, ') ...');

    const a = await JSSC.compress(text);
    const b = await JSSC.decompress(a);
    const c = a.charCodeAt(0).toString(2).padStart(16, '0');

    const toString = typeof text != 'object' ? String(text) : JSON.stringify(text);
    const success = [
        text == b, 
        a.length <= toString.length,
    ];
    const result = success[0] && success[1];

    const data = a.slice(0,1);
    const bits = stringChunks(c, 4).join(' ');
    const blocks = [];
    const code = [];

    for (const [x,y] of [
        [0,4],  [4,5], 
        [5,8],  [8,9], 
        [9,10], [10,11], [11]
    ]) blocks.push(c.slice(x,y));
    
    for (const [x,y] of [
        [11], [0,4], [5,8]
    ]) code.push(parseInt(c.slice(x,y), 2));

    console.log(
        '\n\n\nOriginal:', text, '\n\nCompressed:', a, '\n\nDecompressed:', b, 
        '\n\n\nSuccess?', result, '(Decompressed successfully?', success[0], '; Compressed size ≤ Original size?', success[1], ')\nOriginal size:', toString.length * 16, 'bits\nCompressed size:', a.length * 16, 'bits\nSaved:', toString.length * 16 - a.length * 16, 'bits\nRatio:', (toString.length * 16) / (a.length * 16), 
        ': 1\n\n\n16-bit Data/Header character:', data, '\nCharCode:', data.charCodeAt(0), '\nBits:', bits, '\nBlocks:', ...blocks, '\nCode 1:', code[0], '\nCode 2:', code[1], c.slice(10,11) == '1' ? '\nBeginID:' : '\nCode 3:', code[2], '\nSequences?', c.slice(4,5) == '1', (code[1] > 0 && code[0] == 0) || code[0] == 6 ? '\nReturn as number?' : '\nInput RLE?', c.slice(8,9) == '1', '\nOutput RLE?', c.slice(9,10) == '1', '\nCode 3 is BeginID?', c.slice(10,11) == '1',
        '\n\nMode:', modes[code[0]], '\n\n\n\n\n'
    );

    return result;
}
async function runTest(text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', name = 'Lorem ipsum') {
    const result = await test(text, name);
    if (!result) throw new Error('Failed to decompress. decompress(text) != text');
}

const tests = async function () {
    await runTest().catch(()=>{});
    await runTest('foo'.repeat(1000), 'foo x1000').catch(()=>{});
    await runTest('ыалалыылаар', 'ыалалыылаар').catch(()=>{});
    await runTest(String(Math.round(Math.random() * 256000000)), 'random numbers').catch(()=>{});
    await runTest('asdasdsasdsadsdadsadssssssssssssssssssssыꙮ'.repeat(15), 'absolutely random stuff').catch(()=>{});
}

tests().catch(()=>{})
