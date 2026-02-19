#!/usr/bin/env node

if (process.platform !== "win32") {
    process.exit(0);
}

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import https from "https";
import { fileURLToPath } from "url";
import { confirm } from "./confirm.js";
import { name__ } from "../../lib/meta.js";

if (
    (()=>{
        try {
            execSync('reg query HKCU\\Software\\Classes\\.jssc', { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    })()
) {
    process.exit(0);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICON_URL = "https://jssc.js.org/favicon.ico";
const APP_NAME = "JSSC";
const EXT = ".jssc";

const installDir = path.join(
    process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"),
    "JSSC"
);

const iconPath = path.join(installDir, "jssc.ico");
const localPkg = path.join(installDir, "pkg");
const localBin = path.join(localPkg, "bin");

const pkgRoot = path.resolve(__dirname, "../../");
const cliPath = path.resolve(localBin, "./index.js");
const nodePath = process.execPath;

function run(cmd) {
    execSync(cmd, { stdio: "ignore" });
}

function downloadIcon() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(installDir)) {
            fs.mkdirSync(installDir, { recursive: true });
        }

        const file = fs.createWriteStream(iconPath);

        https.get(ICON_URL, res => {
            if (res.statusCode !== 200) {
                reject(new Error("Failed to download icon"));
                return;
            }

            res.pipe(file);
            file.on("finish", () => {
                file.close(resolve);
            });
        }).on("error", reject);
    });
}

async function setup() {
    await downloadIcon();

    fs.mkdirSync(localPkg, {
        recursive: true
    });
    fs.cpSync(pkgRoot, localPkg, {
        recursive: true,
        force: true
    });

    run(`reg add HKCU\\Software\\Classes\\${EXT} /ve /d ${APP_NAME} /f`);

    // Description
    run(`reg add HKCU\\Software\\Classes\\${APP_NAME} /ve /d "JSSC Archive" /f`);

    // Icon
    run(`reg add HKCU\\Software\\Classes\\${APP_NAME}\\DefaultIcon /ve /d "${iconPath}" /f`);

    // Open command
    run(`reg add HKCU\\Software\\Classes\\${APP_NAME}\\shell\\open\\command /ve /d "\\"${nodePath}\\" \\"${cliPath}\\" \\"%1\\" -v -d" /f`);

    // Context menu (files)
    run(`reg add HKCU\\Software\\Classes\\*\\shell\\JSSC /ve /d "Compress to JSSC (.jssc)" /f`);
    run(`reg add HKCU\\Software\\Classes\\*\\shell\\JSSC\\command /ve /d "\\"${nodePath}\\" \\"${cliPath}\\" \\"%1\\" -v" /f`);
    run(`reg add HKCU\\Software\\Classes\\*\\shell\\JSSC /v Icon /d "${iconPath}" /f`);

    // Context menu (dirs)
    run(`reg add HKCU\\Software\\Classes\\Directory\\shell\\JSSC /ve /d "Compress to JSSC (.jssc)" /f`);
    run(`reg add HKCU\\Software\\Classes\\Directory\\shell\\JSSC\\command /ve /d "\\"${nodePath}\\" \\"${cliPath}\\" \\"%1\\" -v" /f`);
    run(`reg add HKCU\\Software\\Classes\\Directory\\shell\\JSSC /v Icon /d "${iconPath}" /f`);
}

if (confirm(name__, 
    'Thanks for using JavaScript String Compressor.\n\n' +
    'Would you like to install JSSC to your computer? This includes:\n' +
    '- .jssc file format support;\n' +
    '- "Compress to JSSC (.jssc)" file explorer context menu button;\n' +
    '- Decompress .jssc files on open.\n\n' +
    'JSSC website and documentation: https://jssc.js.org/\n' +
    'Source code GitHub repository: https://github.com/JustDeveloper1/JSSC\n\n' +
    'To uninstall JSSC Windows integration, run "npx jssc -wu" (or "jssc -wu" if JSSC is installed globally) BEFORE UNINSTALLING NPM PACKAGE.\n\n' +
    'JSSC (JavaScript String Compressor) is an open-source lossless string compression algorithm.\n© 2025-2026 JustDeveloper\n\n' + 
    '[Yes] - Install JSSC Windows integration\n' + 
    '[No] - Do not install JSSC Windows integration'
)) setup().catch(err => {
    console.error("Installation failed:", err.message);
    process.exit(1);
});
