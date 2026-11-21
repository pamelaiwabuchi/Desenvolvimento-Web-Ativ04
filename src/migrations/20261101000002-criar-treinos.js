'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('treinos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      codigo: { type: Sequelize.STRING, allowNull: false, unique: true },
      jogadorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // Chave estrangeira: liga o treino ao jogador
        references: { model: 'jogadores', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // não deixa apagar um jogador que tem treinos (preserva o histórico)
      },
      dataTreino: { type: Sequelize.DATE, allowNull: false },
      tipo: { type: Sequelize.ENUM('F', 'T', 'E'), allowNull: false },
      duracaoMin: { type: Sequelize.INTEGER, allowNull: false },
      intensidade: { type: Sequelize.INTEGER, allowNull: false },
      carga: { type: Sequelize.DECIMAL(8, 2), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('treinos');
  },
};
