// Cria a conexão do Sequelize com o MySQL e junta todos os models
const { Sequelize } = require('sequelize');
const config = require('../config/database').development;

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const Jogador = require('./jogador')(sequelize);
const Treino = require('./treino')(sequelize);
const Configuracao = require('./configuracao')(sequelize);

// Associações:
// um jogador TEM MUITOS treinos...
Jogador.hasMany(Treino, { foreignKey: 'jogadorId', as: 'treinos' });
// ...e cada treino PERTENCE A um jogador
Treino.belongsTo(Jogador, { foreignKey: 'jogadorId', as: 'jogador' });

module.exports = { sequelize, Jogador, Treino, Configuracao };
