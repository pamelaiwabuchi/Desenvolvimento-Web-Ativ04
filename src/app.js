const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocumento = require('./docs/swagger');

const app = express();

app.use(express.json());

// Documentação e testes da API: http://localhost:3000/docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocumento));

app.use('/jogadores', require('./routes/jogadorRoutes'));
app.use('/configuracao', require('./routes/configuracaoRoutes'));
app.use('/treinos', require('./routes/treinoRoutes'));
app.use('/relatorios', require('./routes/relatorioRoutes'));

// Rota que não existe -> 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// JSON mal formatado no corpo da requisição -> 400
app.use((erro, req, res, next) => {
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = app;
