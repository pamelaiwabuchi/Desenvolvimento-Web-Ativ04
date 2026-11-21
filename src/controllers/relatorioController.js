const relatorioService = require('../services/relatorioService');
const { tratarErro } = require('../utils/erros');

async function gerarRelatorioSemanal(req, res) {
  try {
    const relatorio = await relatorioService.gerarRelatorioSemanal(req.query.data);
    res.status(200).json(relatorio);
  } catch (erro) {
    tratarErro(res, erro);
  }
}

module.exports = { gerarRelatorioSemanal };
