const https = require("https");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Simple env loader
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, "utf8").split("\n").forEach(l => {
        const m = l.match(/^([^=]+)=(.*)$/);
        if (m) process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
    });
}

(async () => {
    console.log("DEBUG_TWO_STEP_START");

    const certPath = path.resolve(__dirname, "../producao.p12");
    if (!fs.existsSync(certPath)) process.exit(1);
    const cert = fs.readFileSync(certPath);
    const agent = new https.Agent({ pfx: cert, passphrase: "" });

    let token;
    // 1. Auth
    try {
        const creds = Buffer.from(process.env.EFI_CLIENT_ID + ":" + process.env.EFI_CLIENT_SECRET).toString("base64");
        const res = await axios.post("https://api.efipay.com.br/oauth/token",
            { grant_type: "client_credentials" },
            { headers: { Authorization: "Basic " + creds }, httpsAgent: agent }
        );
        token = res.data.access_token;
        console.log("AUTH_OK");
    } catch (e) { console.log("AUTH_FAIL"); process.exit(1); }

    // 2. Create Charge (Step 1 of 2)
    try {
        console.log("ATTEMPTING: POST https://api.efipay.com.br/v1/charge");
        const res = await axios.post("https://api.efipay.com.br/v1/charge",
            {
                items: [{ name: "Test Item", value: 100, amount: 1 }]
            },
            { headers: { Authorization: "Bearer " + token }, httpsAgent: agent }
        );
        console.log("CHARGE_CREATE_SUCCESS: " + res.status);
        console.log("BODY: " + JSON.stringify(res.data, null, 2));
    } catch (e) {
        if (e.response) {
            console.log(`CHARGE_FAIL: ${e.response.status}`);
            console.log("BODY:", JSON.stringify(e.response.data));
        } else {
            console.log("NET_ERROR:", e.message);
        }
    }
})();
