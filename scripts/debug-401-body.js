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
    console.log("DEBUG_401_START");
    const cert = fs.readFileSync(path.resolve(__dirname, "../producao.p12"));
    const agent = new https.Agent({ pfx: cert, passphrase: "" });

    // 1. Auth (API)
    let token;
    try {
        const creds = Buffer.from(process.env.EFI_CLIENT_ID + ":" + process.env.EFI_CLIENT_SECRET).toString("base64");
        const res = await axios.post("https://api.efipay.com.br/oauth/token",
            { grant_type: "client_credentials" },
            { headers: { Authorization: "Basic " + creds }, httpsAgent: agent }
        );
        token = res.data.access_token;
        console.log("AUTH_OK");
    } catch (e) { console.log("AUTH_FAIL", e.message); process.exit(1); }

    // 2. Hit Cobrancas
    try {
        await axios.post("https://cobrancas.api.efipay.com.br/v1/charge/one-step",
            {},
            { headers: { Authorization: "Bearer " + token }, httpsAgent: agent }
        );
        console.log("UNEXPECTED_SUCCESS_200");
    } catch (e) {
        if (e.response) {
            console.log(`STATUS: ${e.response.status}`);
            console.log("HEADERS:", JSON.stringify(e.response.headers));
            console.log("BODY:", JSON.stringify(e.response.data));
        } else {
            console.log("NET_ERROR:", e.message);
        }
    }
})();
