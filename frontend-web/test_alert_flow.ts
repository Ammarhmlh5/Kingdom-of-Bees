// Native fetch used
const API_URL = 'http://localhost:3001/api';

async function run() {
    console.log("Starting verification...");

    // 1. Create Apiary with Location (Riyadh)
    const apiaryData = {
        name: "Test Apiary For Alerts",
        type: "STATIONARY",
        locationLat: 24.7136,
        locationLng: 46.6753,
    };

    console.log("Creating Apiary...");
    const apiaryRes = await fetch(`${API_URL}/apiaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiaryData)
    });
    const apiary = await apiaryRes.json();
    console.log("Apiary Created:", apiary.id);

    // 2. Create Alert for this Apiary
    console.log("Creating Alert...");
    const alertData = {
        title: "Test Outbreak",
        message: "AFB Detected",
        alertType: "DISEASE",
        priority: "HIGH",
        apiaryId: apiary.id
    };
    const alertRes = await fetch(`${API_URL}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
    });
    const alert = await alertRes.json();
    console.log("Alert Created:", alert.id);

    // 3. Test Nearby Filter (Target: Riyadh) -> Should Find
    console.log("Testing Nearby Filter (Match)...");
    const nearbyRes = await fetch(`${API_URL}/alerts?lat=24.71&lng=46.67&radius=10`);
    const nearby = await nearbyRes.json();
    console.log("Found:", nearby.length);
    if (nearby.length > 0 && nearby.find(a => a.id === alert.id)) {
        console.log("SUCCESS: Alert found in nearby search");
    } else {
        console.error("FAILURE: Alert NOT found in nearby search");
    }

    // 4. Test Nearby Filter (Target: Jeddah) -> Should NOT Find
    console.log("Testing Nearby Filter (No Match)...");
    const farRes = await fetch(`${API_URL}/alerts?lat=21.54&lng=39.17&radius=10`);
    const far = await farRes.json();
    console.log("Found:", far.length);
    if (far.length === 0 || !far.find(a => a.id === alert.id)) {
        console.log("SUCCESS: Alert correctly excluded from far search");
    } else {
        console.error("FAILURE: Alert INCORRECTLY found in far search");
    }
}

run().catch(console.error);
