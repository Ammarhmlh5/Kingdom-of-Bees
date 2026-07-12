param(
  [string]$HostHeader = 'web.app.127.0.0.1.nip.io',
  [string]$ConnectIp = '127.0.0.1',
  [int]$Port = 8443,
  [string]$Path = '/'
)

Write-Host ("Connecting to {0}:{1} with SNI Host={2}" -f $ConnectIp,$Port,$HostHeader)
$tcp = New-Object System.Net.Sockets.TcpClient
$tcp.Connect($ConnectIp,$Port)
$stream = $tcp.GetStream()
$ssl = New-Object System.Net.Security.SslStream($stream,$false,({$true}))
try {
  $ssl.AuthenticateAsClient($HostHeader)
  Write-Host ("Handshake OK: Authenticated={0} Protocol={1} Cipher={2}" -f $ssl.IsAuthenticated, $ssl.SslProtocol, $ssl.CipherAlgorithm)
  $req = "GET $Path HTTP/1.1`r`nHost: $HostHeader`r`nConnection: close`r`n`r`n"
  $bytes = [System.Text.Encoding]::ASCII.GetBytes($req)
  $ssl.Write($bytes,0,$bytes.Length)
  $ssl.Flush()
  Start-Sleep -Milliseconds 200
  $read = New-Object System.IO.MemoryStream
  $buf = New-Object byte[] 8192
  while (($len = $ssl.Read($buf,0,$buf.Length)) -gt 0) { $read.Write($buf,0,$len) }
  $resp = [System.Text.Encoding]::ASCII.GetString($read.ToArray())
  Write-Host "--- RESPONSE START ---"
  Write-Host $resp
  Write-Host "--- RESPONSE END ---"
} catch {
  Write-Host "ERROR: $_"
} finally {
  try { $ssl.Close() } catch {}
  try { $tcp.Close() } catch {}
}
