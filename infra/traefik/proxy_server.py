import http.server
import socketserver
import urllib.request
import urllib.parse
import sys

PORT = 8080

# mapping host (without port) to backend URL
DOMAIN_BASE = '127.0.0.1.nip.io'
ROUTES = {
    f'platform.{DOMAIN_BASE}': 'http://127.0.0.1:3001',
    f'web.{DOMAIN_BASE}': 'http://127.0.0.1:3002',
    f'mobile.{DOMAIN_BASE}': 'http://127.0.0.1:3003',
    f'app.{DOMAIN_BASE}': 'http://127.0.0.1:3002'
}

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def _proxy(self, method='GET'):
        host = self.headers.get('Host','')
        host = host.split(':')[0]
        target_base = ROUTES.get(host)
        if not target_base:
            self.send_response(502)
            self.end_headers()
            self.wfile.write(b'No route for host')
            return
        target = target_base + self.path
        data = None
        if method in ('POST','PUT','PATCH'):
            length = int(self.headers.get('Content-Length',0))
            data = self.rfile.read(length) if length else None
        req = urllib.request.Request(target, data=data, headers=dict(self.headers), method=method)
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                self.send_response(resp.getcode())
                for k, v in resp.getheaders():
                    if k.lower() == 'transfer-encoding':
                        continue
                    self.send_header(k, v)
                self.end_headers()
                self.wfile.write(resp.read())
        except Exception as e:
            self.send_response(502)
            self.end_headers()
            self.wfile.write(str(e).encode())

    def do_GET(self):
        self._proxy('GET')
    def do_POST(self):
        self._proxy('POST')
    def do_PUT(self):
        self._proxy('PUT')
    def do_DELETE(self):
        self._proxy('DELETE')

if __name__ == '__main__':
    with socketserver.ThreadingTCPServer(('', PORT), ProxyHandler) as httpd:
        print(f'Proxy running on port {PORT}')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
