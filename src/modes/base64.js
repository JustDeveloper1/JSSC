import { prefix } from "../meta";
import { B64 } from "../third-party/convertBase";
import { stringChunks, decToBin, binToDec } from "../utils";

function packB64(numbers) {
    let bitString = "";

    for (const num of numbers) {
        if (num < 0 || num > 63)
            throw new Error(prefix+"Base-64 Packing: Out of range!");

        bitString += decToBin(num, 6);
    }

    const paddedLength = Math.ceil(bitString.length / 16) * 16;
    bitString = bitString.padEnd(paddedLength, "0");

    return {
        bin: bitString,
        len: numbers.length
    };
}

function unpackB64(bin, len) {
    const totalBits = len * 6;
    const trimmed = bin.slice(0, totalBits);

    const result = [];

    for (let i = 0; i < trimmed.length; i += 6) {
        result.push(binToDec(trimmed.slice(i, i + 6)));
    }

    return result;
}

export function compressB64(str) {
    const numbers = [];

    for (const ch of str) {
        const index = B64.indexOf(ch);
        if (index === -1)
            throw new Error(prefix+"Invalid Base64 character");
        numbers.push(index);
    }

    const { bin, len } = packB64(numbers);

    let result = "";
    for (const chunk of stringChunks(bin, 16)) {
        result += String.fromCharCode(binToDec(chunk));
    }

    return {
        data: result,
        length: len
    };
}

export function decompressB64(data, len) {
    let bitString = "";

    for (const ch of data) {
        bitString += decToBin(ch.charCodeAt(0), 16);
    }

    const numbers = unpackB64(bitString, len);

    return numbers.map(n => B64[n]).join("");
}
