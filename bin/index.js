#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { compress, decompress } from "../src/index.js";
import { prefix, version, format, name__ } from "../lib/meta.js";
import { fileprefix, semver } from "../lib/meta.bin.js";
import { SemVer, gt } from "semver";
import JUSTC from "justc";
import { concat } from 'uint8arrays/concat';
import crc32 from 'crc-32';
import { convertBase } from "../lib/third-party/convertBase.js";
import { fileURLToPath } from "url";
import { execSync, spawn } from "child_process";
import { compress as compressUI, message } from "./windows/import.cjs";

const args = process.argv.slice(2);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const currentdir = process.cwd();

const _winUI = path.resolve(__dirname, "./windows/ui");
const _winUIWait = path.resolve(_winUI, "./wait.ps1");
function winUIWait(text) {
    return spawn("powershell", [
        "-NoProfile", 
        "-ExecutionPolicy", "Bypass", 
        "-File", _winUIWait,
        "-Name", name__,
        "-Text", text
    ], { detached: false, stdio: 'ignore' });
}

let WinUIWait = false;
let windows = false;
function exit(code, err) {
    if (WinUIWait) WinUIWait.kill();

    if (code == 1 && windows) message(name__, err);

    process.exit(code);
}

let mode = -1;
let file = -1;
let input = '';
let output = '';
let str = false;
let config = '';
let print = false;
function invalidArgs() {
    const e = 'Invalid arguments.';
    console.log(prefix + e);
    exit(1, e);
}
function help() {
    console.log(
        name__ + ' v' + version + ' CLI\n\n' + (
            'Usage:\n\n' +
            'jssc <inputFile>\n' +
            'jssc <inputFile> <outputFile>\n' +
            'jssc <inputFile> --decompress\n' +
            'jssc <inputFile> <outputFile> --decompress\n\n\n' +
            'Flags:\n\n' +
            'Short flag,  Argument(s),  \tFlag,               Argument(s)   \t:\t Description\n' +
            '---------------------------\t----------------------------------\t÷\t ------------------------------------------------------------------------------------------------------\n' +
            '-C                         \t--compress                        \t:\t Compress input string/file. (default)\n' +
            '-c           <file.justc>  \t--config            <file.justc>  \t:\t Set custom compressor configuration, same as the JS API, but it should be a JUSTC language script.\n' +
            '-d                         \t--decompress                      \t:\t Decompress input string/file.\n' +
            '-h                         \t--help                            \t:\t Print JSSC CLI usage and flags.\n' +
            '-i           <input>       \t--input             <input>       \t:\t Set input file path / Set input string.\n' +
            '-o           <output.jssc> \t--output            <output.jssc> \t:\t Set output file path.\n' +
            '-p                         \t--print                           \t:\t Print output file content. Note that JSSC operates on UTF-16, so the printed output may get corrupted.\n' +
            '-s                         \t--string                          \t:\t Set input type to string. The output file type will not be JSSC1, but a compressed string.\n' +
            '-v                         \t--version                         \t:\t Print current JSSC version.\n' +
            '-w                         \t--windows                         \t:\t Use JSSC Windows integration. Synchronously waits for user input. (Requires JSSC Windows integration)\n' +
            '-wi                        \t--windows-install                 \t:\t Install JSSC Windows integration. (Windows only)\n' +
            '-wu                        \t--windows-uninstall               \t:\t Uninstall JSSC Windows integration. (Windows only)'
        ).replaceAll('-\t', '-' + '- '.repeat(3)).replaceAll('\t -', ' -'.repeat(3) + ' -').replaceAll('\t', ' '.repeat(6))
    )
}
function checkWindows() {
    if (process.platform !== "win32") {
        const e = 'process.platform is not "win32".';
        console.log(prefix + e);
        exit(1, e);
    }
}
for (const arg of args) {
    if (file == 0) {
        input = arg;
        file = -1;
    } else if (file == 1) {
        output = arg;
        file = -1;
    } else if (file == 2) {
        config = arg;
        file = -1;
    } else switch (arg) {
        case '-h': case '--help': {
            help();
            break;
        }
        case '-v': case '--version': {
            console.log(version);
            break;
        }
        case '-C': case '--compress': {
            if (mode == -1) mode = 0;
            else invalidArgs();
            break;
        }
        case '-d': case '--decompress': {
            if (mode == -1) mode = 1;
            else invalidArgs();
            break;
        }
        case '-i': case '--input': {
            if (file == -1 && input == '') file = 0;
            else invalidArgs();
            break;
        }
        case '-o': case '--output': {
            if (file == -1 && output == '') file = 1;
            else invalidArgs();
            break;
        }
        case '-s': case '--string': {
            str = true;
            break;
        }
        case '-c': case '--config': {
            if (file == -1 && config == '') file = 2;
            else invalidArgs();
            break;
        }
        case '-p': case '--print': {
            print = true;
            break;
        }
        case '-wi': case '--windows-install': {
            checkWindows();
            execSync('node '+path.resolve(__dirname, "./windows/install.js"));
            break;
        }
        case '-wu': case '--windows-uninstall': {
            checkWindows();
            execSync('node '+path.resolve(__dirname, "./windows/uninstall.js"));
            break;
        }
        case '-w': case '--windows': {
            checkWindows();
            windows = true;
            break;
        }
        default:
            if (input == '') input = arg;
            else if (output == '') output = arg;
            else invalidArgs();
            break;
    }
}

