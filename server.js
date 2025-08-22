// server.js - VERSÃO FINAL COM A BIBLIOTECA 'correios-brasil'

const express = require('express');
const cors = require('cors');
const { calcularPrecoPrazo } = require('correios-brasil'); // Nova biblioteca

const app = express();

const corsOptions = {
  origin: 'https://sddistribuidora.github.io',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

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

async function gerarLinkCartpanda(items, frete) {
    const valorTotal = items.reduce((sum, item) => sum + (productData[item.id].price * item.quantity), 0) + frete;
    console.log("Gerando link de pagamento para o valor total de:", valorTotal.toFixed(2));
    return `https://pagamento.exemplo.com/checkout?total=${valorTotal.toFixed(2)}`;
}

app.post('/calcular-frete-e-pagamento', async (req, res) => {
    console.log('Recebida nova requisição para /calcular-frete-e-pagamento');
    const { cart, cepDestino } = req.body;

    if (!cart || !cepDestino || cart.length === 0) {
        return res.status(400).json({ error: 'Dados do carrinho ou CEP ausentes.' });
    }

    try {
        const totalWeight = cart.reduce((sum, item) => sum + (productData[item.id].weight * item.quantity), 0);
        const totalVolume = cart.reduce((sum, item) => {
            const product = productData[item.id];
            const boxVolume = product.length * product.width * product.height;
            return sum + (boxVolume * item.quantity);
        }, 0);

        const cubicRoot = Math.cbrt(totalVolume);
        const side = Math.max(20, Math.ceil(cubicRoot)); 
        
        const subtotal = cart.reduce((sum, item) => sum + (productData[item.id].price * item.quantity), 0);

        const argsCorreios = {
            sCepOrigem: '38400000', // SEU CEP DE ORIGEM
            sCepDestino: cepDestino,
            nVlPeso: totalWeight.toString(), // A nova biblioteca exige que seja string
            nCdFormato: 1,
            nVlComprimento: side.toString(),
            nVlAltura: side.toString(),
            nVlLargura: side.toString(),
            nCdServico: ['04510'], // PAC. Pode ser um array: ['04014', '04510'] para SEDEX e PAC
            nVlValorDeclarado: subtotal.toString(),
            nVlDiametro: '0',
        };

        console.log('Argumentos para os Correios:', argsCorreios);
        const resultadoFrete = await calcularPrecoPrazo(argsCorreios);
        console.log('Resposta dos Correios:', resultadoFrete);
        
        if (!resultadoFrete[0] || resultadoFrete[0].Erro !== '') {
            throw new Error(resultadoFrete[0].MsgErro || 'Não foi possível calcular o frete.');
        }

        const valorFrete = parseFloat(resultadoFrete[0].Valor.replace(',', '.'));
        const linkPagamento = await gerarLinkCartpanda(cart, valorFrete);

        res.json({
            frete: valorFrete,
            total: subtotal + valorFrete,
            paymentLink: linkPagamento
        });

    } catch (error) {
        console.error("Erro ao processar:", error);
        res.status(500).json({ error: 'Ocorreu um erro no servidor.', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    
});
