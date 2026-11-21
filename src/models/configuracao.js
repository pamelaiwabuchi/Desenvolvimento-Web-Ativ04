const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Configuracao = sequelize.define(
    'Configuracao',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cargaMaximaSemanal: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        validate: {
          notNull: { msg: 'A carga máxima semanal é obrigatória.' },
          isDecimal: { msg: 'A carga máxima semanal deve ser um número.' },
          min: { args: [0.01], msg: 'A carga máxima semanal deve ser maior que zero.' },
        },
        get() {
          const valor = this.getDataValue('cargaMaximaSemanal');
          return valor === null ? null : Number(valor);
        },
      },
      dataVigencia: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'configuracoes',
    }
  );

  return Configuracao;
};
