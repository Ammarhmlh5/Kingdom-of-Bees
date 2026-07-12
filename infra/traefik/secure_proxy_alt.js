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
  const url = new URL(target + clientReq.url);
  const options = {
    method: clientReq.method,
    headers: clientReq.headers,
  };
  const proxy = (url.protocol === 'https:' ? https : http).request(url, options, function (res) {
    clientRes.writeHead(res.statusCode, res.headers);
    res.pipe(clientRes);
  });
  proxy.on('error', (e) => {
    clientRes.writeHead(502);
    clientRes.end('Upstream error: ' + e.message);
  });
  clientReq.pipe(proxy);
}

const HTTPS_PORT = 8443;
const HTTP_PORT = 8080;

const httpsServer = https.createServer({ pfx, passphrase }, (req, res) => {
  const host = (req.headers.host || '').split(':')[0];
  const target = ROUTES[host];
  if (!target) {
    res.writeHead(502);
    res.end('No route for host '+host);
    return;
  }
  proxyRequest(req, res, target);
});
httpsServer.listen(HTTPS_PORT, () => console.log('HTTPS proxy listening on '+HTTPS_PORT));

const httpServer = http.createServer((req, res) => {
  // redirect to https preserving host and port
  const host = req.headers.host || domain;
  res.writeHead(301, { 'Location': 'https://' + host + ':' + HTTPS_PORT + req.url });
  res.end();
});
httpServer.listen(HTTP_PORT, () => console.log('HTTP redirect listening on '+HTTP_PORT));

console.log('Secure proxy running for domain:', domain);
