# Test script untuk Google Apps Script API
# Ganti YOUR_SCRIPT_ID dengan URL endpoint Apps Script Anda

$url = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"

Write-Host "=== Test 1: GetAllUsers (POST) ===" -ForegroundColor Green
$body1 = @{
    action = "getAllUsers"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri $url -Method Post -Body $body1 -ContentType "application/json"
    Write-Host "Response:"
    $response1 | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== Test 2: Login ===" -ForegroundColor Green
$body2 = @{
    action = "login"
    email = "admin@example.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "URL: $url"
Write-Host "Body: $body2"
Write-Host ""

try {
    $response2 = Invoke-RestMethod -Uri $url -Method Post -Body $body2 -ContentType "application/json"
    Write-Host "Response:"
    $response2 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
}

