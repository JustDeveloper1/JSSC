import { execSync } from 'child_process';

export function message(title, message, icon = 'Error') {
    const psCommand = `powershell -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('${message}', '${title}', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::${icon})"`;
    
    try {
        execSync(psCommand);
    } catch (error) {
        console.error(error);
    }
}
