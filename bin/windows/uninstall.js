#!/usr/bin/env node

const isESM = import.meta.url !== undefined;

if (process.platform !== "win32") {
    process.exit(0);
}

async function loadModules() {
    if (isESM) {
        const { execSync } = await import('child_process');
        const fs = await import('fs');
        const path = await import('path');
        const os = await import('os');
        return { execSync, fs, path, os };
    } else {
        return {
            execSync: require('child_process').execSync,
            fs: require('fs'),
            path: require('path'),
            os: require('os')
        };
    }
}

async function uninstall() {
    const { execSync, fs, path, os } = await loadModules();
    
    const APP_NAME = "JSSC";
    const EXT = ".jssc";
    
    const installDir = path.join(
        process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"),
        "JSSC"
    );
    
    function run(cmd) {
        try {
            execSync(cmd, { stdio: "ignore", windowsHide: true });
        } catch {}
    }
    
    run(`reg delete "HKCU\\Software\\Classes\\${EXT}" /f`);
    run(`reg delete "HKCU\\Software\\Classes\\${APP_NAME}" /f`);
    run(`reg delete "HKCU\\Software\\Classes\\*\\shell\\JSSC" /f`);
    run(`reg delete "HKCU\\Software\\Classes\\Directory\\shell\\JSSC" /f`);
    
    if (fs.existsSync(installDir)) {
        try { fs.rmSync(installDir, { recursive: true, force: true }); } catch {}
    }
    
}

uninstall().catch(console.error);
