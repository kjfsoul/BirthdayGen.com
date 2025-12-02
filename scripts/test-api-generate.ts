import axios from 'axios';

const API_URL = 'http://localhost:3000/api/generate';

async function testApi() {
    console.log('🧪 Testing /api/generate endpoint...\n');

    // Ensure server is running (this script assumes it is, or we might need to mock it if we can't hit localhost easily from here without running dev server)
    // Since we can't easily ensure the dev server is running in this environment without blocking,
    // we will assume the user (or a separate process) would run the server.
    // HOWEVER, since I cannot start the server and run this script in parallel easily in one go without backgrounding,
    // I will try to hit it. If it fails, I'll report that the server needs to be running.

    // Actually, a better approach for this environment might be to unit test the handler if possible,
    // but integration testing is requested.
    // Let's try to hit the endpoint. If connection refused, we know why.

    const payload = {
        recipientName: "Charlie",
        relationship: "friend",
        tone: "witty",
        interests: ["gaming", "pizza"]
    };

    try {
        console.log(`Sending payload: ${JSON.stringify(payload, null, 2)}`);
        const response = await axios.post(API_URL, payload);

        console.log('\n✅ API Response Status:', response.status);
        console.log('📝 Generated Content:');
        console.log(response.data.content);
        console.log('\n-----------------------------------\n');

    } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
            console.error('\n❌ Connection refused. Is the Next.js server running on port 3000?');
            console.error('Run `npm run dev` in a separate terminal to test this script.');
        } else {
            console.error('\n❌ API Request Failed:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', JSON.stringify(error.response.data, null, 2));
            }
        }
    }
}

testApi();
