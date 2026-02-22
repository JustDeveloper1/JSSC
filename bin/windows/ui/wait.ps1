param (
    [string]$Name = "",
    [string]$Text = ""
)

[Windows.Forms.Application]::EnableVisualStyles()

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object Windows.Forms.Form
$form.Text = $Name
$form.Size = New-Object Drawing.Size(400, 90)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.ControlBox = $false
$form.TopMost = $true

$label = New-Object Windows.Forms.Label
$label.Text = $Text
$label.Location = New-Object Drawing.Point(20, 20)
$label.AutoSize = $true
$label.Font = New-Object System.Drawing.Font('Microsoft JhengHei',10)
$form.Controls.Add($label)

$form.ShowDialog()
