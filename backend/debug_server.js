
const http = require('http');

function postRequest(path, body) {
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token' // Mock token to pass first check if possible, or trigger 401
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    // Write data to request body
    req.write(JSON.stringify(body));
    req.end();
}

console.log("Sending request to /api/apiaries/test-apiary/hives/test-hive/split...");
postRequest('/api/apiaries/test-apiary/hives/test-hive/split', {
    newHiveNumber: "H-TEST",
    strategy: "EVEN"
});
