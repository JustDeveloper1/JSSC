using System;
using System.Runtime.InteropServices;

public class Taskbar {
    [DllImport("shell32.dll")]
    public static extern int SetCurrentProcessExplicitAppUserModelID(string id);
}
