# ============================================================================
# install.ps1 — Windows PowerShell installer for BeyondAgtest
# ============================================================================
# Checks for Node.js, installs BeyondAgtest via npm, and runs a health check.
#
# Usage:
#   irm https://get.beyondagtest.dev/install.ps1 | iex
#   or
#   .\install.ps1
# ============================================================================
#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# --- Configuration ---
$PackageName = "@beyondkitter/beyondagtest"
$MinNodeMajor = 18
$RepoUrl = "https://github.com/beyondkitter/beyondagtest"

# --- Helpers ---
function Write-Info    { param([string]$Msg) Write-Host "[INFO]  $Msg" -ForegroundColor Blue }
function Write-Ok      { param([string]$Msg) Write-Host "[OK]    $Msg" -ForegroundColor Green }
function Write-Warn    { param([string]$Msg) Write-Host "[WARN]  $Msg" -ForegroundColor Yellow }
function Write-Err     { param([string]$Msg) Write-Host "[ERROR] $Msg" -ForegroundColor Red }

function Test-CommandExists {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# --- Detect if running as Administrator ---
function Test-Admin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# --- Check / Install Node.js ---
function Ensure-NodeJs {
    # Check if node is available and meets version requirement
    if (Test-CommandExists "node") {
        $nodeVersion = (node -v).TrimStart("v")
        $nodeMajor = [int]($nodeVersion.Split(".")[0])
        if ($nodeMajor -ge $MinNodeMajor) {
            Write-Ok "Node.js v$nodeVersion found"
            return
        }
        Write-Warn "Node.js v$nodeVersion found but >=$MinNodeMajor required"
    }

    Write-Info "Node.js not found or version too low."

    # Check if winget is available (Windows Package Manager)
    if (Test-CommandExists "winget") {
        Write-Info "Installing Node.js via winget..."
        winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        Write-Ok "Node.js installed via winget"
        return
    }

    # Check if Chocolatey is available
    if (Test-CommandExists "choco") {
        Write-Info "Installing Node.js via Chocolatey..."
        choco install nodejs-lts -y
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        Write-Ok "Node.js installed via Chocolatey"
        return
    }

    # Fallback: prompt user to download
    Write-Warn "Neither winget nor Chocolatey found."
    Write-Host ""
    Write-Host "  Please install Node.js $MinNodeMajor+ manually:" -ForegroundColor Yellow
    Write-Host "  https://nodejs.org/en/download/" -ForegroundColor Cyan
    Write-Host ""
    $download = Read-Host "Open download page now? (Y/n)"
    if ($download -ne "n" -and $download -ne "N") {
        Start-Process "https://nodejs.org/en/download/"
    }

    Write-Host ""
    Write-Host "  Press Enter after installing Node.js to continue..." -ForegroundColor Gray
    Read-Host

    # Verify after manual install
    if (-not (Test-CommandExists "node")) {
        Write-Err "Node.js still not found. Please add it to your PATH and re-run this script."
        exit 1
    }
    Write-Ok "Node.js detected: $(node -v)"
}

# --- Install BeyondAgtest ---
function Install-BeyondAgtest {
    Write-Info "Installing BeyondAgtest..."

    # Check if npm is available
    if (-not (Test-CommandExists "npm")) {
        Write-Err "npm not found. Please ensure Node.js is installed correctly."
        exit 1
    }

    try {
        npm install -g $PackageName 2>&1
        Write-Ok "BeyondAgtest installed via npm"
    }
    catch {
        Write-Warn "npm global install failed. Trying with elevated permissions..."
        if (Test-Admin) {
            npm install -g $PackageName 2>&1
        }
        else {
            Write-Err "Please run this script as Administrator, or install manually:"
            Write-Host "  npm install -g $PackageName" -ForegroundColor Cyan
            exit 1
        }
    }

    # Verify
    if (-not (Test-CommandExists "beyondagtest")) {
        # Check common npm global paths
        $npmRoot = (npm root -g 2>$null).Trim()
        if ($npmRoot) {
            $cliPath = Join-Path $npmRoot "..\beyondagtest.cmd"
            if (Test-Path $cliPath) {
                Write-Ok "BeyondAgtest installed at $cliPath"
                return
            }
        }
        Write-Err "beyondagtest command not found after install. Check your PATH."
        exit 1
    }
    Write-Ok "BeyondAgtest command available"
}

# --- Run health check ---
function Invoke-Doctor {
    Write-Info "Running BeyondAgtest doctor..."
    try {
        beyondagtest doctor
        Write-Ok "Doctor checks passed"
    }
    catch {
        Write-Warn "Some doctor checks failed. Run 'beyondagtest doctor' for details."
    }
}

# --- Print success ---
function Show-Success {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "  BeyondAgtest installed successfully!" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Quick start:" -ForegroundColor White
    Write-Host "    beyondagtest --help          Show available commands" -ForegroundColor Gray
    Write-Host "    beyondagtest init            Initialize a new project" -ForegroundColor Gray
    Write-Host "    beyondagtest doctor          Verify your environment" -ForegroundColor Gray
    Write-Host "    beyondagtest dashboard       Launch the web dashboard" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Docs:   https://docs.beyondagtest.dev" -ForegroundColor Cyan
    Write-Host "  Repo:   $RepoUrl" -ForegroundColor Cyan
    Write-Host "  Issues: $RepoUrl/issues" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Green
}

# --- Main ---
function Main {
    Write-Host ""
    Write-Host "  BeyondAgtest Installer (Windows)" -ForegroundColor White
    Write-Host "  =================================" -ForegroundColor White
    Write-Host ""

    Ensure-NodeJs
    Install-BeyondAgtest
    Invoke-Doctor
    Show-Success
}

Main
