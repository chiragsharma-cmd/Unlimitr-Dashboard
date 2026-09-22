# Zero-dependency local web server for Windows/PowerShell
# Serves the Unlimitr Dashboard on http://localhost:8000

$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "     UNLIMITR ANALYTICS LOCAL DEV SERVER" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "  -> Running at: http://localhost:$port/" -ForegroundColor Yellow
    Write-Host "  -> Press [Ctrl + C] in this window to stop server" -ForegroundColor DarkGray
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $urlPath = $request.Url.LocalPath
            if ($urlPath -eq "/") { $urlPath = "/index.html" }
            
            # URL decoding to support spaces in file paths
            $decodedPath = [uri]::UnescapeDataString($urlPath).TrimStart('/')
            $localPath = Join-Path $PSScriptRoot $decodedPath
            
            if (Test-Path $localPath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($localPath)
                $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
                
                $contentType = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".svg"  { "image/svg+xml" }
                    ".ico"  { "image/x-icon" }
                    default { "application/octet-stream" }
                }
                
                $response.ContentType = $contentType
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
                $response.Headers.Add("Pragma", "no-cache")
                $response.Headers.Add("Expires", "0")
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                # SPA Route Fallback: If URL has no extension, serve index.html
                $ext = [System.IO.Path]::GetExtension($localPath)
                $indexPath = Join-Path $PSScriptRoot "index.html"
                if ($ext -eq "" -and (Test-Path $indexPath -PathType Leaf)) {
                    $bytes = [System.IO.File]::ReadAllBytes($indexPath)
                    $response.ContentType = "text/html; charset=utf-8"
                    $response.ContentLength64 = $bytes.Length
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                } else {
                    $response.StatusCode = 404
                    $msg = [System.Text.Encoding]::UTF8.GetBytes("File not found: $urlPath")
                    $response.ContentType = "text/plain; charset=utf-8"
                    $response.ContentLength64 = $msg.Length
                    $response.OutputStream.Write($msg, 0, $msg.Length)
                }
            }
            $response.Close()
        } catch {
            # Catching client disconnects or aborted requests gracefully
            if ($null -ne $response) {
                try { $response.Close() } catch {}
            }
        }
    }
} catch {
    Write-Host "Failed to start server: $_" -ForegroundColor Red
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
}
