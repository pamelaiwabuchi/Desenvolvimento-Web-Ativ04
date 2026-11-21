require('dotenv').config({ quiet: true });
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    // Testa a conexão com o MySQL antes de subir o servidor
    await sequelize.authenticate();
    console.log('Conectado ao MySQL.');

    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`);
      console.log(`Swagger em http://localhost:${PORT}/docs`);
    });
  } catch (erro) {
    // Mostra só a mensagem, sem imprimir senha ou configuração
    console.error('Não foi possível conectar ao banco de dados:', erro.message);
    process.exit(1);
  }
}

iniciar();
