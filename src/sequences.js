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

export function compressSequences(str) {
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

export function decompressSequences(str) {
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
