Set WshShell = CreateObject("WScript.Shell")

exe = WScript.Arguments(0) ' nodejs (nodePath)

args = ""
For i = 1 To WScript.Arguments.Count - 1
    args = args & " """ & WScript.Arguments(i) & """"
Next

WshShell.Run """" & exe & """" & args, 0, False
