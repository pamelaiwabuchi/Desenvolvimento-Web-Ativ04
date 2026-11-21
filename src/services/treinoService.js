const { Op } = require('sequelize');
const { Treino, Jogador } = require('../models');
const { calcularCarga } = require('./cargaService');
const { criarErro } = require('../utils/erros');
const { converterData } = require('../utils/datas');

// Validações necessárias ANTES de calcular a carga
function validarTreino(dados) {
  if (!dados.jogadorId) {
    throw criarErro(400, 'O jogadorId é obrigatório.');
  }
  if (!['F', 'T', 'E'].includes(dados.tipo)) {
    throw criarErro(400, 'Tipo inválido. Use F (Físico), T (Técnico) ou E (Estratégico).');
  }
  if (!Number.isInteger(dados.duracaoMin) || dados.duracaoMin <= 0) {
    throw criarErro(400, 'A duração deve ser um número inteiro maior que zero.');
  }
  if (!Number.isInteger(dados.intensidade) || dados.intensidade < 1 || dados.intensidade > 10) {
    throw criarErro(400, 'A intensidade deve ser um número inteiro de 1 a 10.');
  }
}

async function registrarTreino(dados) {
  // 1. Validar os dados
  validarTreino(dados);
  const dataTreino = converterData(dados.dataTreino);

  // 2. O jogador precisa existir e estar ativo
  const jogador = await Jogador.findByPk(dados.jogadorId);
  if (!jogador) {
    throw criarErro(404, 'Jogador não encontrado.');
  }
  if (!jogador.ativo) {
    throw criarErro(400, 'Não é possível registrar treino para um jogador inativo.');
  }

  // 3. O código não pode se repetir
  const existente = await Treino.findOne({ where: { codigo: dados.codigo } });
  if (existente) {
    throw criarErro(409, `Já existe um treino com o código ${dados.codigo}.`);
  }

  // 4. Calcular a carga e salvar
  const carga = calcularCarga(dados.duracaoMin, dados.intensidade, dados.tipo);

  return await Treino.create({
    codigo: dados.codigo,
    jogadorId: jogador.id,
    dataTreino,
    tipo: dados.tipo,
    duracaoMin: dados.duracaoMin,
    intensidade: dados.intensidade,
    carga,
  });
}

// Lista treinos com os dados do jogador (include) e filtros opcionais (where)
async function listarTreinos(filtros) {
  const where = {};
  if (filtros.jogadorId) where.jogadorId = filtros.jogadorId;
  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.dataInicio && filtros.dataFim) {
    const fim = converterData(filtros.dataFim);
    fim.setUTCHours(23, 59, 59, 0); // inclui o dia final inteiro
    where.dataTreino = { [Op.between]: [converterData(filtros.dataInicio), fim] };
  }

  // Filtro por posição: fica no where do jogador incluído
  const whereJogador = {};
  if (filtros.posicao) whereJogador.posicao = filtros.posicao;

  return await Treino.findAll({
    where,
    include: [{ model: Jogador, as: 'jogador', attributes: ['id', 'nome', 'posicao', 'ativo'], where: whereJogador }],
    order: [['dataTreino', 'ASC']],
  });
}

// Busca o jogador já com a lista de treinos dele (associação hasMany)
async function listarTreinosDoJogador(jogadorId) {
  const jogador = await Jogador.findByPk(jogadorId, {
    include: [{ model: Treino, as: 'treinos' }],
    order: [[{ model: Treino, as: 'treinos' }, 'dataTreino', 'ASC']],
  });
  if (!jogador) {
    throw criarErro(404, 'Jogador não encontrado.');
  }
  return jogador;
}

async function excluirTreino(codigo) {
  const treino = await Treino.findOne({ where: { codigo } });
  if (!treino) {
    throw criarErro(404, `Treino com código ${codigo} não encontrado.`);
  }
  // instância.destroy() -> DELETE no banco
  await treino.destroy();
}

module.exports = { registrarTreino, listarTreinos, listarTreinosDoJogador, excluirTreino };
