const configuracaoService = require('../services/configuracaoService');
const { tratarErro } = require('../utils/erros');

async function consultarConfiguracao(req, res) {
  try {
    const configuracao = await configuracaoService.consultarConfiguracao();
    if (!configuracao) {
      return res.status(404).json({ erro: 'Nenhuma configuração cadastrada.' });
    }
    res.status(200).json(configuracao);
  } catch (erro) {
    tratarErro(res, erro);
  }
}

async function salvarConfiguracao(req, res) {
  try {
    const { configuracao, criada } = await configuracaoService.salvarConfiguracao(req.body);
    // 201 quando cria pela primeira vez, 200 quando atualiza
    res.status(criada ? 201 : 200).json(configuracao);
  } catch (erro) {
    tratarErro(res, erro);
  }
}

module.exports = { consultarConfiguracao, salvarConfiguracao };
