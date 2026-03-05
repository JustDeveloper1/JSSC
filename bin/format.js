import { name__, prefix, type } from "../lib/meta.js";
import { fileprefix, semver } from "../lib/meta.bin.js";
import { SemVer, gt } from "semver";
import { concat } from 'uint8arrays/concat';
import crc32 from 'crc-32';
import { convertBase } from "../lib/third-party/convertBase.js";
import { stringChunks } from "../lib/utils.js";
import JUSTC from "justc";

function int8(n, le = true) {
    const buffer = new ArrayBuffer(1);
    const view = new DataView(buffer);
    view.setInt8(0, n, le);
    return new Uint8Array(buffer);
}

function version() {
    const major = int8(semver.major);
    const minor = int8(semver.minor);
    const patch = int8(semver.patch);
    return concat([major, minor, patch]);
}

function B64toUI8A(B64) {
    const convert = [0, 3, 2, 1];
    const add = convert[B64.length % 4];
    B64 = '0'.repeat(add) + B64;

    const bin6 = [];
    for (let i = 0; i < B64.length; i++) {
        const bin = convertBase(B64[i], 64, 2);
        if (bin != null) bin6.push(bin.padStart(6, '0'));
    }
    
    const bin8 = stringChunks(bin6.join(''), 8);
    const int8 = [add];
    for (let i = 0; i < bin8.length; i++) {
        int8.push(parseInt(bin8[i], 2));
    }

    return new Uint8Array(int8);
}

function UI8AtoB64(UI8A) {
    const remove = UI8A[0];
    const bin8 = [];
    for (let i = 1; i < UI8A.length; i++) {
        bin8.push(UI8A[i].toString(2).padStart(8, '0'));
    }

    const bin6 = stringChunks(bin8.join(''), 6);
    const B64 = [];
    for (let i = 0; i < bin6.length; i++) {
        B64.push(convertBase(bin6[i], 2, 64));
    }

    return B64.join('').slice(remove);
}

function int32(n, le = true) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setInt32(0, n, le);
    return new Uint8Array(buffer);
}

function data(uint8) {
    return concat([int32(uint8.length), uint8]);
}

export async function toFile(isDir, extn, files, dirs) {
    const header = concat([fileprefix, version(), int8(isDir ? 1 : 0)]);

    const extn8 = extn == null ? data(int8(0)) : data(B64toUI8A(extn));

    const fsObjE = Object.entries(files);
    const output = [];
    for (const [path, content] of fsObjE) {
        const path8 = fsObjE.length == 1 ? int32(0) : data(B64toUI8A(path));
        const file8 = data(B64toUI8A(content));

        output.push(path8, file8);
    }
    for (let i = 0; i < dirs.length; i++) {
        const dir8 = data(B64toUI8A(dirs[i]));
        const zero = int32(0);

        output.push(dir8, zero);
    }

    const checksum = int32(crc32.str(await JUSTC.stringify(files)));

    return concat([header, extn8, checksum, ...output]);
}

function makeSemVer([major, minor, patch]) {
    return new SemVer(major + '.' + minor + '.' + patch);
}

function fromInt32(bytes, le = true) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return view.getInt32(0, le);
}

function corrupted() {
    throw new Error(prefix+'Input file was corrupted.');
}

export async function fromFile(uint8) {
    const d = new TextDecoder();

    const filetype = d.decode(uint8.subarray(0,5));
    if (filetype != type) throw new Error(prefix+'Input file type is not '+type);

    const jsscver = makeSemVer(uint8.subarray(5,8));
    if (gt(jsscver, makeSemVer([
        semver.major, semver.minor, semver.patch
    ]))) throw new Error(prefix+`Input file was compressed with a higher ${name__} version.`);

    const isDir = uint8[8] == 1;
    
    let i = 9;
    function read() {
        if (i > uint8.length) return null;
        if (i + 4 > uint8.length) corrupted();

        const length = fromInt32(uint8.subarray(i, i + 4));
        i += 4;

        if (length == 0) return 0;

        if (i + length > uint8.length) corrupted();

        const data = UI8AtoB64(uint8.subarray(i, i + length));
        i += length;

        return data;
    }
    
    const extn = read();
    const checksum = fromInt32(uint8.subarray(i, i + 4));
    i += 4;

    const files = {};
    const dirs = [];
    while (true) {
        const path = read();
        if (path == null) break;

        const content = read();
        if (content == null) corrupted();

        if (content == 0) dirs.push(path);
        else files[path == 0 ? name__ : path] = content;

        if (i == uint8.length) break;
    }

    if (checksum != crc32.str(await JUSTC.stringify(files))) {
        //corrupted();
    }

    return {
        isDir,
        extn: extn == 0 ? '' : extn,
        files,
        dirs
    };
}
