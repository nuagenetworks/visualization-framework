require('dotenv').config();

const databaseSettings = {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  pool_size: 100,
};

module.exports = databaseSettings;
