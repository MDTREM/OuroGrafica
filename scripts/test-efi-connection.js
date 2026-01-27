const https = require("https");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// SETTINGS
const ENV = "production";
const EFI_CERT_PATH = "producao.p12";

// ENDPOINTS TO PROBE
const ENDPOINTS = [
    "https://api.efipay.com.br",
    "https://cobrancas.api.efipay.com.br",
    "https://pix.api.efipay.com.br"
];

// Helper to load env
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, "../.env.local");
        const content = fs.readFileSync(envPath, "utf8");
        content.split("\n").forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"]|['"]$/g, ""); // remove quotes
                process.env[key] = value;
            }
        });
    } catch (e) {
        console.log("⚠️ Could not load .env.local manually");
    }
}

loadEnv();

(async () => {
    console.log("*** EFI ENDPOINT PROBE ***\n");

    // 1. Load Certificate
    let cert;
    try {
        cert = fs.readFileSync(path.resolve(__dirname, "../", EFI_CERT_PATH));
        console.log("✅ Certificate loaded from file.");
    } catch (e) {
        console.error("❌ Certificate failed:", e.message);
        process.exit(1);
    }

    const agent = new https.Agent({
        pfx: cert,
        passphrase: "",
    });

    // 2. Authenticate
    const authUrl = "https://api.efipay.com.br/oauth/token";
    let token = "";

    try {
        const authString = Buffer.from(
            `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
        ).toString("base64");

        console.log(`\n🔑 Authenticating at ${authUrl}...`);
        const response = await axios({
            method: "POST",
            url: authUrl,
            headers: {
                Authorization: `Basic ${authString}`,
                "Content-Type": "application/json",
            },
            data: { grant_type: "client_credentials" },
            httpsAgent: agent,
        });

        token = response.data.access_token;
        console.log("✅ Authenticated! Token obtained.");
    } catch (err) {
        console.error("❌ Auth Failed:", err.response?.data || err.message);
        process.exit(1);
    }

    // 3. Probe Endpoints for 'one-step'
    console.log("\n📡 Probing /v1/charge/one-step on hosts...");

    for (const host of ENDPOINTS) {
        const url = `${host}/v1/charge/one-step`;
        process.stdout.write(`👉 Probing ${host}... `);

        try {
            await axios({
                method: "POST",
                url: url,
                headers: {
                    Authorization: `Bearer ${token}`, // Pass token
                    "Content-Type": "application/json" // JSON body
                },
                data: {}, // EMPTY BODY -> Should cause 400 Bad Request
                httpsAgent: agent, // Use cert here too (mTLS might be needed)
                validateStatus: () => true // Don't throw on error
            }).then(res => {
                if (res.status === 400 || res.status === 200) {
                    console.log(`\n🎉 SUCCESS CANDIDATE! Status: ${res.status} (Likely Correct)`);
                } else if (res.status === 401) {
                    console.log(`❌ 401 Unauthorized (Auth failed here)`);
                } else if (res.status === 404) {
                    console.log(`❌ 404 Not Found (Endpoint missing)`);
                } else {
                    console.log(`⚠️ Status ${res.status}`);
                }
            });

        } catch (err) {
            console.log(`❌ Network Error: ${err.message}`);
        }
    }

})();
