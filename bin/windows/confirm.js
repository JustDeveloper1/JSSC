#!/usr/bin/env node

import { execSync } from 'child_process';
const script = (text, title) =>
    `$wshell = New-Object -ComObject WScript.Shell;` +
    `$wshell.Popup("${text}", 0, "${title}", 4 + 0)`;

export function confirm(title, text) { 
    const result = execSync(`powershell -command "${script(
        text.replaceAll('\n', '`r`n').replaceAll('"', '`"'),
        title
    ).replaceAll('"', '\\"')}"`).toString().trim();
    return result === '6'; // 6 = yes ; 7 = no
}
