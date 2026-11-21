const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Treino = sequelize.define(
    'Treino',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: { msg: 'O código do treino é obrigatório.' },
          notEmpty: { msg: 'O código do treino é obrigatório.' },
        },
      },
      jogadorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dataTreino: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: 'Data do treino inválida.' },
        },
      },
      tipo: {
        // F = Físico, T = Técnico, E = Estratégico
        type: DataTypes.ENUM('F', 'T', 'E'),
        allowNull: false,
        validate: {
          isIn: { args: [['F', 'T', 'E']], msg: 'Tipo inválido. Use F, T ou E.' },
        },
      },
      duracaoMin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'A duração deve ser um número inteiro.' },
          min: { args: [1], msg: 'A duração deve ser maior que zero.' },
        },
      },
      intensidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'A intensidade deve ser um número inteiro.' },
          min: { args: [1], msg: 'A intensidade deve ser de 1 a 10.' },
          max: { args: [10], msg: 'A intensidade deve ser de 1 a 10.' },
        },
      },
      carga: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        // O MySQL devolve DECIMAL como texto; aqui convertemos para número
        get() {
          const valor = this.getDataValue('carga');
          return valor === null ? null : Number(valor);
        },
      },
    },
    {
      tableName: 'treinos',
    }
  );

  return Treino;
};
