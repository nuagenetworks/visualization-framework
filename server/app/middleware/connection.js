import Connection from '../lib/database/database.js';
import {QueryBuilder} from 'node-querybuilder';

const db = QueryBuilder(Connection, 'mysql');

export default db;