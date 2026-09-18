# Generates public/og.png (1200x630), public/apple-touch-icon.png (180x180) and public/favicon.ico
# from the owner info in src/site.config.ts. Windows only (System.Drawing); run once, commit the output.
#
#   powershell -ExecutionPolicy Bypass -File scripts/make-og.ps1

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$config = Get-Content (Join-Path $root 'src/site.config.ts') -Raw -Encoding UTF8
$name = [regex]::Match($config, "name:\s*'([^']+)'").Groups[1].Value
$role = [regex]::Match($config, "role:\s*'([^']+)'").Groups[1].Value
$initial = $name.Substring(0, 1).ToUpper()

$bg = [System.Drawing.Color]::FromArgb(10, 10, 10)
$white = [System.Drawing.Color]::FromArgb(245, 245, 245)
$muted = [System.Drawing.Color]::FromArgb(163, 163, 163)
$red = [System.Drawing.Color]::FromArgb(241, 61, 77)
$font = 'Segoe UI'

function New-Font($size, $bold = $false) {
  $style = if ($bold) { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
  return New-Object System.Drawing.Font($font, [single]$size, $style)
}

function New-Canvas($w, $h) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  $g.Clear($bg)
  return $bmp, $g
}

# --- OG image ---
$bmp, $g = New-Canvas 1200 630
$g.FillRectangle((New-Object System.Drawing.SolidBrush $red), 80, 236, 8, 72)
$g.DrawString($name, (New-Font 56 $true), (New-Object System.Drawing.SolidBrush $white), 104, 226)
$roleFont = New-Font 26
$roleRect = New-Object System.Drawing.RectangleF([single]112, [single]326, [single]1000, [single]200)
$g.DrawString($role, $roleFont, (New-Object System.Drawing.SolidBrush $muted), $roleRect)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $red), 0, 622, 1200, 8)
$bmp.Save((Join-Path $root 'public/og.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# --- Apple touch icon + favicon.ico (monogram) ---
function New-Monogram($size) {
  $bmp, $g = New-Canvas $size $size
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
  $g.DrawString($initial, (New-Font ($size * 0.5) $true), (New-Object System.Drawing.SolidBrush $white), (New-Object System.Drawing.RectangleF([single]0, [single](-$size * 0.05), [single]$size, [single]$size)), $fmt)
  $g.FillRectangle((New-Object System.Drawing.SolidBrush $red), ($size * 0.2), ($size * 0.78), ($size * 0.6), ($size * 0.08))
  $g.Dispose()
  return $bmp
}

$touch = New-Monogram 180
$touch.Save((Join-Path $root 'public/apple-touch-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$touch.Dispose()

$ico = New-Monogram 32
$icon = [System.Drawing.Icon]::FromHandle($ico.GetHicon())
$fs = [System.IO.File]::Create((Join-Path $root 'public/favicon.ico'))
$icon.Save($fs); $fs.Close()
$icon.Dispose(); $ico.Dispose()

Write-Host "Wrote public/og.png, public/apple-touch-icon.png, public/favicon.ico for '$name'"
