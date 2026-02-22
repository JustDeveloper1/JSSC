using System;
using System.Runtime.InteropServices;

public class BlurAPI {
    [StructLayout(LayoutKind.Sequential)]
    public struct WindowCompositionAttributeData {
        public WindowCompositionAttribute Attribute;
        public IntPtr Data;
        public int SizeOfData;
    }
    public enum WindowCompositionAttribute { WCA_ACCENT_POLICY = 19 }
    public enum AccentState { ACCENT_ENABLE_BLURBEHIND = 10 }
    [StructLayout(LayoutKind.Sequential)]
    public struct AccentPolicy {
        public AccentState AccentState;
        public int AccentFlags;
        public int GradientColor;
        public int AnimationId;
    }
    [DllImport("user32.dll")]
    public static extern int SetWindowCompositionAttribute(IntPtr hwnd, ref WindowCompositionAttributeData data);
}
