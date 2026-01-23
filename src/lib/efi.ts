
import https from "https";
import axios from "axios";
import fs from "fs";
import path from "path";

// Constants
const EFI_URL = "https://pix.api.efipay.com.br"; // Production URL
const CLIENT_ID = process.env.EFI_CLIENT_ID;
const CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const CERT_BASE64 = process.env.EFI_CERT_BASE64;

// Default to looking for 'producao.p12' in root path
const EFI_CERT_PATH = process.env.EFI_CERT_PATH || "producao.p12";

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("⚠️ Efí credentials missing. Check .env.local or Vercel Env Vars");
}

export class EfiService {
    private agent: https.Agent;
    private credentials: string;

    constructor() {
        let cert: Buffer;

        if (CERT_BASE64) {
            cert = Buffer.from(CERT_BASE64, "base64");
        } else {
            // Try to read from file
            try {
                // In Vercel serverless, process.cwd() is usually the root of the project
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
            throw new Error(`Falha na autenticação da Efí: ${JSON.stringify(error.response?.data || error.message)}`);
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
            throw new Error(`Erro ao criar cobrança PIX: ${JSON.stringify(error.response?.data || error.message)}`);
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
    /**
     * 4. Consultar Status da Cobrança
     */
    async getPixStatus(txid: string) {
        const token = await this.authenticate();

        try {
            const response = await axios({
                method: "GET",
                url: `${EFI_URL}/v2/cob/${txid}`,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                httpsAgent: this.agent,
            });

            return response.data; // { status: "ATIVAV", "CONCLUIDA", ... }
        } catch (error: any) {
            console.error("❌ Efí Get Status Error:", error.response?.data || error.message);
            throw new Error("Erro ao consultar status do PIX");
        }
    }
}

export const efiService = new EfiService();
