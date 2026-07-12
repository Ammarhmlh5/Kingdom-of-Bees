const http = require('http');
const data = JSON.stringify({
  deviceId: 'sim-device-1',
  batchId: 'batch-'+Date.now(),
  events: [
    { clientId: 'c-'+Date.now(), entity: 'Hive', operation: 'create', payload: { id: 'h-'+Date.now(), name: 'SimHive' }, clientCreatedAt: new Date().toISOString() }
  ]
});
const options = { hostname: '127.0.0.1', port: 3000, path: '/sync/push', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } };
const req = http.request(options, res => { let body = ''; res.on('data', chunk => body += chunk); res.on('end', () => console.log('RESP', res.statusCode, body)); });
req.on('error', err => console.error('ERR', err));
req.write(data); req.end();
