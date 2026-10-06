# ========================================================
# Kaziniya Drug Store - Docker Database Setup Script
# ========================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Kaziniya Drug Store - Database & Docker Setup       " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Check if Docker CLI is installed
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue

if (-not $dockerCmd) {
    Write-Host "`n[!] Docker is not detected in your PATH." -ForegroundColor Yellow
    
    # Check for downloaded installer in Downloads
    $installer = Get-ChildItem -Path "$HOME\Downloads" -Filter "*Docker*Desktop*Installer*.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

    if ($installer) {
        Write-Host "[+] Found downloaded installer at: $($installer.FullName)" -ForegroundColor Green
        Write-Host "[*] Launching Docker Desktop Installer (Administrator prompt may appear)..." -ForegroundColor Cyan
        Start-Process $installer.FullName
        Write-Host "`n[i] Please complete the Docker Desktop installation wizard." -ForegroundColor Yellow
        Write-Host "[i] After installation completes and Docker is started, rerun this script." -ForegroundColor Yellow
        exit 0
    } else {
        Write-Host "[*] Downloading Docker Desktop Installer..." -ForegroundColor Cyan
        $downloadUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
        $destPath = "$HOME\Downloads\DockerDesktopInstaller.exe"
        try {
            Invoke-WebRequest -Uri $downloadUrl -OutFile $destPath -UseBasicParsing
            Write-Host "[+] Downloaded installer to $destPath" -ForegroundColor Green
            Write-Host "[*] Launching installer..." -ForegroundColor Cyan
            Start-Process $destPath
        } catch {
            Write-Host "[-] Could not download automatically: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "    Please download Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
        }
        exit 0
    }
}

# 2. Check if Docker Daemon is running
Write-Host "`n[*] Checking if Docker engine is running..." -ForegroundColor Cyan
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[-] Docker Desktop is installed but the Docker daemon is NOT running." -ForegroundColor Yellow
    Write-Host "[*] Attempting to start Docker Desktop..." -ForegroundColor Cyan
    
    $dockerDesktopExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerDesktopExe) {
        Start-Process $dockerDesktopExe
        Write-Host "[+] Docker Desktop launch initiated. Please wait ~30 seconds for it to start." -ForegroundColor Green
    } else {
        Write-Host "[-] Please open Docker Desktop from your Start Menu and wait for the engine to start." -ForegroundColor Yellow
    }
    exit 1
}

# 3. Start Database Containers
Write-Host "`n[+] Docker engine is running!" -ForegroundColor Green
Write-Host "[*] Starting PostgreSQL and Adminer containers..." -ForegroundColor Cyan

docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "  Database Containers Successfully Started!             " -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  * PostgreSQL Port:  5432" -ForegroundColor White
    Write-Host "  * Database Name:    kaziniya_db" -ForegroundColor White
    Write-Host "  * Username:         postgres" -ForegroundColor White
    Write-Host "  * Password:         postgres" -ForegroundColor White
    Write-Host "  * Connection URL:   postgresql://postgres:postgres@localhost:5432/kaziniya_db" -ForegroundColor White
    Write-Host ""
    Write-Host "  * Web Admin (Adminer): http://localhost:8080" -ForegroundColor Cyan
    Write-Host "    (System: PostgreSQL | Server: db | Username: postgres | DB: kaziniya_db)" -ForegroundColor Gray
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Host "`n[-] Failed to start containers. Check error logs with 'docker compose logs'." -ForegroundColor Red
}
