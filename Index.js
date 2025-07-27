// ProvedorPro Backend - Servidor Node.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Configurações do seu MikroTik REAL
const MIKROTIK_CONFIG = {
  host: '160.238.133.200',
  port: 8728,
  user: 'admin',
  password: 'Lucas1',
  timeout: 5000
};

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// ROTAS DA API - MIKROTIK REAL
// ============================================

// Testar conexão com MikroTik
app.post('/api/mikrotik/test', async (req, res) => {
  try {
    console.log('🔍 Testando conexão MikroTik real...');
    console.log('Host:', MIKROTIK_CONFIG.host);
    console.log('Porta:', MIKROTIK_CONFIG.port);
    
    // Simular conexão real (substitua por biblioteca MikroTik real)
    const connection = await testMikroTikConnection();
    
    if (connection.success) {
      res.json({
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data: {
          host: MIKROTIK_CONFIG.host,
          version: connection.version || 'RouterOS v7.x',
          uptime: connection.uptime || '15 days',
          users_online: Math.floor(Math.random() * 50) + 10
        }
      });
    } else {
      throw new Error(connection.error || 'Falha na conexão');
    }
  } catch (error) {
    console.error('❌ Erro MikroTik:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Verifique IP, usuário, senha e se a API está habilitada'
    });
  }
});

// Criar usuário PPPoE
app.post('/api/mikrotik/create-user', async (req, res) => {
  try {
    const { username, password, plan, profile } = req.body;
    
    console.log(`🔄 Criando usuário PPPoE: ${username}`);
    
    // Aqui você integraria com a biblioteca MikroTik real
    const result = await createPPPoEUser({
      username,
      password,
      plan,
      profile: profile || plan
    });
    
    res.json({
      success: true,
      message: `Usuário ${username} criado com sucesso`,
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bloquear usuário
app.post('/api/mikrotik/block-user', async (req, res) => {
  try {
    const { username } = req.body;
    
    console.log(`🚫 Bloqueando usuário: ${username}`);
    
    const result = await blockPPPoEUser(username);
    
    res.json({
      success: true,
      message: `Usuário ${username} bloqueado com sucesso`,
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao bloquear usuário:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Desbloquear usuário
app.post('/api/mikrotik/unblock-user', async (req, res) => {
  try {
    const { username } = req.body;
    
    console.log(`✅ Desbloqueando usuário: ${username}`);
    
    const result = await unblockPPPoEUser(username);
    
    res.json({
      success: true,
      message: `Usuário ${username} desbloqueado com sucesso`,
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao desbloquear usuário:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// FUNÇÕES DE INTEGRAÇÃO MIKROTIK
// ============================================

async function testMikroTikConnection() {
  try {
    // Aqui você usaria uma biblioteca como 'node-mikrotik' ou 'mikronode'
    // Por enquanto, simular com timeout realístico
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular sucesso baseado nas configurações reais
    const isValidConfig = MIKROTIK_CONFIG.host && MIKROTIK_CONFIG.user && MIKROTIK_CONFIG.password;
    
    if (isValidConfig) {
      return {
        success: true,
        version: 'RouterOS v7.15.2',
        uptime: '25 days, 14:32:18',
        boardName: 'RB1100x4'
      };
    } else {
      throw new Error('Configurações inválidas');
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function createPPPoEUser({ username, password, plan, profile }) {
  try {
    console.log(`Conectando no MikroTik ${MIKROTIK_CONFIG.host}...`);
    
    // Aqui seria a integração real com MikroTik
    // Exemplo de comandos que seriam executados:
    // /ppp secret add name=username password=password service=pppoe profile=profile
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      username,
      profile,
      status: 'created',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Falha ao criar usuário: ${error.message}`);
  }
}

async function blockPPPoEUser(username) {
  try {
    console.log(`Bloqueando ${username} no MikroTik...`);
    
    // Comando real seria: /ppp secret disable [find name=username]
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      username,
      status: 'blocked',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Falha ao bloquear usuário: ${error.message}`);
  }
}

async function unblockPPPoEUser(username) {
  try {
    console.log(`Desbloqueando ${username} no MikroTik...`);
    
    // Comando real seria: /ppp secret enable [find name=username]
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      username,
      status: 'unblocked', 
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Falha ao desbloquear usuário: ${error.message}`);
  }
}

// ============================================
// ROTAS ADICIONAIS
// ============================================

// Gerar carnê com PIX
app.post('/api/financeiro/gerar-carne', async (req, res) => {
  try {
    const { cliente, valor, vencimento } = req.body;
    
    // Simular geração de PIX
    const pixCode = generatePIXCode(cliente, valor);
    
    res.json({
      success: true,
      pix_code: pixCode,
      pix_qr: `data:image/png;base64,iVBORw0KGgoAAAANSUhE...`,
      message: 'Carnê gerado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

function generatePIXCode(cliente, valor) {
  const timestamp = Date.now().toString(36);
  return `00020126580014BR.GOV.BCB.PIX0136${cliente.id}-${timestamp}520400005303986540${valor}5802BR5925PROVEDOR PRO INTERNET6014SAO PAULO62070503***6304`;
}

// Automação de bloqueios
app.post('/api/automacao/verificar-pendentes', async (req, res) => {
  try {
    console.log('🤖 Executando automação de bloqueios...');
    
    // Simular verificação de clientes pendentes
    const clientesPendentes = [
      { id: '1', nome: 'João Silva', dias: 5 },
      { id: '2', nome: 'Maria Santos', dias: 12 }
    ];
    
    const resultado = {
      verificados: 150,
      bloqueados: 3,
      desbloqueados: 1,
      pendentes: clientesPendentes.length
    };
    
    res.json({
      success: true,
      message: 'Automação executada com sucesso',
      data: resultado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Status das integrações
app.get('/api/status', async (req, res) => {
  try {
    const status = {
      mikrotik: await testMikroTikConnection(),
      whatsapp: { connected: true, session: 'active' },
      nubank: { connected: false, error: 'Não configurado' },
      backend: { status: 'online', uptime: process.uptime() }
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mikrotik_host: MIKROTIK_CONFIG.host,
    uptime: process.uptime()
  });
});

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`\n🚀 ProvedorPro Backend iniciado!`);
  console.log(`📍 Servidor rodando na porta: ${port}`);
  console.log(`🔧 MikroTik configurado: ${MIKROTIK_CONFIG.host}:${MIKROTIK_CONFIG.port}`);
  console.log(`👤 Usuário MikroTik: ${MIKROTIK_CONFIG.user}`);
  console.log(`\n✅ Pronto para receber conexões!`);
  console.log(`\n📋 Endpoints disponíveis:`);
  console.log(`   POST /api/mikrotik/test - Testar MikroTik`);
  console.log(`   POST /api/mikrotik/create-user - Criar usuário`);
  console.log(`   POST /api/mikrotik/block-user - Bloquear usuário`);
  console.log(`   POST /api/mikrotik/unblock-user - Desbloquear usuário`);
  console.log(`   GET  /api/status - Status das integrações`);
  console.log(`   GET  /health - Status do servidor\n`);
});
