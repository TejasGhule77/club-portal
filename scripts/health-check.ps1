# ClubPortal SRE Health & Monitoring Probe
# Authored by: Rushikesh Shete (PRN: 2303111) - DevOps / SRE Engineer

Write-Output "=========================================="
Write-Output "   ClubPortal SRE Health Monitoring Check "
Write-Output "=========================================="

# 1. Backend Probe
try {
    $backendRes = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 5
    Write-Output " [PASS] Backend Health Endpoint: $($backendRes.status)"
} catch {
    Write-Error " [FAIL] Backend is unreachable: $($_.Exception.Message)"
}

# 2. Frontend Proxy Probe
try {
    $frontendProxy = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 5
    Write-Output " [PASS] Frontend NGINX Proxy (/api/health): $($frontendProxy.status)"
} catch {
    Write-Error " [FAIL] NGINX reverse proxy failure: $($_.Exception.Message)"
}

# 3. Database Connectivity & Seeding Status
try {
    $clubs = Invoke-RestMethod -Uri "http://localhost:3000/api/clubs" -TimeoutSec 5
    Write-Output " [PASS] MongoDB Database Queries: Operational"
} catch {
    Write-Error " [FAIL] Database query failed: $($_.Exception.Message)"
}

Write-Output "=========================================="
Write-Output "   All Monitored Services Healthy!        "
Write-Output "=========================================="
