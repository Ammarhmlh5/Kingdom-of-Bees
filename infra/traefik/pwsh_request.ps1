param(
  [string]$TargetHost = 'web.app.127.0.0.1.nip.io',
  [string]$Url = 'https://127.0.0.1:8443/'
)
[System.Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
[System.Net.ServicePointManager]::Expect100Continue = $false
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
try {
  $req = [System.Net.HttpWebRequest]::Create($Url)
  $req.Method = 'GET'
  $req.Host = $TargetHost
  $req.AllowAutoRedirect = $false
  $resp = $req.GetResponse()
  $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
  $body = $sr.ReadToEnd()
  Write-Host 'STATUS' $resp.StatusCode
  Write-Output $body
  $resp.Close()
} catch {
  Write-Host 'ERROR:' $_
}
