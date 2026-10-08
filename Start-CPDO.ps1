$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$mysqld = "C:\Users\USER\cpdo-mariadb\mariadb-11.4.8-winx64\bin\mysqld.exe"
$ini = "C:\Users\USER\cpdo-mariadb\data\my.ini"
$mysqlUp = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue

if (-not $mysqlUp -and (Test-Path $mysqld)) {
  Write-Host "Starting MySQL for the LAN database..."
  Start-Process -FilePath $mysqld -ArgumentList "--defaults-file=`"$ini`"" -WindowStyle Hidden
  Start-Sleep -Seconds 3
}

Write-Host "Starting CPDO API on port 8000..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; php artisan serve --host=0.0.0.0 --port=8000"

Write-Host "Starting CPDO web app on port 5173..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev -- --host 0.0.0.0 --port 5173"

Start-Sleep -Seconds 2
$ip = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown' } |
  Select-Object -First 1 -ExpandProperty IPAddress

Write-Host ""
Write-Host "This computer:  http://localhost:5173"
if ($ip) { Write-Host "Other LAN PCs:  http://${ip}:5173" }
Write-Host "Sign in with username admin and password admin123"
