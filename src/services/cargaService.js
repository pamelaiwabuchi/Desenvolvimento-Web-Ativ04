// Regra de negócio da carga de treino, em uma função reutilizável

const MULTIPLICADORES = {
  F: 1.5, // Físico
  T: 1.2, // Técnico
  E: 1.0, // Estratégico
};

// Carga = (duração em minutos / 10) x intensidade x multiplicador do tipo
function calcularCarga(duracaoMin, intensidade, tipo) {
  const carga = (duracaoMin / 10) * intensidade * MULTIPLICADORES[tipo];
  return Math.round(carga * 100) / 100; // arredonda para 2 casas decimais
}

module.exports = { calcularCarga, MULTIPLICADORES };
