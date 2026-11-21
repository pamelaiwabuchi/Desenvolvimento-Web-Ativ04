const { Op, fn, col } = require('sequelize');
const { Treino, Jogador } = require('../models');
const { obterSemana } = require('../utils/datas');
const { obterLimiteSemanal } = require('./configuracaoService');

// Arredonda para 2 casas decimais (o MySQL devolve SUM/AVG como texto)
function numero(valor) {
  return Math.round(Number(valor) * 100) / 100;
}

async function gerarRelatorioSemanal(dataReferencia) {
  const { inicio, fim } = obterSemana(dataReferencia);
  const limite = await obterLimiteSemanal();

  // Todas as consultas usam o mesmo filtro: treinos entre segunda e domingo
  const where = { dataTreino: { [Op.between]: [inicio, fim] } };

  // As 4 consultas são independentes, então rodam ao mesmo tempo com Promise.all
  const [totalTreinos, cargasPorJogador, mediasPorTipo, dadosPorPosicao] = await Promise.all([
    // Total de treinos da semana -> COUNT
    Treino.count({ where }),

    // Carga semanal e quantidade de treinos por jogador -> SUM + COUNT + GROUP BY + include
    Treino.findAll({
      attributes: [
        'jogadorId',
        [fn('SUM', col('carga')), 'cargaSemanal'],
        [fn('COUNT', col('Treino.id')), 'quantidadeTreinos'],
      ],
      include: [{ model: Jogador, as: 'jogador', attributes: ['nome', 'posicao'] }],
      where,
      group: ['jogadorId', 'jogador.id', 'jogador.nome', 'jogador.posicao'],
      raw: true,
      nest: true,
    }),

    // Carga média por tipo de treino -> AVG + COUNT + GROUP BY tipo
    Treino.findAll({
      attributes: ['tipo', [fn('COUNT', col('id')), 'quantidade'], [fn('AVG', col('carga')), 'cargaMedia']],
      where,
      group: ['tipo'],
      raw: true,
    }),

    // Por posição: total de treinos e carga média por sessão -> GROUP BY na coluna do jogador
    Treino.findAll({
      attributes: [
        [col('jogador.posicao'), 'posicao'],
        [fn('COUNT', col('Treino.id')), 'quantidadeTreinos'],
        [fn('AVG', col('carga')), 'cargaMediaPorSessao'],
      ],
      include: [{ model: Jogador, as: 'jogador', attributes: [] }],
      where,
      group: ['jogador.posicao'],
      raw: true,
    }),
  ]);

  // ---- Por jogador ----
  const porJogador = cargasPorJogador
    .map((linha) => {
      const cargaSemanal = numero(linha.cargaSemanal);
      return {
        jogadorId: linha.jogadorId,
        nome: linha.jogador.nome,
        posicao: linha.jogador.posicao,
        cargaSemanal,
        quantidadeTreinos: Number(linha.quantidadeTreinos),
        // Risco só quando for ESTRITAMENTE maior que o limite (empate não é risco)
        situacao: cargaSemanal > limite ? 'RISCO DE SOBRECARGA' : 'OK',
      };
    })
    .sort((a, b) => b.cargaSemanal - a.cargaSemanal);

  // ---- Maior e menor carga (se houver empate, todos os empatados aparecem) ----
  let maiorCarga = [];
  let menorCarga = [];
  if (porJogador.length > 0) {
    const maior = porJogador[0].cargaSemanal;
    const menor = porJogador[porJogador.length - 1].cargaSemanal;
    maiorCarga = porJogador
      .filter((j) => j.cargaSemanal === maior)
      .map((j) => ({ nome: j.nome, posicao: j.posicao, cargaSemanal: j.cargaSemanal, quantidadeTreinos: j.quantidadeTreinos }));
    menorCarga = porJogador
      .filter((j) => j.cargaSemanal === menor)
      .map((j) => ({ nome: j.nome, posicao: j.posicao, cargaSemanal: j.cargaSemanal }));
  }

  // ---- Jogadores em risco ----
  const emRisco = porJogador.filter((j) => j.situacao === 'RISCO DE SOBRECARGA');

  // ---- Média por tipo (tipos sem treino aparecem com 0) ----
  const mediaPorTipo = {};
  for (const tipo of ['F', 'T', 'E']) {
    const linha = mediasPorTipo.find((l) => l.tipo === tipo);
    mediaPorTipo[tipo] = {
      quantidade: linha ? Number(linha.quantidade) : 0,
      cargaMedia: linha ? numero(linha.cargaMedia) : 0,
    };
  }

  // ---- Por posição (posições sem treino aparecem com 0) ----
  const porPosicao = {};
  for (const posicao of ['G', 'Z', 'M', 'A']) {
    const linha = dadosPorPosicao.find((l) => l.posicao === posicao);
    porPosicao[posicao] = {
      quantidadeTreinos: linha ? Number(linha.quantidadeTreinos) : 0,
      cargaMediaPorSessao: linha ? numero(linha.cargaMediaPorSessao) : 0,
    };
  }

  return {
    semana: {
      inicio: inicio.toISOString().slice(0, 10),
      fim: fim.toISOString().slice(0, 10),
    },
    cargaMaximaSemanal: limite,
    criterio:
      'Os rankings consideram apenas jogadores com pelo menos um treino na semana. ' +
      'Em caso de empate na maior ou menor carga, todos os empatados são listados. ' +
      'Risco de sobrecarga só quando a carga semanal é maior que o limite (empate não é risco).',
    mensagem: totalTreinos === 0 ? 'Nenhum treino registrado nesta semana.' : undefined,
    totalTreinos,
    porJogador,
    maiorCarga,
    menorCarga,
    jogadoresEmRisco: {
      quantidade: emRisco.length,
      jogadores: emRisco.map((j) => j.nome),
    },
    mediaPorTipo,
    porPosicao,
  };
}

module.exports = { gerarRelatorioSemanal };
