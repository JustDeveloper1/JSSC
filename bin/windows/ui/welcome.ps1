param (
    [string]$Title = "JSSC",
    [string]$Line1 = "",
    [string]$Line2 = "",
    [string]$Line3 = "",
    [string]$Line4 = "",
    [string]$Line5 = "",
    [string]$Repo  = "",
    [string]$Site  = ""
)

Add-Type -AssemblyName System.Windows.Forms, System.Drawing

$back = Get-Content -Path "$PSScriptRoot\roundCorners.cs" -Raw
$Win32 = Add-Type -MemberDefinition $back -Name "Win32" -PassThru

[System.Windows.Forms.Application]::EnableVisualStyles()

$Form                            = New-Object system.Windows.Forms.Form
$Form.ClientSize                 = New-Object System.Drawing.Point(398,138)
$Form.text                       = $Title
$Form.TopMost                    = $false
$Form.StartPosition = "CenterScreen"
$Form.FormBorderStyle = "FixedDialog"
$Form.MaximizeBox = $false
$Form.MinimizeBox = $false

$Form.Add_Paint({
    param($sender, $e)
    $rect = $sender.ClientRectangle
    $c1 = [System.Drawing.Color]::FromArgb(150, 239, 213, 255)
    $c2 = [System.Drawing.Color]::FromArgb(150, 81, 90, 218)
    
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 135)
    $e.Graphics.FillRectangle($brush, $rect)
    $brush.Dispose()
})

$Button1                         = New-Object system.Windows.Forms.Button
$Button1.text                    = "Later"
$Button1.width                   = 60
$Button1.height                  = 30
$Button1.Anchor                  = 'right,bottom'
$Button1.location                = New-Object System.Drawing.Point(335,105)
$Button1.Font                    = New-Object System.Drawing.Font('Microsoft JhengHei',10)
$Button1.DialogResult = [Windows.Forms.DialogResult]::No

$Label1                          = New-Object system.Windows.Forms.LinkLabel
$Label1.text                     = "Website"
$Label1.AutoSize                 = $true
$Label1.width                    = 10
$Label1.height                   = 10
$Label1.location                 = New-Object System.Drawing.Point(10,116)
$Label1.Font                     = New-Object System.Drawing.Font('Microsoft JhengHei',10)
$Label1.BackColor = "Transparent"

$Button2                         = New-Object system.Windows.Forms.Button
$Button2.text                    = "Reboot"
$Button2.width                   = 80
$Button2.height                  = 30
$Button2.Anchor                  = 'right,bottom'
$Button2.location                = New-Object System.Drawing.Point(253,105)
$Button2.Font                    = New-Object System.Drawing.Font('Microsoft JhengHei',10)
$Button2.DialogResult = [Windows.Forms.DialogResult]::Yes

$Label2                          = New-Object system.Windows.Forms.LinkLabel
$Label2.text                     = "Repository"
$Label2.AutoSize                 = $true
$Label2.width                    = 10
$Label2.height                   = 10
$Label2.location                 = New-Object System.Drawing.Point(80,116)
$Label2.Font                     = New-Object System.Drawing.Font('Microsoft JhengHei',10)
$Label2.BackColor = "Transparent"

$Label4                          = New-Object system.Windows.Forms.Label
$Label4.text                     = $Line1 + [Environment]::NewLine + $Line2 + [Environment]::NewLine + [Environment]::NewLine +
                                   $Line3 + [Environment]::NewLine + $Line4 + [Environment]::NewLine + $Line5
$Label4.AutoSize                 = $true
$Label4.width                    = 25
$Label4.height                   = 10
$Label4.location                 = New-Object System.Drawing.Point(5,5)
$Label4.Font                     = New-Object System.Drawing.Font('Microsoft JhengHei',10, [System.Drawing.FontStyle]::Bold)
$Label4.BackColor = [System.Drawing.Color]::FromArgb(175, 255, 255, 255)
$Label4.ForeColor = "Black"
$Label4.add_HandleCreated({
    $hRgn = $Win32::CreateRoundRectRgn(0, 0, $this.Width, $this.Height, 10, 10)
    $this.Region = [System.Drawing.Region]::FromHrgn($hRgn)
})

$Label2.LinkColor = "White"
$Label2.ActiveLinkColor = "White"
$Label2.VisitedLinkColor = "Violet"
$Label1.LinkColor = "White"
$Label1.ActiveLinkColor = "White"
$Label1.VisitedLinkColor = "Violet"

$Label5                          = New-Object system.Windows.Forms.Label
$Label5.text                     = "   "
$Label5.AutoSize                 = $true
$Label5.width                    = 25
$Label5.height                   = 10
$Label5.location                 = New-Object System.Drawing.Point(330,105)
$Label5.Font                     = New-Object System.Drawing.Font('Microsoft JhengHei',10, [System.Drawing.FontStyle]::Bold)
$Label5.BackColor = "Transparent"
$Label5.ForeColor = "Black"

$Form.controls.AddRange(@($Button1,$Label1,$Button2,$Label2,$Label5,$Label4))

$Label2.Add_Click({
    Start-Process "$Repo"
})
$Label1.Add_Click({
    Start-Process "$Site"
})

$Button1.add_HandleCreated({
    $hRgn = $Win32::CreateRoundRectRgn(0, 0, $this.Width, $this.Height, 5, 5)
    $this.Region = [System.Drawing.Region]::FromHrgn($hRgn)
})
$Button2.add_HandleCreated({
    $hRgn = $Win32::CreateRoundRectRgn(0, 0, $this.Width, $this.Height, 5, 5)
    $this.Region = [System.Drawing.Region]::FromHrgn($hRgn)
})

$Form.AcceptButton = $Button2
$Form.CancelButton = $Button1

$result = $Form.ShowDialog()
Write-Host ($result -eq "Yes")
