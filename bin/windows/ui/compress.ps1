param (
    [string]$IconPath,
    [string]$CheckDefault1 = "0",
    [string]$CheckDefault2 = "0",
    [string]$CheckDefault3 = "0",
    [string]$CheckDefault4 = "0",
    [string]$Title = "",
    [string]$FileName = ""
)

$IsChecked1 = ($CheckDefault1 -eq "1")
$IsChecked2 = ($CheckDefault2 -eq "1")
$IsChecked3 = ($CheckDefault3 -eq "1")
$IsChecked4 = ($CheckDefault4 -eq "1")

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Add-Type -AssemblyName System.Windows.Forms, System.Drawing
Add-Type -Path "$PSScriptRoot\blur.cs"

$back = Get-Content -Path "$PSScriptRoot\roundCorners.cs" -Raw
$Win32 = Add-Type -MemberDefinition $back -Name "Win32" -PassThru

[System.Windows.Forms.Application]::EnableVisualStyles()

function Get-SystemIcon {
    param([string]$path)
    if (Test-Path $path -PathType Container) {
        $shell32 = [System.Runtime.InteropServices.RuntimeEnvironment]::GetRuntimeDirectory() + "..\..\system32\shell32.dll"
        return [System.Drawing.Icon]::ExtractAssociatedIcon($shell32)
    } else {
        return [System.Drawing.Icon]::ExtractAssociatedIcon($path)
    }
}

$Form                            = New-Object system.Windows.Forms.Form
$Form.ClientSize                 = New-Object System.Drawing.Point(440,400)
$Form.text                       = $Title
$Form.TopMost                    = $false
$Form.Opacity = 0.95
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
$Form.Add_Shown({
    $policy = New-Object BlurAPI+AccentPolicy
    $policy.AccentState = [BlurAPI+AccentState]::ACCENT_ENABLE_BLURBEHIND
    
    $data = New-Object BlurAPI+WindowCompositionAttributeData
    $data.Attribute = [BlurAPI+WindowCompositionAttribute]::WCA_ACCENT_POLICY
    $data.SizeOfData = [Marshal]::SizeOf($policy)
    
    $policyPtr = [Marshal]::AllocHGlobal($data.SizeOfData)
    [Marshal]::StructureToPtr($policy, $policyPtr, $false)
    $data.Data = $policyPtr
    
    [BlurAPI]::SetWindowCompositionAttribute($Form.Handle, [ref]$data)
    [Marshal]::FreeHGlobal($policyPtr)
})

$PictureBox1 = New-Object system.Windows.Forms.PictureBox
$PictureBox1.Size = New-Object System.Drawing.Size(32,32)
$PictureBox1.Location = New-Object System.Drawing.Point(10,7)
$PictureBox1.SizeMode = "Zoom"
$addImage = $true

try {
    $icon = Get-SystemIcon -path $IconPath
    $PictureBox1.Image = $icon.ToBitmap()
} catch {
    $addImage = $false
}

$CheckBox1 = New-Object system.Windows.Forms.CheckBox
$CheckBox1.Text = "JUSTC"
$CheckBox1.Location = New-Object System.Drawing.Point(15,81)
$CheckBox1.Checked = $IsChecked1
$CheckBox1.AutoSize                 = $true

$CheckBox2 = New-Object system.Windows.Forms.CheckBox
$CheckBox2.Text = "Recursive Compression"
$CheckBox2.Location = New-Object System.Drawing.Point(15,101)
$CheckBox2.Checked = $IsChecked2
$CheckBox2.AutoSize                 = $true

$CheckBox3 = New-Object system.Windows.Forms.CheckBox
$CheckBox3.Text = "Segmentation"
$CheckBox3.Location = New-Object System.Drawing.Point(15,121)
$CheckBox3.Checked = $IsChecked3
$CheckBox3.AutoSize                 = $true

$CheckBox4 = New-Object system.Windows.Forms.CheckBox
$CheckBox4.Text = "Base-64 Integer Encoding"
$CheckBox4.Location = New-Object System.Drawing.Point(15,141)
$CheckBox4.Checked = $IsChecked4
$CheckBox4.AutoSize                 = $true

$Label4                          = New-Object system.Windows.Forms.Label
$Label4.text                     = "Options"
$Label4.AutoSize                 = $true
$Label4.width                    = 25
$Label4.height                   = 10
$Label4.location                 = New-Object System.Drawing.Point(10,54)
$Label4.Font                     = New-Object System.Drawing.Font('Microsoft JhengHei',12)

$Label1                          = New-Object system.Windows.Forms.Label
$Label1.text                     = $FileName
$Label1.AutoSize                 = $true
$Label1.width                    = 25
$Label1.height                   = 10
$Label1.location                 = New-Object System.Drawing.Point(52,13)
$Label1.Font                     = New-Object System.Drawing.Font('Microsoft JhengHei',10)

$Panel1                          = New-Object system.Windows.Forms.Panel
$Panel1.height                   = 392
$Panel1.width                    = 430
$Panel1.location                 = New-Object System.Drawing.Point(5,3)

$Panel1.add_HandleCreated({
    $hRgn = $Win32::CreateRoundRectRgn(0, 0, $this.Width, $this.Height, 10, 10)
    $this.Region = [System.Drawing.Region]::FromHrgn($hRgn)
})

$Button1                         = New-Object system.Windows.Forms.Button
$Button1.text                    = "Compress"
$Button1.width                   = 90
$Button1.height                  = 30
$Button1.Anchor                  = 'right,bottom'
$Button1.location                = New-Object System.Drawing.Point(345,365)
$Button1.Font                    = New-Object System.Drawing.Font('Microsoft JhengHei',10)
$Button1.DialogResult = [Windows.Forms.DialogResult]::OK

$Button1.add_HandleCreated({
    $hRgn = $Win32::CreateRoundRectRgn(0, 0, $this.Width, $this.Height, 5, 5)
    $this.Region = [System.Drawing.Region]::FromHrgn($hRgn)
})

$Form.Controls.AddRange(@($Button1, $CheckBox1, $Label4, $Label1, $Panel1, $CheckBox2, $CheckBox3, $CheckBox4))
if ($addImage) {
    $Form.Controls.Add($PictureBox1)
}

$Form.AcceptButton = $Button1

$Panel1.SendToBack()

$clr = [System.Drawing.Color]::FromArgb(175, 255, 255, 255)
$Panel1.BackColor = $clr
$CheckBox1.BackColor = $clr
$Label4.BackColor = $clr
$Label1.BackColor = $clr
$PictureBox1.BackColor = $clr
$CheckBox2.BackColor = $clr
$CheckBox3.BackColor = $clr
$CheckBox4.BackColor = $clr

$result = $Form.ShowDialog()
if ($result -eq "OK") {
    $output = @{
        checked1 = $CheckBox1.Checked
        checked2 = $CheckBox2.Checked
        checked3 = $CheckBox3.Checked
        checked4 = $CheckBox4.Checked
    }
    Write-Output ($output | ConvertTo-Json -Compress)
}