if (mode != -1 && input == '') {
    const e = 'Missing input.'
    console.log(prefix + e);
    exit(1, e);
} else if (mode == -1 && input != '') {
    mode = 0;
}
if (args.length == 0) help();
if (mode == -1) exit(0);

async function collectFiles(targetPath) {
    try {
        const stats = fs.statSync(targetPath);

        if (stats.isFile()) {
            return [targetPath];
        }

        if (stats.isDirectory()) {
            const files = [];

            function walk(dir) {
                for (const entry of fs.readdirSync(dir)) {
                    const full = path.join(dir, entry);
                    const stat = fs.statSync(full);

                    if (stat.isDirectory()) walk(full);
                    else files.push(full);
                }
            }

            walk(targetPath);
            return files;
        }
    } catch (_){}

    return null
}

function getRoot(inp) {
    const parsed = path.parse(inp);
    if (parsed.dir != '') return parsed.dir.split(path.sep)[0];
    return parsed.name;
}

const defaultConfig = {
    JUSTC: true,
    recursiveCompression: true,
    segmentation: true,
    base64IntegerEncoding: true,
    
    debug: false
};

function makeSemVer(major, minor) {
    return new SemVer(major.toString() + '.' + minor.toString() + '.0');
}

async function compressEncoded(data) {
    const stream = new Blob([data]).stream().pipeThrough(new CompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function decompressEncoded(compressed) {
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

const codes = {
    0: {isDir: null,  isFile: false},
    1: {isDir: false, isFile: false},
    2: {isDir: true,  isFile: false},
    3: {isDir: null,  isFile: true },
    4: {isDir: false, isFile: true },
    5: {isDir: true,  isFile: true },
}
const codesReverse = {};
for (const [key, value] of Object.entries(codes)) {
    codesReverse[JSON.stringify(value)] = parseInt(key);
}
function encodeCode(isDir, isFile) {
    return codesReverse[JSON.stringify({isDir, isFile})];
}

function findEmptyDirs(dir) {
    if (!fs.statSync(dir).isDirectory()) return [];

    let emptyDirs = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const path_ = path.join(dir, file.name);
        
        if (file.isDirectory()) {
            emptyDirs = [...emptyDirs, ...findEmptyDirs(path_)];
            
            const content = fs.readdirSync(path_);
            if (content.length === 0) {
                emptyDirs.push(path_);
            }
        }
    }
    return emptyDirs;
}

(async (inp, out, cfg) => {
    const inpF = await collectFiles(inp);
    const isFile = !str ? inpF != null : !str;
    const input = isFile ? inpF : [inp];

    const isDir = (() => {
        try {
            return fs.statSync(inp).isDirectory()
        } catch (_){}
        return null
    })();
    if (mode == 1 && isDir) {
        const e = 'Invalid input.';
        console.log(prefix + e);
        exit(1, e);
    }

    if (!str && inpF == null) {
        const e = 'File not found.';
        console.log(prefix + e);
        exit(1, e);
    }

    let output = await collectFiles(out) || [out];
    let addFormat = false;
    if (output.length > 1) {
        output = [path.join(getRoot(out), path.parse(inp).name)];
        addFormat = true;
    }

    else if (output[0] == '' && isFile) {
        addFormat = true;
        if (isDir) output = [path.join(getRoot(out), path.parse(inp).name)];
        else if (path.extname(inp).length > 0) output = [inp.slice(0, -(path.extname(inp).length))];
        else output = [inp];
    }

    let config = await collectFiles(cfg) || [''];
    if (config.length > 1) {
        const e = 'Invalid config input.';
        console.log(prefix + e);
        exit(1, e);
    }
    config = config[0];
    if (config == '') config = defaultConfig; 
    else {
        config = fs.readFileSync(config, { encoding: 'utf8' });
        config = {
            ...defaultConfig,
            ...await JUSTC.execute(config)
        };
    }

    if (mode == 0) {
        if (isFile && print) {
            const e = 'Invalid arguments. Cannot compress a file/directory to JSSC1 archive and print the result.';
            console.log(prefix + e);
            exit(1, e);
        }
        if (!(()=>{
            if (!windows || !isFile) return true;

            const customConfig = {};

            const res = compressUI(
                name__,
                path.parse(inp).name + path.parse(inp).ext,
                inp,
                config
            );

            try {
                customConfig.JUSTC = res[1].checked1;
                customConfig.recursiveCompression = res[1].checked2;
                customConfig.segmentation = res[1].checked3;
                customConfig.base64IntegerEncoding = res[1].checked4;

                config = {
                    ...config,
                    ...customConfig
                };

                return res[0];
            } catch (_) {
                return false;
            }
        })()) exit(0);

        let extn = '';
        if (!isDir) {
            const extname = path.extname(input[0]);
            if (path.parse(input[0]).name != extname) extn = extname;
        }

        if (windows) WinUIWait = winUIWait('Compressing "' + path.parse(inp).name + '"...');

        if (str) {
            const compressed = await compress(input[0]);
            if (output[0] != '') {
                fs.mkdirSync(path.dirname(output[0]), { recursive: true });
                fs.writeFileSync(output[0], compressed, { encoding: 'utf8' });
            }
            if (print) {
                console.log(compressed);
            }
            exit(0);
        }

        const files = {};
        for (const file of input) {
            files[
                await compress(path.relative(currentdir, file), config)
            ] = await compress(
                fs.readFileSync(file, { encoding: 'utf8' }), 
                config
            );
        }
        for (const dir of findEmptyDirs(inp)) {
            files[await compress(path.relative(currentdir, dir), config)] = 0;
        }

        const out = [
            semver.major,
            semver.minor,
            encodeCode(isDir, isFile),
            files,
            await compress(extn)
        ];
        const checksum = crc32.str(JSON.stringify(out));

        const outputArr = [
            ...out,
            convertBase(checksum.toString(10), 10, 64)
        ];
        const result = concat([fileprefix,
            await compressEncoded(
                new TextEncoder().encode(JSON.stringify(outputArr).slice(1,-1))
            )
        ]);
        fs.writeFileSync(output[0] + (
            addFormat ? format : ''
        ), result);
        exit(0);
    } else {
        if (print && isFile) {
            const e = 'Invalid arguments. Cannot decompress JSSC1 archive and print the result.';
            console.log(prefix + e);
            exit(1, e);
        }
        if (windows) WinUIWait = winUIWait('Decompressing "' + path.parse(inp).name + '"...');

        const raw = isFile ? fs.readFileSync(input[0]) : input[0];

        if (str) {
            const decompressed = await decompress(raw);
            if (output[0] != '') {
                fs.mkdirSync(path.dirname(output[0]), { recursive: true });
                fs.writeFileSync(output[0], decompressed, { encoding: 'utf8' });
            }
            if (print) {
                console.log(decompressed);
            }
            exit(0);
        }
        
        const type = new TextDecoder().decode(raw.subarray(0, fileprefix.length));
        if (type != new TextDecoder().decode(fileprefix)) {
            const e = 'Input file type is not JSSC1. (The file might have been corrupted.)';
            console.log(prefix + e);
            exit(1, e);
        }

        const data = new TextDecoder().decode(await decompressEncoded(raw.subarray(fileprefix.length)));
        const arr = JSON.parse('[' + data + ']');

        const ver = makeSemVer(arr[0], arr[1]);
        if (gt(ver, makeSemVer(semver.major, semver.minor))) {
            const e = 'Input file was compressed with a higher JSSC version.';
            console.log(prefix + e);
            exit(1, e);
        }
        
        const {isDir, isFile_} = codes[arr[2]];
        const extn = await decompress(arr[4]);

        const checksum = arr[5];
        const checksumArr = arr.slice(0,5);
        if (convertBase(crc32.str(JSON.stringify(checksumArr)).toString(10), 10, 64) != checksum) {
            const e = 'Input file was corrupted.';
            console.log(prefix + e);
            exit(1, e);
        }

        const files = {};

        for (const [key, value] of Object.entries(arr[3])) {
            files[await decompress(key)] = value == 0 ? 0 : await decompress(value);
        }

        for (const [filePath, content] of Object.entries(files).sort((a, b) => a[0].length - b[0].length)) {
            const fullPath = path.format(path.parse((isDir
                ? path.join(output[0], filePath)
                : output[0])
                + (!isDir ? extn : '')));

            if (content == 0) {
                fs.mkdirSync(fullPath, { recursive: true });
                continue;
            }

            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, content, { encoding: 'utf8' });
        }
        exit(0);
    }
})(input, output, config);
