const { Jogador } = require('../models');
const { criarErro } = require('../utils/erros');

async function cadastrarJogador(dados) {
  // Model.create() -> INSERT no banco (as validações do model rodam aqui)
  return await Jogador.create({
    nome: dados.nome,
    posicao: dados.posicao,
    ativo: dados.ativo,
  });
}

async function listarJogadores(filtros) {
  const where = {};
  if (filtros.posicao) where.posicao = filtros.posicao;
  if (filtros.ativo !== undefined) where.ativo = filtros.ativo === 'true';

  // Model.findAll() -> SELECT com WHERE opcional
  return await Jogador.findAll({ where, order: [['nome', 'ASC']] });
}

async function buscarJogador(id) {
  // Model.findByPk() -> busca pela chave primária
  const jogador = await Jogador.findByPk(id);
  if (!jogador) {
    throw criarErro(404, 'Jogador não encontrado.');
  }
  return jogador;
}

async function atualizarJogador(id, dados) {
  const jogador = await buscarJogador(id);
  // instância.update() -> UPDATE apenas dos campos enviados
  return await jogador.update({
    nome: dados.nome ?? jogador.nome,
    posicao: dados.posicao ?? jogador.posicao,
    ativo: dados.ativo ?? jogador.ativo,
  });
}

async function desativarJogador(id) {
  const jogador = await buscarJogador(id);
  // Não apagamos o jogador: só marcamos ativo = false. Os treinos continuam no banco.
  return await jogador.update({ ativo: false });
}

module.exports = { cadastrarJogador, listarJogadores, buscarJogador, atualizarJogador, desativarJogador };
