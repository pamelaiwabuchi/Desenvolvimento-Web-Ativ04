// Configuração do banco. Os dados vêm do arquivo .env (nada de senha no código!)
require('dotenv').config({ quiet: true });

const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  timezone: '+00:00', // datas gravadas em UTC
  logging: false, // troque para console.log se quiser ver o SQL gerado pelo Sequelize
};

// O Sequelize CLI procura a configuração pelo nome do ambiente
module.exports = {
  development: config,
  test: config,
  production: config,
};
