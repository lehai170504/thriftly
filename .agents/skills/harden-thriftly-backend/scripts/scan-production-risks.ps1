[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptRoot "..\..\..\..")).Path
$targets = @((Join-Path $repoRoot "backend"), (Join-Path $repoRoot "frontend"))

$checks = @(
    @{ Name = "Hibernate schema mutation"; Pattern = 'ddl-auto\s*:\s*(update|create|create-drop)' },
    @{ Name = "Fallback secret/credential"; Pattern = '\$\{[^}:]*(SECRET|PASSWORD|API[_-]?KEY)[^}:]*:[^}]+\}' },
    @{ Name = "Broad CSRF exclusion"; Pattern = 'ignoringRequestMatchers' },
    @{ Name = "Credentialed CORS review"; Pattern = 'setAllowedOriginPatterns|setAllowedOrigins|setAllowCredentials' },
    @{ Name = "Direct deposit surface"; Pattern = 'PostMapping\("/deposit"\)|\.deposit\(' },
    @{ Name = "Direct balance mutation"; Pattern = 'setBalance\(|setHeldBalance\(' },
    @{ Name = "Startup runner"; Pattern = 'implements\s+CommandLineRunner' },
    @{ Name = "Browser token persistence"; Pattern = 'localStorage.*token|sessionStorage.*token|document\.cookie.*token' }
)

if (-not (Get-Command rg -ErrorAction SilentlyContinue)) { throw "ripgrep (rg) is required." }
Write-Host "Read-only production risk scan: $repoRoot"
foreach ($check in $checks) {
    Write-Host "`n[$($check.Name)]"
    & rg -n --hidden --glob "!.git/**" --glob "!**/target/**" --glob "!**/node_modules/**" --glob "!**/.next/**" --pcre2 $check.Pattern $targets
    if ($LASTEXITCODE -eq 1) { Write-Host "No matches." }
    elseif ($LASTEXITCODE -gt 1) { throw "rg failed for '$($check.Name)' with exit code $LASTEXITCODE" }
}
Write-Host "`nScan complete. Matches are review leads, not automatic vulnerabilities."
