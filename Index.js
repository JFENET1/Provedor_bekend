// =================================================================
//          SERVIDOR BACKEND REAL - ProvedorPro v1.0
// Este é o "cérebro" do seu sistema. Ele deve ser hospedado
// em um serviço como Railway, Vercel ou Hostinger.
// =================================================================

// --- Importações das bibliotecas necessárias ---
const express = require('express'); // Para criar o servidor web
const cors = require('cors'); // Para permitir que nosso painel se conecte
const { RouterOSClient } = require('node-routeros'); // Para conectar no MikroTik
const axios = require('axios'); // Para conectar no Asaas (ou outro gateway)

// --- Inicialização do Servidor ---
const app = express();
app.use(cors()); // Habilita o CORS
app.use(express.json()); // Permite que o servidor entenda JSON

// --- Configurações de "Segredos" (NÃO COLOQUE SENHAS AQUI) ---
// Estes valores devem ser configurados como "Environment Variables" na sua hospedagem
const MIKROTIK_HOST = process.env.MIKROTIK_HOST;
const MIKROTIK_USER = process.env.MIKROTIK_USER;
const MIKROTIK_PASS = process.env.MIKROTIK_PASS;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const PORT = process.env.PORT || 3001;

// --- Função Auxiliar para Conectar no MikroTik ---
async function connectToMikrotik() {
    const client = new RouterOSClient({
        host: MIKROTIK_HOST,
        user: MIKROTIK_USER,
        password: MIKROTIK_PASS,
        port: 8728, // Porta padrão da API
        timeout: 10, // Tempo de espera de 10 segundos
    });
    await client.connect();
    return client;
}

// =================================================================
//                     API - Rotas do Servidor
// =================================================================

// --- Rota de Teste ---
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', message: 'Servidor ProvedorPro está no ar!' });
});


// --- Rota para Testar Conexão com MikroTik ---
app.post('/api/mikrotik/test', async (req, res) => {
    try {
        const client = await connectToMikrotik();
        const identity = await client.write('/system/identity/print');
        await client.close();
        res.json({ status: 'sucesso', message: `Conectado ao MikroTik: ${identity[0].name}` });
    } catch (error) {
        console.error("Erro ao conectar no MikroTik:", error);
        res.status(500).json({ status: 'erro', message: 'Falha ao conectar no MikroTik', details: error.message });
    }
});


// --- Rota para Criar Cliente no MikroTik (Exemplo) ---
app.post('/api/mikrotik/criar-usuario', async (req, res) => {
    const { usuario_pppoe, senha_pppoe, plano, nome_cliente } = req.body;
    
    if (!usuario_pppoe || !senha_pppoe || !plano) {
        return res.status(400).json({ status: 'erro', message: 'Dados insuficientes.' });
    }
    
    try {
        const client = await connectToMikrotik();
        
        // Adiciona o secret
        await client.write('/ppp/secret/add', {
            name: usuario_pppoe,
            password: senha_pppoe,
            service: 'pppoe',
            comment: nome_cliente
        });

        // Adiciona a queue
        const velocidade = plano.replace('MB', 'M');
        await client.write('/queue/simple/add', {
            name: usuario_pppoe,
            target: usuario_pppoe,
            'max-limit': `${velocidade}/${velocidade}`,
            comment: nome_cliente
        });

        await client.close();
        res.json({ status: 'sucesso', message: `Cliente ${usuario_pppoe} criado no MikroTik.` });

    } catch (error) {
        console.error("Erro ao criar usuário no MikroTik:", error);
        res.status(500).json({ status: 'erro', message: 'Falha ao criar usuário.', details: error.message });
    }
});

// --- Rota para Gerar Cobrança no Asaas (Exemplo) ---
app.post('/api/financeiro/gerar-cobranca', async (req, res) => {
    const { customerId, valor, dataVencimento } = req.body;
    
    try {
        const response = await axios.post('https://api.asaas.com/v3/payments', {
            customer: customerId,
            billingType: 'PIX', // ou 'BOLETO'
            value: valor,
            dueDate: dataVencimento,
        }, {
            headers: { 'access_token': ASAAS_API_KEY }
        });

        res.json({ status: 'sucesso', data: response.data });
    } catch (error) {
        console.error("Erro ao gerar cobrança no Asaas:", error.response.data);
        res.status(500).json({ status: 'erro', message: 'Falha ao gerar cobrança.', details: error.response.data });
    }
});


// --- Inicia o Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor ProvedorPro rodando na porta ${PORT}`);
});
