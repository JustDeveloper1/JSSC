import { prefix } from "./meta";

export const freqMap = {
    ESCAPE_BYTE: 0xFF,
    TOP_COUNT: 254,
    SPLITTER: " \u200B",

    compress(text, splitter = this.SPLITTER) {
        const freq = {};
        for (let char of text) {
            freq[char] = (freq[char] || 0) + 1;
        }

        const topChars = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, this.TOP_COUNT)
            .map(entry => entry[0]);

        const charToIndex = new Map(topChars.map((char, i) => [char, i]));
        
        let header = String.fromCharCode(topChars.length) + topChars.join('');
        
        let bytes = [];
        for (let char of text) {
            if (charToIndex.has(char)) {
                /* frequent */
                bytes.push(charToIndex.get(char));
            } else {
                /* rare */
                bytes.push(this.ESCAPE_BYTE);
                const code = char.charCodeAt(0);
                bytes.push((code >> 8) & 0xFF);
                bytes.push(code & 0xFF);
            }
        }

        /* to UTF16 */
        let compressedBody = "";
        for (let i = 0; i < bytes.length; i += 2) {
            const b1 = bytes[i];
            const b2 = (i + 1 < bytes.length) ? bytes[i + 1] : 0x00;
            compressedBody += String.fromCharCode((b1 << 8) | b2);
        }

        return header + splitter + compressedBody;
    },

    decompress(compressedText, splitter = this.SPLITTER) {
        const parts = compressedText.split(splitter);

        if (parts.length < 2) {
            throw new Error(prefix+'Invalid freqMap data: splitter not found');
        }

        const headerPart = parts[0];
        const bodyPart = parts.slice(1).join(splitter);

        const topCount = headerPart.charCodeAt(0);
        const topChars = headerPart.substring(1, topCount + 1);
        
        let bytes = [];
        for (let i = 0; i < bodyPart.length; i++) {
            const code = bodyPart.charCodeAt(i);
            bytes.push((code >> 8) & 0xFF);
            bytes.push(code & 0xFF);
        }

        let result = "";
        for (let i = 0; i < bytes.length; i++) {
            const b = bytes[i];
            if (b === this.ESCAPE_BYTE) {
                const charCode = (bytes[i + 1] << 8) | bytes[i + 2];
                result += String.fromCharCode(charCode);
                i += 2;
            } else if (b < topCount) {
                result += topChars[b];
            }
        }
        return result;
    },

    /**
     * 0 = Fail
     * 1 = Success
     * 2 = Remove last character (Success)
     * @param {string} text
     * @param {string?} splitter
     * @returns {number|[number, number, string, string]}
     */
    test(text, splitter = this.SPLITTER) {
        try {
            if (text.includes(splitter)) return 0;
            const packed = this.compress(text, splitter);
            const unpacked = this.decompress(packed, splitter);
            if (packed.length < text.length) {
                if (unpacked == text) return [1, packed.length, splitter, packed];
                else if (unpacked.slice(0,-1) == text) return [2, packed.length, splitter, packed];
                else return 0;
            }
            return 0;
        } catch (_) {
            return 0;
        }
    }
};

export const freqMapSplitters = [
    " \u200B","\u0000",
    "\u001F", "\u0001",
    "\uFFFD", "\u2022",
    "|§|",    "\uFEFF"
];
