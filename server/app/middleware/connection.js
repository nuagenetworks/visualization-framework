import Connection from '../configurations/database.js';
import { QueryBuilder } from 'node-querybuilder';

export default QueryBuilder(Connection, 'mysql');
