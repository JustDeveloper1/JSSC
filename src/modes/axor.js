export function compress(str) {
    const original = Array.from(str, ch => ch.charCodeAt(0));
    const N = original.length;
    if (N === 0) return null;

    let bestSize = N;
    let bestMode = -1;
    let bestPacked = null;

    for (let i = 0; i < 16; i++) {
        const constVal = i * 256;
        const xored = original.map(v => v ^ constVal);

        const bits = [];
        const bytes = [];
        for (const v of xored) {
            if (v >= 256) {
                bits.push(1);
                bytes.push(v >> 8, v & 0xFF);
            } else {
                bits.push(0);
                bytes.push(v);
            }
        }

        const bitWords = [];
        for (let j = 0; j < N; j += 16) {
            let word = 0;
            for (let b = 0; b < 16 && j + b < N; b++) {
                if (bits[j + b]) word |= (1 << b);
            }
            bitWords.push(word);
        }

        const dataWords = [];
        for (let j = 0; j < bytes.length; j += 2) {
            const b1 = bytes[j];
            const b2 = (j + 1 < bytes.length) ? bytes[j + 1] : 0;
            dataWords.push((b1 << 8) | b2);
        }

        const totalWords = 1 + bitWords.length + dataWords.length;
        if (totalWords < bestSize) {
            bestSize = totalWords;
            bestMode = i;
            bestPacked = [N, ...bitWords, ...dataWords];
        }
    }

    if (bestMode !== -1) return [String.fromCharCode(...bestPacked), bestMode];
    return null;
}

export function decompress(compressed, mode) {
    const words = Array.from(compressed, ch => ch.charCodeAt(0));
    const N = words[0];
    const bitWordsCount = Math.ceil(N / 16);
    const bitWords = words.slice(1, 1 + bitWordsCount);
    const dataWords = words.slice(1 + bitWordsCount);

    const bits = [];
    for (let i = 0; i < N; i++) {
        const w = bitWords[Math.floor(i / 16)];
        bits.push(((w >> (i % 16)) & 1) === 1);
    }

    const bytes = [];
    for (const w of dataWords) {
        bytes.push(w >> 8, w & 0xFF);
    }
    const totalBytes = N + bits.filter(b => b).length;
    bytes.length = totalBytes;

    const xored = [];
    let byteIdx = 0;
    for (let i = 0; i < N; i++) {
        if (bits[i]) {
            xored.push((bytes[byteIdx++] << 8) | bytes[byteIdx++]);
        } else {
            xored.push(bytes[byteIdx++]);
        }
    }

    const constVal = mode * 256;
    const original = xored.map(v => v ^ constVal);
    return String.fromCharCode(...original);
}
