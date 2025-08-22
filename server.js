// server.js - CÓDIGO CORRETO DO BACK-END

const express = require('express');
const cors = require('cors');
const Correios = require('node-correios');

const app = express();
const correios = new Correios();

const corsOptions = {
  origin: 'https://sddistribuidora.github.io',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// --- DADOS CORRIGIDOS POR CAIXA FECHADA ---
const productData = {
    1: {
        name: "Caixa de Vodka Ignite",
        price: 960.00,
        weight: 15, // kg
        length: 20, // cm
        width: 30,  // cm
        height: 32, // cm
    },
    2: {
        name: "Caixa de Gin Ignite",
        price: 510.00,
        weight: 8,   // kg
        length: 15,  // cm
        width: 23,   // cm
        height: 12,  // cm
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
        // --- LÓGICA DE CÁLCULO BASEADA NO NÚMERO DE CAIXAS ---
        // A 'quantity' que vem do front-end agora representa o número de caixas.
        const totalWeight = cart.reduce((sum, item) => sum + (productData[item.id].weight * item.quantity), 0);
        const finalHeight = cart.reduce((sum, item) => sum + (productData[item.id].height * item.quantity), 0); // Empilhando caixas
        const finalLength = Math.max(...cart.map(item => productData[item.id].length));
        const finalWidth = Math.max(...cart.map(item => productData[item.id].width));
        
        const subtotal = cart.reduce((sum, item) => sum + (productData[item.id].price * item.quantity), 0);

        const argsCorreios = {
            nCdServico: '04510', // PAC
            sCepOrigem: '38400000', // SEU CEP DE ORIGEM
            sCepDestino: cepDestino,
            nVlPeso: totalWeight,
            nCdFormato: 1, // Caixa
            nVlComprimento: Math.max(20, finalLength),
            nVlAltura: Math.max(10, finalHeight),
            nVlLargura: Math.max(20, finalWidth),
            nVlDiametro: 0,
            sCdMaoPropria: 'N',
            nVlValorDeclarado: subtotal,
            sCdAvisoRecebimento: 'N',
        };

        console.log('Argumentos para os Correios:', argsCorreios);
        const [resultadoFrete] = await correios.calcPreco(argsCorreios);
        console.log('Resposta dos Correios:', resultadoFrete);
        
        if (!resultadoFrete || resultadoFrete.Erro !== '0') {
            throw new Error(resultadoFrete.MsgErro || 'Não foi possível calcular o frete.');
        }

        const valorFrete = parseFloat(resultadoFrete.Valor.replace(',', '.'));
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
