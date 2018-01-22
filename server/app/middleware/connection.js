let databaseSettings = require('../configurations/database.js');
const DB = require('node-querybuilder').QueryBuilder(databaseSettings, 'mysql');

module.exports = DB;
