const https = require('https');
const opts = {
  host: '127.0.0.1',
  port: 8443,
  path: '/',
  method: 'GET',
  headers: { Host: 'web.app.127.0.0.1.nip.io' },
  rejectUnauthorized: false
};
const req = https.request(opts, res => {
  console.log('STATUS', res.statusCode);
  res.setEncoding('utf8');
  res.on('data', d => process.stdout.write(d));
  res.on('end', () => console.log('\nEND'));
});
req.on('error', e => console.error('ERR', e));
req.end();
