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
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, "utf8");
            content.split("\n").forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, "");
                }
            });
        }
    } catch (e) { }
}

loadEnv();

(async () => {
    console.log("START_PROBE");

    // 1. Load Certificate
    let cert;
    try {
        const p = path.resolve(__dirname, "../", EFI_CERT_PATH);
        if (fs.existsSync(p)) cert = fs.readFileSync(p);
        else { console.log("CERT_MISSING"); process.exit(1); }
    } catch (e) {
        console.log("CERT_ERROR"); process.exit(1);
    }

    const agent = new https.Agent({ pfx: cert, passphrase: "" });

    // 2. Authenticate
    const authUrl = "https://api.efipay.com.br/oauth/token";
    let token = "";

    try {
        const authString = Buffer.from(`${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`).toString("base64");
        const response = await axios({
            method: "POST", url: authUrl,
            headers: { Authorization: `Basic ${authString}`, "Content-Type": "application/json" },
            data: { grant_type: "client_credentials" },
            httpsAgent: agent,
        });
        token = response.data.access_token;
        console.log("AUTH_SUCCESS");
    } catch (err) {
        console.log("AUTH_FAIL " + (err.response?.status || err.message));
        process.exit(1);
    }

    // 3. Probe
    console.log("PROBING_HOSTS");
    for (const host of ENDPOINTS) {
        const url = `${host}/v1/charge/one-step`;
        try {
            await axios({
                method: "POST", url: url,
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                data: {},
                httpsAgent: agent,
                validateStatus: () => true
            }).then(res => {
                console.log(`RESULT: ${host} -> ${res.status}`);
            });
        } catch (err) {
            console.log(`RESULT: ${host} -> ERROR ${err.message}`);
        }
    }
    console.log("END_PROBE");
})();
