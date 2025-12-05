const {compress, decompress} = require('../../index.js');

function compressTests(text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', name = 'Lorem ipsum') {
    console.info('\n\nRunning compress tests (', name, ') ...');

    const compressed = compress(text);
    const decompressed = decompress(compressed);

    if (decompressed != text) throw new Error('Failed to decompress. decompress(text) != text');

    const saved = (text.length - compressed.length) * 16;
    const tbits = text.length * 16;
    const cbits = compressed.length * 16;
    const dbits = decompressed.length * 16;

    function stringChunks(str, num) {
        const output = [];
        for (let i = 0; i < str.length; i += num) {
            output.push(str.slice(i, i + num))
        }
        return output
    }

    const lines = [
        `Saved ${saved / 8} bytes.`, '',
        `Text         (${tbits / 8} bytes)           :   ${text}`,
        `Compressed   (${cbits / 8} bytes)           :   ${compressed.padStart(decompressed.length, ' ')}`,
        `Decompressed (${dbits / 8} bytes)           :   ${decompressed}`,
        `Ratio                                       :   ${Math.round((tbits / cbits)*1000)/1000}`,
        `Decompressed == Text                        :   ${decompressed == text}`,
        `16-bit Data/Header character (bits)         :   ${stringChunks(compressed.charCodeAt(0).toString(2).padStart(16, '0'), 4).join(' ')}`,
    ]; lines[0] = lines[0].padStart(Math.floor(lines[2].length / 2 - lines[0].length / 2), ' ');
    for (const line of lines) console.log(line);

}

compressTests();
compressTests('foo'.repeat(1000), 'foo x1000');
compressTests('ыалалыылаар', 'ыалалыылаар');
compressTests(String(Math.round(Math.random() * 256000000)), 'random numbers');
compressTests('asdasdsasdsadsdadsadssssssssssssssssssssыꙮ'.repeat(15), 'absolutely random stuff')
