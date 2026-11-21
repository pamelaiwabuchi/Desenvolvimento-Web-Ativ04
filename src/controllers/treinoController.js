const treinoService = require('../services/treinoService');
const { tratarErro } = require('../utils/erros');

async function registrarTreino(req, res) {
  try {
    const treino = await treinoService.registrarTreino(req.body);
    res.status(201).json(treino);
  } catch (erro) {
    tratarErro(res, erro);
  }
}

async function listarTreinos(req, res) {
  try {
    const treinos = await treinoService.listarTreinos(req.query);
    res.status(200).json(treinos);
  } catch (erro) {
    tratarErro(res, erro);
  }
}

async function listarTreinosDoJogador(req, res) {
  try {
    const jogador = await treinoService.listarTreinosDoJogador(req.params.id);
    res.status(200).json(jogador);
  } catch (erro) {
    tratarErro(res, erro);
  }
}

async function excluirTreino(req, res) {
  try {
    await treinoService.excluirTreino(req.params.codigo);
    res.status(200).json({ mensagem: `Treino ${req.params.codigo} excluído.` });
  } catch (erro) {
    tratarErro(res, erro);
  }
}

module.exports = { registrarTreino, listarTreinos, listarTreinosDoJogador, excluirTreino };
