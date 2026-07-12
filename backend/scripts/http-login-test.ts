import http from 'http';

const postData = JSON.stringify({
    email: 'owner@kingdom.com',
    password: '123456'
});

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📦 Response: ${data}`);
        
        try {
            const parsed = JSON.parse(data);
            if (parsed.accessToken) {
                console.log(`\n✅ Login successful!`);
                console.log(`🔑 Token: ${parsed.accessToken.substring(0, 50)}...`);
                console.log(`👤 User: ${parsed.user?.fullName} (${parsed.user?.role})`);
            } else {
                console.log(`\n❌ Login failed: ${parsed.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.log(`\n⚠️ Failed to parse response`);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Error: ${e.message}`);
});

req.write(postData);
req.end();