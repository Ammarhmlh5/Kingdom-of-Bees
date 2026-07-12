Title: infra(traefik): add HTTPS proxy TLS logging, tests and external test docs

Summary:
- Adds a lightweight Node HTTPS proxy with enhanced TLS logging for local testing (`infra/traefik/secure_proxy_debug.js`).
- Adds a non-privileged proxy variant (`infra/traefik/secure_proxy.js`) and test clients (`test_client.js`).
- Adds PowerShell helpers (`pwsh_request.ps1`, `ssl_test.ps1`) to exercise SNI/TLS and HttpWebRequest behaviors on Windows.
- Adds `EXTERNAL_TESTS.md` with copy-paste commands for remote testing.

Files changed / added:
- infra/traefik/secure_proxy_debug.js
- infra/traefik/secure_proxy.js
- infra/traefik/test_client.js
- infra/traefik/pwsh_request.ps1
- infra/traefik/ssl_test.ps1
- infra/traefik/EXTERNAL_TESTS.md

How to test locally:
1. Run the backends (simple static servers on ports 3001/3002/3003).
2. Run the proxy: `node infra/traefik/secure_proxy_debug.js` (listens on 8080 and 8443).
3. From the host, run `pwsh infra/traefik/pwsh_request.ps1 -TargetHost "web.app.127.0.0.1.nip.io" -Url "https://127.0.0.1:8443/"` or `node infra/traefik/test_client.js`.

Notes:
- This is a temporary local testing setup; production deployment should use Traefik or a proper reverse proxy with Let's Encrypt.
