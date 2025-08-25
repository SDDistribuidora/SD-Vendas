// server.js - VERSÃO FINAL COM INTEGRAÇÃO ASAAS

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { calcularPrecoPrazo } = require('correios-brasil');

const app = express();

const corsOptions = {
  origin: 'https://sddistribuidora.github.io',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// --- SUA CHAVE DA API DA ASAAS (LIDA DO AMBIENTE SEGURO DO RENDER) ---
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_URL = 'https://www.asaas.com/api/v3/payments'; // URL de produção da Asaas

const productData = {
    1: {
        name: "Caixa de Vodka Ignite",
        price: 960.00,
        weight: 15,
        length: 20,
        width: 30,
        height: 32,
    },
    2: {
        name: "Caixa de Gin Ignite",
        price: 510.00,
        weight: 8,
        length: 15,
        width: 23,
        height: 12,
    },
};

// --- NOVA FUNÇÃO PARA GERAR LINK DE PAGAMENTO NA ASAAS ---
async function gerarLinkAsaas(items, frete) {
    if (!ASAAS_API_KEY) {
        throw new Error('A chave da API da Asaas não foi configurada no servidor.');
    }

    const subtotal = items.reduce((sum, item) => sum + (productData[item.id].price * item.quantity), 0);
    const valorTotal = subtotal + frete;
    const description = items.map(item => `${item.quantity}x ${productData[item.id].name}`).join(', ');

    console.log("Gerando cobrança na Asaas no valor de:", valorTotal.toFixed(2));

    const requestBody = {
        billingType: "UNDEFINED", // Permite que o cliente escolha (Boleto, Cartão, Pix)
        chargeType: "DETACHED",
        value: valorTotal,
        dueDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Vencimento em 3 dias
        description: `Pedido S&D Distribuidora: ${description}`,
        // Para uma implementação real, você coletaria o nome e CPF do cliente no front-end
        // e passaria para cá. Por enquanto, usamos um placeholder.
        customer: {
            name: "Cliente S&D",
            cpfCnpj: "00000000000" // CPF/CNPJ genérico
        }
    };

    const headers = {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
    };

    try {
        const response = await axios.post(ASAAS_API_URL, requestBody, { headers });
        // A Asaas retorna a URL da fatura no campo 'invoiceUrl'
        console.log("Link de pagamento Asaas gerado:", response.data.invoiceUrl);
        return response.data.invoiceUrl; 

    } catch (error) {
        console.error("Erro ao criar cobrança na Asaas:", error.response ? error.response.data.errors : error.message);
        throw new Error("Não foi possível criar o link de pagamento.");
    }
}

app.post('/calcular-frete', async (req, res) => {
    // ... (esta parte do código continua a mesma da versão anterior)
});

// Endpoint que o front-end vai chamar para finalizar a compra
app.post('/criar-pagamento', async (req, res) => {
    const { cart, shippingOption } = req.body;

    if (!cart || !shippingOption) {
        return res.status(400).json({ error: 'Dados do carrinho ou do frete ausentes.' });
    }

    try {
        const frete = parseFloat(shippingOption.price);
        const linkPagamento = await gerarLinkAsaas(cart, frete);
        res.json({ paymentLink: linkPagamento });
    } catch (error) {
        console.error("Erro ao criar pagamento:", error);
        res.status(500).json({ error: 'Ocorreu um erro no servidor.', details: error.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
