function splitGraphemes(str) {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        return Array.from(segmenter.segment(str), s => s.segment);
    }
    return Array.from(str);
}

export function segments(str) {
    if (typeof str !== 'string' || str.length === 0) return [];

    str = splitGraphemes(str);

    const THRESHOLD = 128;
    const segs = [];
    let currentSeg = str[0];

    for (let i = 1; i < str.length; i++) {
        const prevCode = str[i - 1].codePointAt(0);
        const currCode = str[i].codePointAt(0);

        if (Math.abs(currCode - prevCode) > THRESHOLD) {
            segs.push(currentSeg);
            currentSeg = str[i];
        } else {
            currentSeg += str[i];
        }
    }

    if (currentSeg) segs.push(currentSeg);

    return segs;
}
