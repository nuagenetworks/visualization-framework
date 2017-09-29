import Connection from '../lib/database/database.js';
import {QueryBuilder} from 'node-querybuilder';

export default QueryBuilder(Connection, 'mysql');