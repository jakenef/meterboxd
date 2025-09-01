// Simple script to test the API connection
// Run with: node test-api.js

const apiUrl = process.argv[2] || "https://meterboxd-production.up.railway.app";

async function testApi() {
  try {
    console.log(`Testing API health check at: ${apiUrl}/api/health`);
    const response = await fetch(`${apiUrl}/api/health`);
    const data = await response.json();

    console.log("API Response:", data);

    if (data.status === "healthy") {
      console.log("✅ API is healthy!");
      console.log(`- TMDB API configured: ${data.tmdb_configured}`);
      console.log(`- MongoDB connected: ${data.mongodb_connected}`);
    } else {
      console.log("❌ API is unhealthy!");
    }
  } catch (error) {
    console.error("❌ Error connecting to API:", error.message);
    console.log("Check that your API is running and the URL is correct.");
  }
}

testApi();
