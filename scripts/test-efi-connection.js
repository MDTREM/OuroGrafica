const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');

// Helper to load .env.local manually
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        if (!fs.existsSync(envPath)) {
            console.log("⚠️ .env.local not found in root.");
            return {};
        }
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        console.error("Error loading .env.local", e);
        return {};
    }
}

const env = loadEnv();
const CLIENT_ID = env.EFI_CLIENT_ID;
const CLIENT_SECRET = env.EFI_CLIENT_SECRET;
const CERT_PATH_NAME = env.EFI_CERT_PATH || "producao.p12";

console.log("---------------------------------------------------");
console.log("🔍 Diagnóstico de Conexão Efí (Ouro Gráfica)");
console.log("---------------------------------------------------");
console.log(`🔑 Client ID: ${CLIENT_ID ? CLIENT_ID.substring(0, 5) + '...' : 'MISSING'}`);
console.log(`🔑 Client Secret: ${CLIENT_SECRET ? '*******' : 'MISSING'}`);
console.log(`📄 Cert File: ${CERT_PATH_NAME}`);

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("❌ Credenciais faltando. Verifique .env.local");
    process.exit(1);
}

// Load Cert
let cert = null;
try {
    const certPath = path.resolve(__dirname, '..', CERT_PATH_NAME);
    if (fs.existsSync(certPath)) {
        cert = fs.readFileSync(certPath);
        console.log("✅ Arquivo de certificado encontrado.");
    } else {
        console.error(`❌ Arquivo de certificado não encontrado em: ${certPath}`);
        // Continue anyway to test if maybe cert is not needed for some reason (unlikely for PIX)
    }
} catch (e) {
    console.error("❌ Erro ao ler certificado:", e.message);
}

const agent = new https.Agent({
    pfx: cert,
    passphrase: ""
});

const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

async function testAuth(envName, baseUrl) {
    console.log(`\nTesting ${envName} (${baseUrl})...`);
    try {
        const response = await axios({
            method: "POST",
            url: `${baseUrl}/oauth/token`,
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/json",
            },
            httpsAgent: agent,
            data: {
                grant_type: "client_credentials",
            },
            timeout: 10000
        });

        console.log(`✅ SUCESSO! Conectado em ${envName}.`);
        console.log(`🎫 Access Token: ${response.data.access_token.substring(0, 10)}...`);
        console.log(`⏱️  Expires In: ${response.data.expires_in}`);
        return true;
    } catch (error) {
        console.error(`❌ Falha em ${envName}:`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data:`, JSON.stringify(error.response.data));
        } else {
            console.error(`   Error: ${error.message}`);
        }
        return false;
    }
}

async function run() {
    // 1. Test Production (PAY)
    const prodPaySuccess = await testAuth("Production (General API)", "https://api.efipay.com.br");

    // 2. Test Production (PIX) - Usually same credentials but let's check
    // const prodPixSuccess = await testAuth("Production (PIX)", "https://pix.api.efipay.com.br");

    if (!prodPaySuccess) {
        console.log("\n⚠️ Falha na Produção. Tentando Sandbox...");
        // 3. Test Sandbox (PAY - Legacy/General)
        // Efí Sandbox for Payment APIs often uses https://sandbox.efipay.com.br
        const sandboxPaySuccess = await testAuth("Sandbox (General API)", "https://sandbox.efipay.com.br");

        // 4. Test Sandbox (PIX)
        const sandboxPixSuccess = await testAuth("Sandbox (PIX)", "https://pix-h.api.efipay.com.br");

        if (sandboxPaySuccess || sandboxPixSuccess) {
            console.log("\n💡 CONCLUSÃO: Suas credenciais parecem ser de SANDBOX (Ambiente de Teste).");
            console.log("   O sistema está configurado para PRODUÇÃO.");
            console.log("   --> Altere a configuração para usar as URLs de Sandbox.");
        } else {
            console.log("\n❌ CONCLUSÃO: Credenciais inválidas para Produção e Sandbox.");
            console.log("   Verifique se o Certificado (.p12) corresponde ao Client_ID/Secret.");
            console.log("   Verifique se a conta Efí está ativa e com API habilitada.");
        }
    } else {
        console.log("\n✅ CONCLUSÃO: Credenciais de PRODUÇÃO válidas.");
        console.log("   Se o erro 401 persiste no checkout, pode ser falha especifica na criação da cobrança (ex: dados inválidos) ou escopo não permitido.");
    }
}

run();
