$chrome = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) {
    $chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
}

$destDir = "c:\Users\Nythor\Desktop\InternProject\documentation\latex_report\figures"
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$screens = @(
    @{ Name = "fig_gateway_login.png"; Url = "http://localhost:5000/"; Width = 1440; Height = 900; Wait = 3000 },
    @{ Name = "fig_dashboard_overview.png"; Url = "http://localhost:5000/?view=dashboard&role=owner"; Width = 1440; Height = 900; Wait = 4000 },
    @{ Name = "fig_pos_terminal.png"; Url = "http://localhost:5000/?view=pos&role=pharmacist"; Width = 1440; Height = 900; Wait = 4000 },
    @{ Name = "fig_fefo_inventory.png"; Url = "http://localhost:5000/?view=inventory&role=owner"; Width = 1440; Height = 900; Wait = 4000 },
    @{ Name = "fig_ml_forecasting.png"; Url = "http://localhost:5000/?view=reports&sub=ml_forecast&role=owner"; Width = 1440; Height = 900; Wait = 4500 },
    @{ Name = "fig_reports_accounting.png"; Url = "http://localhost:5000/?view=reports&sub=analytics&role=owner"; Width = 1440; Height = 900; Wait = 4000 },
    @{ Name = "fig_master_admin_fleet.png"; Url = "http://localhost:5000/?view=master_admin&role=superadmin"; Width = 1440; Height = 900; Wait = 4000 },
    @{ Name = "fig_registration_network.png"; Url = "http://localhost:5000/?view=registration_hub&role=owner"; Width = 1440; Height = 900; Wait = 4000 },
    @{ Name = "fig_mobile_pos.png"; Url = "http://localhost:5000/?mode=mobile_pos"; Width = 1440; Height = 900; Wait = 4000 }
)

Write-Host "Starting automated high-res screenshot capture of Kaziniya DDSS..."
foreach ($item in $screens) {
    $tempFile = Join-Path $env:TEMP $item.Name
    if (Test-Path $tempFile) { Remove-Item $tempFile -Force }
    $finalPath = Join-Path $destDir $item.Name

    Write-Host "Capturing $($item.Name) from $($item.Url)..."
    $argList = @(
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=$($item.Width),$($item.Height)",
        "--virtual-time-budget=$($item.Wait)",
        "--screenshot=$tempFile",
        $item.Url
    )

    $process = Start-Process -FilePath $chrome -ArgumentList $argList -Wait -PassThru -NoNewWindow
    Start-Sleep -Milliseconds 500

    if (Test-Path $tempFile) {
        Copy-Item -Path $tempFile -Destination $finalPath -Force
        $len = (Get-Item $finalPath).Length
        Write-Host " -> Successfully captured $($item.Name) ($len bytes)" -ForegroundColor Green
    } else {
        Write-Host " -> FAILED to capture $($item.Name)" -ForegroundColor Red
    }
}

Write-Host "`nAll screenshots processed. Check directory: $destDir"
Get-ChildItem -Path $destDir -Filter "fig_*.png" | Select-Object Name, Length
