'use strict';

module.exports = {
  async up(queryInterface) {
    const agora = new Date();
    // Limite de 300 pontos: deixa alguns jogadores acima, outros abaixo e um empatado
    await queryInterface.bulkInsert('configuracoes', [
      { id: 1, cargaMaximaSemanal: 300, dataVigencia: new Date('2026-10-01T00:00:00Z'), createdAt: agora, updatedAt: agora },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('configuracoes', null, {});
  },
};
