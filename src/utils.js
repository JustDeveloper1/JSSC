export function stringCodes(str) {
    let output = [];
    let max = 0;
    let maxCharCode = 0;
    let minCharCode = 65535;
    let min = Infinity;
    String(str).split('').forEach(char => {
        const code = char.charCodeAt();
        output.push(code);
        max = Math.max(max, code.toString().length);
        maxCharCode = Math.max(maxCharCode, code);
        min = Math.min(min, code.toString().length);
        minCharCode = Math.min(minCharCode, code);
    });
    return {max, output, maxCharCode, min, minCharCode};
}

export function codesString(cds) {
    let output = '';
    cds.forEach(code => {
        output += String.fromCharCode(code);
    });
    return output
}

export function charCode(num) {
    return String.fromCharCode(num + 32);
}
export function checkChar(cde) {
    return cde % 65535 === cde
}

export function stringChunks(str, num) {
    const output = [];
    for (let i = 0; i < str.length; i += num) {
        output.push(str.slice(i, i + num))
    }
    return output
}
export function chunkArray(array, num) {
    const result = [];
    for (let i = 0; i < array.length; i += num) {
        result.push(array.slice(i, i + num));
    }
    return result;
}

export function decToBin(num, wnum) {
    return num.toString(2).padStart(wnum, '0');
}
export function binToDec(str) {
    return parseInt(str, 2);
}

export function B64Padding(str) {    
    const padding = str.length % 4;

    if (padding === 2) {
        str += '==';
    } else if (padding === 3) {
        str += '=';
    }

    return str;
}
