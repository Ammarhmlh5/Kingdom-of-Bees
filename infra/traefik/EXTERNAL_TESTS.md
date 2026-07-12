# External Test Commands

Use these commands from a remote machine (not the server) to test the running proxy.
Replace `<PUBLIC_IP>` with your server public IP.

## HTTP redirect (port 8080)

Bash (curl):

```bash
curl -v -H "Host: web.<PUBLIC_IP>.nip.io" http://<PUBLIC_IP>:8080/
```

Expected: 301 redirect to https://web.<PUBLIC_IP>.nip.io:8443/ (or a 200 if client follows redirects).

## HTTPS direct (port 8443)

Bash (curl) - ignore cert validation for self-signed cert:

```bash
curl -vk -H "Host: web.<PUBLIC_IP>.nip.io" https://<PUBLIC_IP>:8443/
```

PowerShell (Core) using `HttpClient` helper script (recommended):

```powershell
# copy infra/traefik/pwsh_request.ps1 to the remote machine or run remotely
pwsh -File pwsh_request.ps1 -TargetHost "web.<PUBLIC_IP>.nip.io" -Url "https://<PUBLIC_IP>:8443/"
```

PowerShell (Windows) using `Invoke-WebRequest` with certificate validation disabled:

```powershell
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
Invoke-WebRequest -Uri "https://<PUBLIC_IP>:8443/" -Headers @{ Host = "web.<PUBLIC_IP>.nip.io" } -UseBasicParsing
```

Node one-liner (ignore cert verification):

```bash
node -e "const https=require('https'); const opts={host:'<PUBLIC_IP>',port:8443,path:'/',method:'GET',headers:{Host:'web.<PUBLIC_IP>.nip.io'},rejectUnauthorized:false}; const req=https.request(opts,res=>{console.log('STATUS',res.statusCode);res.on('data',d=>process.stdout.write(d))}); req.on('error',e=>console.error(e)); req.end();"
```

## Expected response

Successful test returns HTTP `200` and the HTML from the `web` backend:

```
<html><body><h1>web service</h1><p>Port: 3002</p></body></html>
```

## Troubleshooting

- Ensure ports `8080` and `8443` are reachable from the remote machine (open firewall/ACLs).
- If using the self-signed cert, use `-k`/`--insecure` on `curl` or disable certificate validation in PowerShell/Node as shown.
- If tests still fail, provide me the exact command output and I'll analyze the proxy logs at `C:\temp\secure_proxy_tls.log` and `C:\temp\secure_proxy_tls_err.log`.

