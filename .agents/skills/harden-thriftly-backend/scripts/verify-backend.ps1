[CmdletBinding()]
param([switch]$SkipClean)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptRoot "..\..\..\..")).Path
$backendPath = Join-Path $repoRoot "backend"
$mavenWrapper = Join-Path $backendPath "mvnw.cmd"

if (-not (Test-Path -LiteralPath $mavenWrapper)) { throw "Maven wrapper not found: $mavenWrapper" }

Push-Location $backendPath
try {
    if ($SkipClean) { & $mavenWrapper test } else { & $mavenWrapper clean test }
    if ($LASTEXITCODE -ne 0) { throw "Backend test gate failed with exit code $LASTEXITCODE" }
} finally { Pop-Location }

Push-Location $repoRoot
try {
    & git diff --check
    if ($LASTEXITCODE -ne 0) { throw "git diff --check failed with exit code $LASTEXITCODE" }
    $testFiles = @(Get-ChildItem -Path (Join-Path $backendPath "src\test") -Recurse -File -ErrorAction SilentlyContinue)
    if ($testFiles.Count -eq 0) {
        Write-Warning "No backend test source files were discovered. A green Maven build is not sufficient phase evidence."
    } else { Write-Host "Discovered $($testFiles.Count) backend test source file(s)." }
    Write-Host "Backend verification completed. Review git status below:"
    & git status --short
} finally { Pop-Location }
