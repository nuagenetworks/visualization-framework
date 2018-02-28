import workerpool from 'workerpool';
import async from 'async';
import model from '../../models/testing.model'
import { crawl } from './crawler'
import moment from 'moment'

function capture(reportID) {
  return new Promise((resolve, reject) => {
    // Updating Status of the Report
    async.series({
      update: function(callback) {
        model.updateStatus({
          status: model.getStatusCode('EXECUTING'),
          started_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        }, {
          id: reportID,
        }, function(err, results) {
          if(err) {
            console.log(err);
            callback(err);
            return;
          }
          callback(null, results);
        });
      },
      dashboards: function(callback) {
        model.getDashboards(function(err, results) {
          callback(null, results);
        });
      },
    }, function(err, results) {
        if(err) {
             // Something went wrong because of "reason"
             // The reason is traditionally an Error object, although
             // this is not required or enforced.
             let reason = new Error('failed');
             reject(reason);

             throw reason;
        } else if (results) {
            async.eachSeries(results.dashboards, function(result, callback) {
                crawl(reportID, result, function(response) {
                    async.waterfall([
                      function(callback) {
                        model.insertReportDashboard({
                          report_id: reportID,
                          dashboard_id: result.dashboard_id,
                          dataset_id: result.dataset_id ? result.dataset_id : null,
                          errors: response.errors ? JSON.stringify(response.errors) : null
                        }, function(err, response) {
                          if(err) {
                            console.log(err);
                          }
                          callback(null, response.insertId)
                        });
                      },
                      function(reportDashboardId, callback) {
                        if(response.widgets && response.widgets.length && reportDashboardId) {
                          let widgets = response.widgets.map(function(widget) {
                            widget.report_dashboard_id = reportDashboardId;
                            widget.report_id = reportID;
                            return widget;
                          });

                         // console.log('+++++++++++widgets++++++++++++', widgets);
                          model.insertReportDetails(widgets, function(err, response) {
                            if(err) {
                              console.log(err);
                            }
                            // console.log('errrrrrrrrrrrrrrrrrrrr');
                            callback(null);
                          });
                        } else {
                          // console.log('else errooooooooooooooo');
                          callback(null);
                        }
                      },
                    ], function(err, result) {
                      // console.log('Next Dataset');
                      callback(null)
                    });
                });
            }, function(err, response) {
              model.updateStatus({
                status: model.getStatusCode('COMPLETED'),
                completed_at: moment().format('YYYY-MM-DD HH:mm:ss'),
              }, {
                id: reportID,
              }, function(err, results) {
                if(err) {
                  reject(err);
                  return;
                }
                resolve(response);
              });
            });
        }
    })
 });
}

// create a worker and register public functions
workerpool.worker({
  capture: capture,
});
