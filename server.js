// server.js - VERSÃO FINAL COM A API DO MELHOR ENVIO

const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Usaremos Axios para as requisições

const app = express();

const corsOptions = {
  origin: 'https://sddistribuidora.github.io',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// --- SEU TOKEN DE ACESSO DO MELHOR ENVIO ---
const MELHOR_ENVIO_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiN2FiYTNiOWQzN2VkN2VlYzg4YjhmZDRkOWY3OTc0MTMyNTA3NDc2NmY0ZWUzZDE4NmRlNmFhOTFlMjZkYmRiNjU1MjFlODhmMmY2MzVmNmEiLCJpYXQiOjE3NTU4ODMxMDYuMzMwMzQ4LCJuYmYiOjE3NTU4ODMxMDYuMzMwMzUsImV4cCI6MTc4NzQxOTEwNi4zMTI2NTEsInN1YiI6IjlmYjI1NWNkLWUzMDUtNDdkMy1iMTk3LWIyNDQ4YTJhM2YwNyIsInNjb3BlcyI6WyJzaGlwcGluZy1jYWxjdWxhdGUiXX0.AI5PrR4XHRc49cu1QTVJ9HOBrGhdfUs-QzIht8sxuGvMmxKNJhkVfOvLdDAoae-pq2R_NsTTEjGRko-FsADhaQSeA8qnTgqK6HUkj1ao1y_zwmocCp5J6y0t9asjGccaquFgiw2jaabkQ8zS-x4mEQZ6bxl6r5852Qgbbp4ukk3TgC3qaX9ivst2Gd51qj7D_DirzE02R5b3ybZ-lC6aU77zdJ_-BmhQ-wT2d_NCgv9zrNOY2Tye8rgt0ZJ0y-nF_XG6hD36Q_4W1SDnQFej9Hj319Sz3Q8U1ZyyFjGup1URLaGGrevKA5_yLBTXdeHsulRz52NTKhjDcmB0GjJpnXnKVptwwRT1VC5pe9CZVt-6RmgYdtTgwoE-ahi_Bgm2jN298aiiwRp3X254ReZwLtaSkytQ5E0XlZzq4B25fzel4glfZnx2Usp0yqdDbmYv-dtWl8tQ3tX0YzaFabfLs9N6uK46H8bEbOCPN1tVAuWVcavOik2eJUisicnuUXVvxrSszNKOTcLFWoc4i2qy7J1okJi4ixd0xs9DB6a4JjjvQiMMiF0IGPqCylwUg6QvLACihycd-mg2dX7srtdur9k9Gt6OdIll1VmQh9u4MTb0RFb-ovrMx04__wMgdiEKfhJksgtnpUyIALnTXTYHOltlhCPwhgTCkbS8oACJiBA';

// --- DADOS DOS PRODUTOS POR CAIXA FECHADA ---
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

// Endpoint da API do Melhor Envio para cálculo de frete
const ME_API_URL = 'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate';

app.post('/calcular-frete', async (req, res) => {
    console.log('Recebida nova requisição para /calcular-frete');
    const { cart, cepDestino } = req.body;

    if (!cart || !cepDestino || cart.length === 0) {
        return res.status(400).json({ error: 'Dados do carrinho ou CEP ausentes.' });
    }

    try {
        const subtotal = cart.reduce((sum, item) => sum + (productData[item.id].price * item.quantity), 0);
        
        // O Melhor Envio pode calcular o empacotamento. Vamos enviar os produtos.
        const productsForShipping = cart.map(item => {
            const product = productData[item.id];
            // A API espera os dados de cada caixa individualmente
            const items = [];
            for (let i = 0; i < item.quantity; i++) {
                items.push({
                    id: item.id,
                    width: product.width,
                    height: product.height,
                    length: product.length,
                    weight: product.weight,
                    insurance_value: product.price,
                    quantity: 1 // Cada item na lista é uma caixa
                });
            }
            return items;
        }).flat(); // O .flat() transforma [[caixa1], [caixa2]] em [caixa1, caixa2]

        const requestBody = {
            from: { postal_code: "38400000" }, // <<< COLOQUE SEU CEP DE ORIGEM AQUI
            to: { postal_code: cepDestino },
            products: productsForShipping,
            options: {
                insurance_value: subtotal,
                receipt: false,
                own_hand: false
            }
        };

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
            'User-Agent': 'S&D Distribuidora (seddistribuidora@yahoo.com)'
        };

        console.log('Enviando para Melhor Envio:', JSON.stringify(requestBody, null, 2));
        const { data: shippingOptions } = await axios.post(ME_API_URL, requestBody, { headers });

        // Filtra para garantir que apenas opções válidas sejam retornadas
        const validOptions = shippingOptions.filter(option => !option.error);

        console.log('Opções de frete recebidas:', validOptions);
        res.json(validOptions);

    } catch (error) {
        console.error("Erro ao calcular frete com Melhor Envio:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Não foi possível calcular o frete.', details: error.response ? error.response.data : error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
