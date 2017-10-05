import BaseController from './base.controller';
import model from '../models/testing.model';
import { successResponse } from '../lib/utils/response'
import { executeReport } from '../lib/selenium/pool'

class TestingController extends BaseController {
	reports(req, res, next) {
		model.getReports(function(err, results) {
			if(err) {
				next(err)
			} else{
				return successResponse(res, results);
			}
		});
	}

	initiate(req, res, next) {
			model.initiate(function(err, results) {
				if(err || !results.insertId) {
					next(err)
				} else {
					executeReport(results.insertId);
					return successResponse(res, 'Job has been successfully added to Queue');
				}
			});
	}

	detail(req, res) {
		let reportID = req.params.report_id;

		if(!reportID) {
			return next(new Error('Report ID is invalid'))
		}

		return model.getDetailReport(reportID, function(err, results, next) {
			if(err) {
				next(err)
			} else{
				return successResponse(res, results);
			}
		});
	}

	updateDataSet(req, res) {
		let {
            chart_id,
            report_id,
            report_dashboard_id
        } = req.body;

		return model.updateDataSet(chart_id, report_id, report_dashboard_id, function(err, results, next) {
			if(err) {
				next(err)
			} else{
				return successResponse(res, results);
			}
		});
	}

	deleteReports(req, res) {
		let reportID = req.params.report_id;
		return model.deleteReports(reportID, function(err, results, next) {
			if(err) {
				next(err)
			} else{
				return successResponse(res, results);
			}
		});
	}


}

export default new TestingController();
