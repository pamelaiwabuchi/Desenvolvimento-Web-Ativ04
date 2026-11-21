const { ValidationError, UniqueConstraintError } = require('sequelize');

// Cria um erro com o código HTTP que queremos devolver (400, 404, 409...)
function criarErro(status, mensagem) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

// Transforma qualquer erro em uma resposta JSON com o status HTTP correto.
// Erros inesperados viram 500 com uma mensagem genérica, sem mostrar detalhes do banco.
function tratarErro(res, erro) {
  if (erro.status) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  // Código repetido (campo UNIQUE)
  if (erro instanceof UniqueConstraintError) {
    return res.status(409).json({ erro: 'Já existe um registro com esse valor único.' });
  }

  // Validações definidas nos models (validate: {...})
  if (erro instanceof ValidationError) {
    return res.status(400).json({ erro: erro.errors.map((e) => e.message).join(' ') });
  }

  console.error(erro); // o detalhe fica só no terminal do servidor
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = { criarErro, tratarErro };
