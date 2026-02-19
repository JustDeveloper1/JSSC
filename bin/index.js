#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { compress, decompress } from "../src/index.js";
import { prefix, version, semver, format, fileprefix, name__ } from "../lib/meta.js";
import { SemVer, gt } from "semver";
import JUSTC from "justc";
import { concat } from 'uint8arrays/concat';
import crc32 from 'crc-32';
import { convertBase } from "../lib/third-party/convertBase.js";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const args = process.argv.slice(2);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mode = -1;
let file = -1;
let input = '';
let output = '';
let str = false;
let config = '';
let print = false;
function invalidArgs() {
    console.log(prefix+'Invalid arguments.');
    process.exit(1);
}
function help() {
    console.log(
        name__ + ' v' + version + ' CLI\n\n' +
        'Usage:\n' +
        'jssc <inputFile>\n' +
        'jssc <inputFile> <outputFile>\n' +
        'jssc <inputFile> --decompress\n' +
        'jssc <inputFile> <outputFile> -- decompress\n\n' +
        'Flags:\n' +
        '-C              \t  --compress                \t:\tCompress input string/file. (default)\n' +
        '-c <file.justc> \t  --config     <file.justc> \t:\tSet custom compressor configuration, same as the JS API, but it should be a JUSTC language script.\n' +
        '-d              \t  --decompress              \t:\tDecompress input string/file.\n' +
        '-h              \t  --help                    \t:\tPrint JSSC CLI usage and flags.\n' +
        '-i <input>      \t  --input      <input>      \t:\tSet input file path / Set input string.\n' +
        '-o <output.jssc>\t  --output     <output.jssc>\t:\tSet output file path.\n' +
        // '-p              \t  --print                   \t:\tPrint output file.\n' +
        // '-s              \t  --string                  \t:\tSet input type to string.\n' +
        '-v              \t  --version                 \t:\tPrint current JSSC version.\n' +
        '-wi             \t  --windows-install         \t:\tInstall JSSC Windows integration.\n' +
        '-wu             \t  --windows-uninstall       \t:\tUninstall JSSC Windows integration.'
    )
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
            execSync('node '+path.resolve(__dirname, "./windows/install.js"));
            break;
        }
        case '-wu': case '--windows-uninstall': {
            execSync('node '+path.resolve(__dirname, "./windows/uninstall.js"));
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
    console.log(prefix+'Missing input.');
    process.exit(1);
} else if (mode == -1 && input != '') {
    mode = 0;
}
if (args.length == 0) help();
if (mode == -1) process.exit(0);

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
    base64IntegerEncoding: true
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
        console.log(prefix+'Invalid input.');
        process.exit(1);
    }

    let output = await collectFiles(out) || [out];
    let addFormat = false;
    if (output.length > 1) {
        output = [path.join(getRoot(out), path.parse(inp).name)];
        addFormat = true;
    }

    else if (output[0] == '' && isFile) {
        addFormat = true;
        if (isDir) output = [getRoot(inp)];
        else if (path.extname(inp).length > 0) output = [inp.slice(0, -(path.extname(inp).length))];
        else output = [inp];
    }

    let config = await collectFiles(cfg) || [''];
    if (config.length > 1) {
        console.log(prefix+'Invalid config input.');
        process.exit(1);
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
        const files = {};
        for (const file of input) {
            files[await compress(file, config)] = await compress(fs.readFileSync(file, { encoding: 'utf8' }), config);
        }

        const out = [
            semver.major,
            semver.minor,
            isDir == null ? '' : isDir ? 1 : 0,
            files
        ]
        const checksum = crc32.str(JSON.stringify(out));

        const result = concat([fileprefix,
            await compressEncoded(
                new TextEncoder().encode(JSON.stringify(
                    [
                        ...out,
                        convertBase(checksum.toString(10), 10, 64)
                    ]
                ).slice(1,-1))
            )
        ]);
        fs.writeFileSync(output[0] + (
            addFormat ? format : ''
        ), result);
        process.exit(0);
    } else {
        const raw = fs.readFileSync(input[0]);
        const data = new TextDecoder().decode(await decompressEncoded(raw.subarray(fileprefix.length)));

        const type = new TextDecoder().decode(raw.subarray(0, fileprefix.length));
        if (type != new TextDecoder().decode(fileprefix)) {
            console.log(prefix+'Input file type is not JSSC1.');
            process.exit(1);
        }

        const arr = JSON.parse('[' + data + ']');

        const ver = makeSemVer(arr[0], arr[1]);
        if (gt(ver, makeSemVer(semver.major, semver.minor))) {
            console.log(prefix+'Input file was compressed with a higher JSSC version.');
            process.exit(1);
        }

        const checksum = arr[4];
        if (convertBase(crc32.str(JSON.stringify(arr.slice(0,4))).toString(10), 10, 64) != checksum) {
            console.log(prefix+'Input file was corrupted.');
            process.exit(1);
        }

        const isDir = arr[2] == '' ? null : arr[2] == 1;
        const files = {};

        for (const [key, value] of Object.entries(arr[3])) {
            files[await decompress(key)] = await decompress(value);
        }

        for (const [filePath, content] of Object.entries(files)) {
            const fullPath = isDir
                ? path.join(output[0], filePath)
                : output[0];

            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, content, { encoding: 'utf8' });
        }
        process.exit(0);
    }
})(input, output, config);
