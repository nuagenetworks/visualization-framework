import BaseController from '../controllers/base.controller';
import DB from '../middleware/connection.js';

class TestModel extends BaseController {

	reports(req, res) {
		DB.select('*')
		.get('t_reports', (err,response) => {
			console.log("Query Ran: " + DB.last_query());
		    if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
		        res.json({
			      results: response,
			    });
			}
		);
	}

	updateDataSet(req, res) {
		var report_id = req.params.report_id;
		var dashboard_id = req.params.dashboard_id;
		var dashboard_dataset_id = req.params.dashboard_dataset_id;
		var updateStatus = req.params.status;
		DB.where('rd.report_id',report_id)
		.where('rd.dashboard_id',dashboard_id)
		.where('rd.dashboard_dataset_id',dashboard_dataset_id)
	    .from('t_report_detail rd')
	    .set('status',updateStatus)
	    .update(null, null, null, (err, data) => {
	        if (err) return console.error(err);
	        this.successResponse(data, res);

	    });
	}

	deleteReports(req, res) {
		var report_id = req.params.report_id;
        DB.delete('t_reports', {id: report_id}, (err, data) => {
            if (err) return console.error(err);
            this.successResponse('success', res);
        });
	}


	reportsDetail(req, res) {
		var report_id = req.params.report_id;
		console.log(report_id);
		const select = ['rd.report_id','rd.dashboard_id dashboardsId','rd.dashboard_dataset_id dataSetId', 'dd.datafile', 'dd.name dataset_name', 'dd.description', 'dd.context','d.name dashboardname','d.url dashboardUrl','r.start_time','r.end_time','r.created_at','GROUP_CONCAT(rd.dashboard_id) dashboardIds','GROUP_CONCAT(rd.dashboard_dataset_id) datasetIds','GROUP_CONCAT(dd.datafile) dataFiles','GROUP_CONCAT(dd.name) datasetName','GROUP_CONCAT(dd.description) datasetDesc','GROUP_CONCAT(dd.context) datasetContext',];
		DB.select( select ).from('t_report_detail rd')
		.join('t_dashboards d', 'rd.dashboard_id=d.id')
		.join('t_dashboard_dataset dd', 'rd.dashboard_dataset_id=dd.id')
		.join('t_reports r', 'r.id=rd.report_id')
		.group_by(['rd.dashboard_id'])
		.where('rd.report_id',report_id)
		.get((err,response) => {
			console.log("Query Ran: " + DB.last_query());
			//console.log(response);
			    if (err) {
			    	this.errorResponse(err.msg, res);
			    } else if(typeof response !== 'undefined' && response.length==0) {
			    	this.errorResponse('Not Found', res);
			    }
			    var dashboardIds = [];

			    var dataSets = [];
			    var counter = 0;
			    for(let resValues in response) {
			    	counter++;
			    	var finalresult = {
				    	dataset : [],
				    };
				    var dataSetName = [];
				    var dashboardIdSet = [];
				    var dataSetIds = [];
				    var dataAllFiles = [];
				    var dataAllSetDesc = [];
				    var datasetContextAll = [];

			    	var dataIds = response[resValues].datasetIds.split(',');
			    	for(let d of dataIds) {
			    		dataSetIds.push(d);
			    	}
			    	var dataNames = response[resValues].datasetName.split(',');
			    	for(let dN of dataNames) {
			    		dataSetName.push(dN);
			    	}
			    	var dataFiles = response[resValues].dataFiles.split(',');
			    	for(let dF of dataFiles) {
			    		dataAllFiles.push(dF);
			    	}
			    	var datasetDesc = response[resValues].datasetDesc.split(',');
			    	for(let dataDesc of datasetDesc) {
			    		dataAllSetDesc.push(dataDesc);
			    	}
			    	var datasetContext = response[resValues].datasetContext.split(',');
			    	for(let dC of datasetContext) {
			    		datasetContextAll.push(dC);
			    	}

					var dashboardIds = response[resValues].dashboardIds.split(',');
			    	for(let dB of dashboardIds) {
			    		dashboardIdSet.push(dB);
			    	}
			    	for(var finalData in dataIds) {
				    	finalresult.dataset.push({
				    		dashboard_id : response[resValues].dashboardsId,
				    		dataSetId : dataSetIds[finalData],
				    		datafile : dataAllFiles[finalData],
				    		name : dataSetName[finalData],
				    		description : dataAllSetDesc[finalData],
				    		context : datasetContextAll[finalData],
				    	});
				    	finalresult.dashboardname = response[resValues].dashboardname;
				    	finalresult.dashboardId = response[resValues].dashboardsId;
				    	finalresult.report_id = response[resValues].report_id;
				    	if(counter==1) {
					    	finalresult.start_time = response[resValues].start_time;
					    	finalresult.end_time = response[resValues].end_time;
					    	finalresult.created_at = response[resValues].created_at;
					    	finalresult.count = counter;
				    	}
			    	}
			    	dataSets.push(finalresult);
		    	}

			    this.successResponse(dataSets, res);
		        //this.successResponse(response, res);
			}
		);	
	}

	successResponse(response, res) {
		return res.json({
          	status : 200,
          	error : false,
	      	results: response,
		});
	}

	errorResponse(err, res) {
		return res.json({
			status : 404,
			error : true,
			results: 'Data Not Found',
		});
	}

}

export default new TestModel();
