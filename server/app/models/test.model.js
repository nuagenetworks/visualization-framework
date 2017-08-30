import BaseController from './base.model';
import DB from '../middleware/connection.js';

class TestModel extends BaseController {

	reports(req, res) {
		DB.select('*')
		.get('reports', (err,response) => {
			console.log("Query Ran: " + DB.last_query());
		    if (err) return console.error("Uh oh! Couldn't get results: " + err.msg);
		        res.json({
			      results: response,
			    });
			}
		);
	}

	updateDataSet(req, res) {
		var report_detail_id = req.params.report_detail_id;
		var updateStatus = req.params.status;
		DB.where('rd.id',report_detail_id)
	    .from('report_detail rd')
	    .set('status',updateStatus)
	    .update(null, null, null, (err, data) => {
	        if (err) return console.error(err);
	        this.successResponse(data, res);

	    });
	}

	deleteReports(req, res) {
		var report_id = req.params.report_id;
        DB.delete('reports', {id: report_id}, (err, data) => {
            if (err) return console.error(err);
            this.successResponse('success', res);
        });
	}


	reportsDetail(req, res) {
		var report_id = req.params.report_id;
		console.log(report_id);
		const select = ['GROUP_CONCAT(rd.id) reportDetailId','GROUP_CONCAT(rd.chart_name) chartName','rd.report_id','rd.dashboard_id dashboardsId','rd.dashboard_dataset_id dataSetId', 'dd.datafile', 'dd.name dataset_name', 'dd.description', 'dd.context','d.name dashboardname','d.url dashboardUrl','r.start_time','r.end_time','r.created_at','GROUP_CONCAT(rd.dashboard_id) dashboardIds','GROUP_CONCAT(rd.dashboard_dataset_id) datasetIds','GROUP_CONCAT(dd.datafile) dataFiles','GROUP_CONCAT(dd.name) datasetName','GROUP_CONCAT(dd.description) datasetDesc','GROUP_CONCAT(dd.context) datasetContext',];
		DB.select( select ).from('report_detail rd')
		.join('dashboards d', 'rd.dashboard_id=d.id')
		.join('dashboard_dataset dd', 'rd.dashboard_dataset_id=dd.id')
		.join('reports r', 'r.id=rd.report_id')
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
						var reportDetailIds = [];
						var chartNames = [];
			    	var dataIds = response[resValues].datasetIds.split(',');
			    	for(let d of dataIds) {
			    		dataSetIds.push(d);
			    	}
						var chartName = response[resValues].chartName.split(',');
						for(let cN of chartName) {
							chartNames.push(cN);
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

						var reportDetailId = response[resValues].reportDetailId.split(',');
						for(let dI of reportDetailId) {
							reportDetailIds.push(dI);
						}

			    	for(var finalData in dataIds) {
				    	finalresult.dataset.push({
				    		dashboard_id : response[resValues].dashboardsId,
								report_detail_id : reportDetailIds[finalData],
								chartName : chartNames[finalData],
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
