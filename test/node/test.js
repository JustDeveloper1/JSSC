const {compress, decompress} = require('../../index.js');

const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
const compressed = compress(text);
const decompressed = decompress(compressed);

if (decompressed != text) throw new Error('Failed to decompress. decompress(text) != text');

const saved = (text.length - compressed.length) * 16;
const tbits = text.length * 16;
const cbits = compressed.length * 16;
const dbits = decompressed.length * 16;

const lines = [
    `Saved ${saved / 8} bytes.`, '',
    `Text         (${tbits / 8} bytes)           :   ${text}`,
    `Compressed   (${cbits / 8} bytes)           :   ${compressed.padStart(decompressed.length, ' ')}`,
    `Decompressed (${dbits / 8} bytes)           :   ${decompressed}`,
]; lines[0] = lines[0].padStart(Math.floor(lines[2].length / 2 - lines[0].length / 2), ' ');
for (const line of lines) console.log(line);
