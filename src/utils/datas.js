const { criarErro } = require('./erros');

// Converte o texto recebido na requisição em Date.
// Aceita "2026-10-05" ou "2026-10-05T08:00:00". As datas são tratadas em UTC.
function converterData(texto) {
  if (!texto) {
    throw criarErro(400, 'A data é obrigatória. Use o formato AAAA-MM-DD.');
  }

  let valor = String(texto);
  if (valor.length === 10) valor += 'T00:00:00'; // só a data -> meia-noite
  if (!valor.endsWith('Z')) valor += 'Z'; // sem fuso -> UTC

  const data = new Date(valor);
  if (isNaN(data.getTime())) {
    throw criarErro(400, `Data inválida: "${texto}". Use o formato AAAA-MM-DD.`);
  }
  return data;
}

// Recebe qualquer dia e devolve o início (segunda 00:00:00) e o fim (domingo 23:59:59) da semana
function obterSemana(texto) {
  const data = converterData(texto);
  const diaDaSemana = data.getUTCDay(); // 0 = domingo, 1 = segunda, ... 6 = sábado
  const diasDesdeSegunda = (diaDaSemana + 6) % 7;

  const inicio = new Date(data);
  inicio.setUTCDate(data.getUTCDate() - diasDesdeSegunda);
  inicio.setUTCHours(0, 0, 0, 0);

  const fim = new Date(inicio);
  fim.setUTCDate(inicio.getUTCDate() + 6);
  fim.setUTCHours(23, 59, 59, 0);

  return { inicio, fim };
}

module.exports = { converterData, obterSemana };
