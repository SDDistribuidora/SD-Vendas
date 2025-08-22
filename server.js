// server.js - CÓDIGO CORRETO DO BACK-END

// 1. Importação das bibliotecas necessárias
const express = require('express');
const cors = require('cors');
const Correios = require('node-correios');

// 2. Inicialização do servidor e configurações
const app = express();
const correios = new Correios();
app.use(cors());
app.use(express.json());

// --- DADOS DOS PRODUTOS E CAIXAS (FONTE DA VERDADE) ---
const productData = {
    1: {
        name: "Vodka Ignite",
        price: 80.00,
        weight: 1.4,
        length: 20,
        width: 30,
        height: 32,
    },
    2: {
        name: "Gin Ignite",
        price: 85.00,
        weight: 1.3,
        length: 15,
        width: 23,
        height: 12,
    },
};

// --- FUNÇÃO PARA GERAR LINK DE PAGAMENTO (SIMULAÇÃO) ---
async function gerarLinkCartpanda(items, frete) {
    const valorTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0) + frete;
    console.log("Gerando link de pagamento para o valor total de:", valorTotal.toFixed(2));
    // AQUI ENTRARÁ A LÓGICA REAL DA API DA CARTPANDA
    return `https://pagamento.exemplo.com/checkout?total=${valorTotal.toFixed(2)}`;
}

// 3. Endpoint principal da API
app.post('/calcular-frete-e-pagamento', async (req, res) => {
    const { cart, cepDestino } = req.body;

    if (!cart || !cepDestino || cart.length === 0) {
        return res.status(400).json({ error: 'Dados do carrinho ou CEP ausentes.' });
    }

    const subtotal = cart.reduce((sum, item) => {
        const product = productData[item.id];
        return sum + (product.price * item.quantity);
    }, 0);

    const pesoTotal = cart.reduce((sum, item) => {
        const product = productData[item.id];
        return sum + (product.weight * item.quantity);
    }, 0).toFixed(2);

    const comprimentoTotal = Math.max(...cart.map(item => productData[item.id].length));
    const larguraTotal = Math.max(...cart.map(item => productData[item.id].width));
    const alturaTotal = cart.reduce((sum, item) => sum + (productData[item.id].height * item.quantity), 0);

    const argsCorreios = {
        nCdServico: '04510',
        sCepOrigem: '38400000', // <<< COLOQUE O SEU CEP DE ORIGEM AQUI
        sCepDestino: cepDestino,
        nVlPeso: pesoTotal,
        nCdFormato: 1,
        nVlComprimento: Math.max(20, comprimentoTotal),
        nVlAltura: Math.max(10, alturaTotal),
        nVlLargura: Math.max(20, larguraTotal),
        nVlDiametro: 0,
        sCdMaoPropria: 'N',
        nVlValorDeclarado: subtotal,
        sCdAvisoRecebimento: 'N',
    };

    try {
        const [resultadoFrete] = await correios.calcPreco(argsCorreios);
        
        if (!resultadoFrete || resultadoFrete.Erro !== '0') {
            throw new Error(resultadoFrete.MsgErro || 'Não foi possível calcular o frete.');
        }

        const valorFrete = parseFloat(resultadoFrete.Valor.replace(',', '.'));

        const itensParaPagamento = cart.map(item => ({
            ...productData[item.id],
            quantity: item.quantity
        }));

        const linkPagamento = await gerarLinkCartpanda(itensParaPagamento, valorFrete);

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

// 5. Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
