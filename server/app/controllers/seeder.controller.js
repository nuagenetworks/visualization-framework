import BaseController from './base.controller';
import { successResponse } from '../lib/utils/response';
import dbseeder from '../../seeds/dbseeder.js';

class SeederController extends BaseController {
	seeder(req, res, next) {
		dbseeder.dbseeder(function(err, results) {
			if(err) {
				res.status(500).send({ error: results });
			} else{
				return successResponse(res, 'Completed');
			}
		});
	}
}

export default new SeederController();
