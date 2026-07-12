const https = require('https');
const http = require('http');
const fs = require('fs');

const domain = process.env.DOMAIN || 'app.127.0.0.1.nip.io';
const pfx = fs.readFileSync(__dirname + '/cert.pfx');
const passphrase = 'ChangeMe123!';

const ROUTES = {
  ['platform.'+domain]: 'http://127.0.0.1:3001',
  ['web.'+domain]: 'http://127.0.0.1:3002',
  ['mobile.'+domain]: 'http://127.0.0.1:3003',
  ['app.'+domain]: 'http://127.0.0.1:3002'
};

function proxyRequest(clientReq, clientRes, target) {
  const parsed = new URL(target + clientReq.url);
  const isHttps = parsed.protocol === 'https:';
  const options = {
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    port: parsed.port || (isHttps ? 443 : 80),
    path: parsed.pathname + parsed.search,
    method: clientReq.method,
    headers: Object.assign({}, clientReq.headers)
  };
  ['host','connection','keep-alive','proxy-connection','transfer-encoding','te','trailers','upgrade'].forEach(h => delete options.headers[h]);
  const proxy = (isHttps ? https : http).request(options, function (res) {
    clientRes.writeHead(res.statusCode, res.headers);
    res.pipe(clientRes);
  });
  proxy.on('error', (e) => {
    console.error('UPSTREAM ERROR', e);
    clientRes.writeHead(502);
    clientRes.end('Upstream error: ' + e.message);
  });
  clientReq.pipe(proxy);
}

const HTTPS_PORT = 8443;
const HTTP_PORT = 8080;

const httpsServer = https.createServer({ pfx, passphrase }, (req, res) => {
  try {
    console.log('REQUEST', req.method, req.url, 'Host:', req.headers.host);
    const host = (req.headers.host || '').split(':')[0];
    const target = ROUTES[host];
    if (!target) {
      console.warn('NO ROUTE for host', host);
      res.writeHead(502);
      res.end('No route for host '+host);
      return;
    }
    proxyRequest(req, res, target);
  } catch (err) {
    console.error('REQUEST HANDLER ERROR', err);
    res.writeHead(500);
    res.end('Internal');
  }
});

httpsServer.on('tlsClientError', (err, socket) => {
  console.error('TLS CLIENT ERROR', err && err.stack ? err.stack : err);
  try { socket.destroy(); } catch(e) {}
});
httpsServer.on('clientError', (err, socket) => {
  console.error('CLIENT ERROR', err && err.stack ? err.stack : err);
  try { socket.destroy(); } catch(e) {}
});
httpsServer.on('connection', (sock) => {
  console.log('NEW TLS CONNECTION from', sock.remoteAddress);
  sock.on('error', (e) => console.error('SOCKET ERROR', e && e.stack ? e.stack : e));
});

httpsServer.listen(HTTPS_PORT, () => console.log('HTTPS proxy listening on '+HTTPS_PORT));

const httpServer = http.createServer((req, res) => {
  console.log('HTTP-> redirect host', req.headers.host, req.url);
  const host = req.headers.host || domain;
  res.writeHead(301, { 'Location': 'https://' + host + ':' + HTTPS_PORT + req.url });
  res.end();
});
httpServer.on('connection', (s) => { console.log('HTTP connection from', s.remoteAddress); s.on('error', (e)=>console.error('HTTP SOCKET ERR', e)); });
httpServer.listen(HTTP_PORT, () => console.log('HTTP redirect listening on '+HTTP_PORT));

console.log('Secure proxy DEBUG running for domain:', domain);
