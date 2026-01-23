
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
    async createPixCharge(document: string, nome: string, total: string) {
        const token = await this.authenticate();

        const cleanDoc = document.replace(/\D/g, "");
        const devedor: any = {
            nome: nome,
        };

        console.log(`🔍 Criando PIX. Documento: ${document} (Clean: ${cleanDoc}, Len: ${cleanDoc.length})`);

        if (cleanDoc.length === 14) {
            devedor.cnpj = cleanDoc;
        } else if (cleanDoc.length === 11) {
            devedor.cpf = cleanDoc;
        } else {
            throw new Error(`CPF/CNPJ inválido. Foram informados ${cleanDoc.length} números. Verifique os dados.`);
        }

        const data = {
            calendario: {
                expiracao: 3600, // 1 hora para pagar
            },
            devedor: devedor,
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

    /**
     * 5. Criar Cobrança Cartão de Crédito (One Step)
     * Requer `payment_token` gerado no front-end.
     */
    async createCreditCardCharge(
        data: {
            items: { name: string; value: number; amount: number }[];
            customer: { name: string; cpf: string; email: string; phone: string; birth?: string };
            billingAddress: { street: string; number: string; neighborhood: string; zip: string; city: string; state: string; complement?: string };
            paymentToken: string;
            installments: number; // Parcelas: 1 a 12
            total: number; // Used only for validation/logging
        }
    ) {
        const token = await this.authenticate();

        console.log(`🔍 Criando Pagamento Cartão. Cliente: ${data.customer.name}, Valor: ${data.total}`);

        const payload = {
            items: data.items,
            customer: {
                name: data.customer.name,
                cpf: data.customer.cpf.replace(/\D/g, ""),
                email: data.customer.email,
                phone_number: data.customer.phone.replace(/\D/g, ""),
                birth: data.customer.birth || "1990-01-01", // Efí sometimes requires birth date
            },
            payment: {
                credit_card: {
                    customer: {
                        name: data.customer.name, // Usually same as payer
                        cpf: data.customer.cpf.replace(/\D/g, ""),
                        email: data.customer.email,
                        phone_number: data.customer.phone.replace(/\D/g, ""),
                        birth: data.customer.birth || "1990-01-01",
                        billing_address: {
                            street: data.billingAddress.street,
                            number: data.billingAddress.number,
                            neighborhood: data.billingAddress.neighborhood,
                            zipcode: data.billingAddress.zip.replace(/\D/g, ""),
                            city: data.billingAddress.city,
                            state: data.billingAddress.state,
                            complement: data.billingAddress.complement
                        }
                    },
                    installments: data.installments,
                    payment_token: data.paymentToken,
                    billing_address: {
                        street: data.billingAddress.street,
                        number: data.billingAddress.number,
                        neighborhood: data.billingAddress.neighborhood,
                        zipcode: data.billingAddress.zip.replace(/\D/g, ""),
                        city: data.billingAddress.city,
                        state: data.billingAddress.state,
                        complement: data.billingAddress.complement
                    }
                }
            }
        };

        try {
            const response = await axios({
                method: "POST",
                url: `${EFI_URL}/v1/charge/one-step`, // Note: One Step uses /v1
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                httpsAgent: this.agent,
                data: payload,
            });

            // response.data usually contains { code: 200, data: { status: 'approved' | 'waiting' | 'unpaid', charge_id, total, ... } }
            return {
                success: true,
                data: response.data.data,
                charge_id: response.data.data.charge_id,
                status: response.data.data.status // 'approved', 'waiting', 'unpaid', 'paid'
            };
        } catch (error: any) {
            console.error("❌ Efí Create Card Charge Error:", JSON.stringify(error.response?.data || error.message, null, 2));
            throw new Error(`Erro no pagamento com cartão: ${error.response?.data?.error_description || error.message}`);
        }
    }
}

export const efiService = new EfiService();
