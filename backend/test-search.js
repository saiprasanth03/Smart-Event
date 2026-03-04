const axios = require('axios');

async function testSearch() {
    try {
        const id = '9E0EB8F6';
        console.log(`Testing search for ID: ${id}`);
        const res = await axios.get(`http://localhost:5000/api/events/${id}`);
        console.log('Response Status:', res.status);
        console.log('Response Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('Error Status:', err.response?.status);
        console.error('Error Data:', err.response?.data);
    }
}

testSearch();
