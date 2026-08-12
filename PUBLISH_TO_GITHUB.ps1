# 在 PowerShell 中运行：Set-ExecutionPolicy -Scope Process Bypass; .\PUBLISH_TO_GITHUB.ps1
$ErrorActionPreference = "Stop"
$repo = "StanR2007/pawpal-ai4se-final"

if (-not (Test-Path ".git")) {
  git init -b main
  git add .
  git commit -m "feat: add PawPal pet care demo"
}

gh repo create $repo --public --source . --remote origin --push

Write-Host "Published: https://github.com/$repo"
