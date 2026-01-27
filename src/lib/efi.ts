
import https from "https";
import axios from "axios";
import fs from "fs";
import path from "path";

// Constants
const ENV = process.env.EFI_ENV || "production"; // 'production' or 'sandbox'

const EFI_PIX_URL = ENV === "sandbox" ? "https://pix-h.api.efipay.com.br" : "https://pix.api.efipay.com.br";
const EFI_PAY_URL = ENV === "sandbox" ? "https://sandbox.efipay.com.br" : "https://cobrancas.api.efipay.com.br"; // Resource URL (some end points use api.efipay)
const EFI_AUTH_PAY_URL = ENV === "sandbox" ? "https://sandbox.efipay.com.br" : "https://api.efipay.com.br"; // Auth URL

const CLIENT_ID = process.env.EFI_CLIENT_ID;
const CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const CERT_BASE64 = process.env.EFI_CERT_BASE64;
const EFI_PIX_KEY = process.env.EFI_PIX_KEY;

// Default to looking for 'producao.p12' or 'homologacao.p12'
const EFI_CERT_PATH = process.env.EFI_CERT_PATH || (ENV === "sandbox" ? "homologacao.p12" : "producao.p12");

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
     * @param baseUrl - Base URL to authenticate against (PIX or PAY)
     */
    private async authenticate(baseUrl: string) {
        try {
            // NOTE: For General API (PAY), usually mTLS is not strictly required, 
            // but for PIX it is. We try using the same agent (with cert) for both.
            // If PAY endpoint rejects mTLS, we might need a separate agent without cert.

            const response = await axios({
                method: "POST",
                url: `${baseUrl}/oauth/token`,
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
            console.error(`❌ Efí Auth Error (${baseUrl}):`, error.response?.data || error.message);
            throw new Error(`Falha na autenticação da Efí (${baseUrl}): ${JSON.stringify(error.response?.data || error.message)}`);
        }
    }

    /**
     * 2. Criar Cobrança Imediata (PIX)
     */
    async createPixCharge(document: string, nome: string, total: string) {
        const token = await this.authenticate(EFI_PIX_URL);

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
            chave: EFI_PIX_KEY, // Chave PIX da Ouro Gráfica
        };

        try {
            const response = await axios({
                method: "POST",
                url: `${EFI_PIX_URL}/v2/cob`,
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
     * 3. Gerar QR Code (Imagem e Copia/Cola) (PIX)
     */
    async getQrCode(locId: number) {
        const token = await this.authenticate(EFI_PIX_URL);

        try {
            const response = await axios({
                method: "GET",
                url: `${EFI_PIX_URL}/v2/loc/${locId}/qrcode`,
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
     * 4. Consultar Status da Cobrança (PIX)
     */
    async getPixStatus(txid: string) {
        const token = await this.authenticate(EFI_PIX_URL);

        try {
            const response = await axios({
                method: "GET",
                url: `${EFI_PIX_URL}/v2/cob/${txid}`,
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
     * 5. Criar Cobrança Cartão de Crédito (One Step) (PAY)
     * Requer `payment_token` gerado no front-end.
     * Endpoint: /v1/charge/one-step  (Base URL: api.efipay.com.br)
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
        // Authenticate using General/Legacy URL 
        const token = await this.authenticate(EFI_AUTH_PAY_URL);

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
                url: `${EFI_PAY_URL}/v1/charge/one-step`, // General API
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                httpsAgent: this.agent,
                data: payload,
            });

            console.log("✅ Efí Response:", JSON.stringify(response.data, null, 2));

            if (!response.data || !response.data.data) {
                throw new Error(`Resposta inesperada da Efí: ${JSON.stringify(response.data)}`);
            }

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
    /**
     * 6. Criar Cobrança Simples (Necessário para Link de Pagamento) (PAY)
     * POST /v1/charge
     */
    async createCharge(items: { name: string; value: number; amount: number }[], shippings?: { name: string; value: number }[]) {
        const token = await this.authenticate(EFI_AUTH_PAY_URL);

        const data: any = {
            items: items,
        };

        if (shippings && shippings.length > 0) {
            data.shippings = shippings;
        }

        try {
            const response = await axios({
                method: "POST",
                url: `${EFI_PAY_URL}/v1/charge`,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                httpsAgent: this.agent,
                data: data,
            });

            // Returns { code, data: { charge_id, status, ... } }
            return response.data.data;
        } catch (error: any) {
            console.error("❌ Efí Create Charge Error:", JSON.stringify(error.response?.data || error.message, null, 2));
            throw new Error(`Erro ao criar transação: ${error.response?.data?.error_description || error.message}`);
        }
    }

    /**
     * 7. Gerar Link de Pagamento (PAY)
     * POST /v1/charge/:id/link
     */
    async createPaymentLink(chargeId: number, title: string, price: number, expiryDate?: string) {
        const token = await this.authenticate(EFI_AUTH_PAY_URL);

        const data = {
            billet_discount: 0,
            card_discount: 0,
            message: title,
            expire_at: expiryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days default
            request_delivery_address: false,
            payment_method: "all" // Allow Boleto and Card
        };

        try {
            const response = await axios({
                method: "POST",
                url: `${EFI_PAY_URL}/v1/charge/${chargeId}/link`,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                httpsAgent: this.agent,
                data: data,
            });

            // Returns { code, data: { payment_url, payment_link_id, ... } }
            return response.data.data;
        } catch (error: any) {
            console.error("❌ Efí Create Link Error:", JSON.stringify(error.response?.data || error.message, null, 2));
            throw new Error(`Erro ao gerar link: ${error.response?.data?.error_description || error.message}`);
        }
    }
}

export const efiService = new EfiService();
