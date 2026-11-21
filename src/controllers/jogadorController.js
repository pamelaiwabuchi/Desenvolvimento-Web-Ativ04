const jogadorService = require('../services/jogadorService');
const { tratarErro } = require('../utils/erros');

async function cadastrarJogador(req, res) {
  try {
    const jogador = await jogadorService.cadastrarJogador(req.body);
    res.status(201).json(jogador);
  } catch (erro) {
    tratarErro(res, erro);
  }
}

async function listarJogadores(req, res) {
  try {
    const jogadores = await jogadorService.listarJogadores(req.query);
    res.status(200).json(jogadores);
  } catch (erro) {
    tratarErro(res, erro);
  }
}

async function buscarJogador(req, res) {
  try {
    const jogador = await jogadorService.buscarJogador(req.params.id);
    res.status(200).json(jogador);
  } catch (erro) {
    tratarErro(res, erro);
  }
}

async function atualizarJogador(req, res) {
  try {
    const jogador = await jogadorService.atualizarJogador(req.params.id, req.body);
    res.status(200).json(jogador);
  } catch (erro) {
    tratarErro(res, erro);
  }
}

async function desativarJogador(req, res) {
  try {
    const jogador = await jogadorService.desativarJogador(req.params.id);
    res.status(200).json({ mensagem: 'Jogador desativado. O histórico de treinos foi mantido.', jogador });
  } catch (erro) {
    tratarErro(res, erro);
  }
}

module.exports = { cadastrarJogador, listarJogadores, buscarJogador, atualizarJogador, desativarJogador };
