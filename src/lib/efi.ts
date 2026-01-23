
import https from "https";
import axios from "axios";

// Constants
const EFI_URL = "https://pix.api.efipay.com.br"; // Production URL
const CLIENT_ID = process.env.EFI_CLIENT_ID;
const CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const CERT_BASE64 = process.env.EFI_CERT_BASE64;

if (!CLIENT_ID || !CLIENT_SECRET || !CERT_BASE64) {
    console.error("⚠️ Efí credentials missing. Check .env.local");
}

export class EfiService {
    private agent: https.Agent;
    private credentials: string;

import fs from "fs";
import path from "path";

// ... (constants)
const EFI_CERT_PATH = process.env.EFI_CERT_PATH || "producao.p12"; // Default to looking for 'producao.p12' in root

// ...

constructor() {
    let cert: Buffer;

    if (CERT_BASE64) {
        cert = Buffer.from(CERT_BASE64, "base64");
    } else {
        // Try to read from file
        try {
            const certPath = path.resolve(process.cwd(), EFI_CERT_PATH);
            if (fs.existsSync(certPath)) {
                cert = fs.readFileSync(certPath);
            } else {
                console.error(`❌ Certificate file not found at: ${certPath}`);
                cert = Buffer.from(""); // Will cause auth fail
            }
        } catch (err) {
            console.error("❌ Error reading certificate file:", err);
            cert = Buffer.from("");
        }
    }

    this.agent = new https.Agent({
        pfx: cert,
        passphrase: "", // Default for Efí is empty
    });
    this.credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
}

    /**
     * 1. Autenticação (OAuth)
     * Obtém o Token Bearer válido por 1h
     */
    private async authenticate() {
    try {
        const response = await axios({
            method: "POST",
            url: `${EFI_URL}/oauth/token`,
            headers: {
                Authorization: `Basic ${this.credentials}`,
                "Content-Type": "application/json",
            },
            httpsAgent: this.agent,
            data: {
                grant_type: "client_credentials",
            },
        });

        return response.data.access_token;
    } catch (error: any) {
        console.error("❌ Efí Auth Error:", error.response?.data || error.message);
        throw new Error("Falha na autenticação da Efí");
    }
}

    /**
     * 2. Criar Cobrança Imediata
     */
    async createPixCharge(cpf: string, nome: string, total: string) {
    const token = await this.authenticate();

    const data = {
        calendario: {
            expiracao: 3600, // 1 hora para pagar
        },
        devedor: {
            cpf: cpf.replace(/\D/g, ""), // Remove pontuação
            nome: nome,
        },
        valor: {
            original: total, // Ex: "10.50"
        },
        chave: process.env.EFI_PIX_KEY, // Chave PIX da Ouro Gráfica
    };

    // *Nota:* A rota /v2/cob não exige "chave" no body se o certificado já identifica a conta,
    // mas depende da config da conta. Vamos tentar sem chave primeiro, ou deixar dinâmico.
    // Na verdade, Efí geralmente exige a chave PIX cadastrada na conta.
    // O usuário não passou a chave PIX dele ainda.
    // Solução: Vamos omitir 'chave' e ver se a Efí aceita (cobrança dinâmica).
    // Se der erro, pedimos a chave PIX.

    try {
        const response = await axios({
            method: "POST",
            url: `${EFI_URL}/v2/cob`,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            httpsAgent: this.agent,
            data: data,
        });

        return response.data; // Retorna { txid, loc: { id, ... } }
    } catch (error: any) {
        console.error("❌ Efí Create Charge Error:", error.response?.data || error.message);
        // Se pedir chave, vamos saber pelo log
        throw new Error("Erro ao criar cobrança PIX");
    }
}

    /**
     * 3. Gerar QR Code (Imagem e Copia/Cola)
     */
    async getQrCode(locId: number) {
    const token = await this.authenticate();

    try {
        const response = await axios({
            method: "GET",
            url: `${EFI_URL}/v2/loc/${locId}/qrcode`,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            httpsAgent: this.agent,
        });

        return response.data; // { qrcode, imagemQrcode }
    } catch (error: any) {
        console.error("❌ Efí Get QR Error:", error.response?.data || error.message);
        throw new Error("Erro ao gerar QR Code");
    }
}
}

export const efiService = new EfiService();
