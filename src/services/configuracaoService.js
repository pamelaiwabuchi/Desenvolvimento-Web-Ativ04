const { Configuracao } = require('../models');
const { criarErro } = require('../utils/erros');
const { converterData } = require('../utils/datas');

// O sistema usa uma única configuração (a linha mais recente da tabela)
async function consultarConfiguracao() {
  return await Configuracao.findOne({ order: [['id', 'DESC']] });
}

// Atualiza a configuração se ela existir; senão, cria. Devolve também se foi criada.
async function salvarConfiguracao(dados) {
  if (dados.cargaMaximaSemanal === undefined) {
    throw criarErro(400, 'A carga máxima semanal é obrigatória.');
  }

  const dadosParaSalvar = { cargaMaximaSemanal: dados.cargaMaximaSemanal };
  if (dados.dataVigencia) {
    dadosParaSalvar.dataVigencia = converterData(dados.dataVigencia);
  }

  const atual = await consultarConfiguracao();
  if (atual) {
    return { configuracao: await atual.update(dadosParaSalvar), criada: false };
  }
  return { configuracao: await Configuracao.create(dadosParaSalvar), criada: true };
}

// Usada pelo relatório: devolve só o número do limite
async function obterLimiteSemanal() {
  const configuracao = await consultarConfiguracao();
  if (!configuracao) {
    throw criarErro(404, 'Limite semanal não configurado. Use PUT /configuracao antes.');
  }
  return configuracao.cargaMaximaSemanal;
}

module.exports = { consultarConfiguracao, salvarConfiguracao, obterLimiteSemanal };
