import BaseController from './base.controller';
import TestingModel from '../models/test.model';


class TestController extends BaseController {
	reports(req, res) {
		return TestingModel.reports(req, res);
	}

	reportsDetail(req, res) {
		return TestingModel.reportsDetail(req, res);	
	}

	updateDataSet(req, res) {
		return TestingModel.updateDataSet(req, res);	
	}

	deleteReports(req, res) {
		return TestingModel.deleteReports(req, res);	
	}
}

export default new TestController();
