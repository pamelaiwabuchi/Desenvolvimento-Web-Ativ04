'use strict';

module.exports = {
  async up(queryInterface) {
    const agora = new Date();
    await queryInterface.bulkInsert('jogadores', [
      { id: 1, nome: 'Carlos Silva', posicao: 'G', ativo: true, createdAt: agora, updatedAt: agora },
      { id: 2, nome: 'Rafael Souza', posicao: 'Z', ativo: true, createdAt: agora, updatedAt: agora },
      { id: 3, nome: 'Bruno Lima', posicao: 'Z', ativo: true, createdAt: agora, updatedAt: agora },
      { id: 4, nome: 'Diego Alves', posicao: 'M', ativo: true, createdAt: agora, updatedAt: agora },
      { id: 5, nome: 'Lucas Pereira', posicao: 'M', ativo: true, createdAt: agora, updatedAt: agora },
      { id: 6, nome: 'Mateus Rocha', posicao: 'A', ativo: true, createdAt: agora, updatedAt: agora },
      { id: 7, nome: 'Felipe Costa', posicao: 'A', ativo: true, createdAt: agora, updatedAt: agora },
      // Jogador inativo: usado para testar o bloqueio de novos treinos.
      // Os treinos antigos dele continuam salvos (histórico preservado).
      { id: 8, nome: 'João Mendes', posicao: 'G', ativo: false, createdAt: agora, updatedAt: agora },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('jogadores', null, {});
  },
};
