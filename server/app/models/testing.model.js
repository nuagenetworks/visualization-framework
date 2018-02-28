import BaseModel from './base.model';
import DB from '../middleware/connection.js';
import moment from 'moment';
import async from 'async';

class TestingModel extends BaseModel {

    getStatusCode(status) {
      let statuses = {
        'PENDING': 'pending',
        'COMPLETED': 'completed',
        'QUEUE': 'queue',
        'EXECUTING': 'executing',
        'PROCESSED': 'processed',
      };
      return statuses[status];
    }

    getReports(pageId, searchString, sortBy, limit, callback) {

      let startFrom = 0;
      if(typeof pageId !== 'undefined') {
        startFrom = parseInt(pageId-1) * limit;
      }
      DB.order_by(sortBy.column, sortBy.order);
      if(typeof searchString !== 'undefined') {
        DB.like('status', searchString);
      }

      DB.limit(limit, startFrom)
      .select('*')
      .where('deleted_at', null)
      .get('t_reports', function(err, response) {
        this.countReports( searchString, sortBy, function(err, resp) {
          let result = JSON.stringify(response);
          let parseResult = JSON.parse(result);
          let finalRes = [];
          for(let par of parseResult) {
            par.totalRecords = resp;
            finalRes.push(par);
          }
          callback(null, finalRes);
        });
      }.bind(this));
    }

    countReports(searchString, sortBy, callb) {
        const select = ['COUNT(*) totalReports'];
        DB.order_by(sortBy.column, sortBy.order);
        if(typeof searchString !== 'undefined') {
          DB.like('status', searchString);
        }
        DB.select(select).from('t_reports')
        .where('deleted_at', null)
        .get((err, response) => {
          let countReports=0;
          for (let resp in response) {
            if (response.hasOwnProperty(resp)) {
                countReports = response[resp].totalReports;
            }
          }
          callb(null, countReports);
        });
    }

    initiate(callback) {
      DB.insert('t_reports', {}, callback);
    }

    getDashboards(callback) {
      DB.select(['d.id as dashboard_id', 'd.name as dashboard_name', 'd.settings as settings', 'd.url as url', 'ds.id as dataset_id', 'ds.datafile as datafile'])
          .from('t_dashboards as d')
          .join('t_dashboard_datasets as ds', 'ds.dashboard_id = d.id and ds.is_active = 1', 'left')
          .where('d.is_active', '1')
          .get(callback);
    }

    updateStatus(data, where, callback) {
      DB.update('t_reports', data, where, callback);
    }

    insertReportDashboard(data, callback) {
      DB.insert('t_report_dashboards', data, callback);
    }

    insertReportDetails(data, callback) {
        let reportId;
        data.forEach(function(v, i) {
            if(i==0) {
                reportId = v.report_id;
            }
            delete v.report_id;
        });
        DB.insert_batch('t_report_dashboard_widgets', data, function(err, response) {
          async.every(data, function(result, callbackNew) {
                const select = ['GROUP_CONCAT( id SEPARATOR  "," ) report_dashboard_id'];
                DB.select(select).from('t_report_dashboards rd')
                    .where('rd.report_id', reportId)
                    .get((err, response) => {
                      let reportDashboardIds;
                      for (let resp in response) {
                        if (response.hasOwnProperty(resp)) {
                            reportDashboardIds = response[resp].report_dashboard_id.split(',');
                        }
                      }
                      const select = ['COUNT(*) total, COUNT(status="pass" or null) pass_count', 'COUNT(status="fail" or null) fail_count'];
                      DB.select(select).from('t_report_dashboard_widgets rdw')
                          .where_in('rdw.report_dashboard_id', reportDashboardIds)
                          .get((err, response) => {
                              let reportData;
                              for (let resp in response) {
                                if (response.hasOwnProperty(resp)) {
                                    reportData = {
                                        total: response[resp].total,
                                        pass: parseInt(response[resp].pass_count),
                                        fail: response[resp].fail_count,
                                    };
                                }
                              }
        
                              DB.where('rs.id', reportId)
                                  .from('t_reports rs')
                                  .set(reportData)
                                  .update(null, null, null, (err, data) => {
                                      if (err) return false;

                                      callbackNew(null, true);
                              });
                          });
                  });
          }, function(error, result) {
              if(result) {
                callback(null, 'success');
              }
          });

        
      });
    }

    updateDataSet(chartId, reportId, reportDashboardId, callback) {
        let status;

        const select = ['status'];
        DB.select(select).from('t_report_dashboard_widgets rdw')
            .where('rdw.id', chart_id)
            .get((err, response) => {
              for (let resp in response) {
                  status = response[resp].status;
              }
              if(status === 'fail') {
                 status = 'pass';
              }
              else if(status==='pass') {
                status = 'fail';
              } 
              else if(!status) {
                status = 'fail';
              }
              this.updateChartStatus(status, chartId, reportId, reportDashboardId, callback)
        });
    }

    updateChartStatus(status, chartId, reportId, reportDashboardId, callback) {
      let query = DB.where('rdw.id', chartId);

      query.from('t_report_dashboard_widgets rdw')
          .set('status', status)
          .update(null, null, null, (err, data) => {
              if (err) return console.error(err);

              DB.where('status',null)
                  .from('t_report_dashboard_widgets rdw')
                  .set('status', 'pass')
                  .update(null, null, null, (err, data) => {
                      if (err) return console.error(err);

                      if (this.updateReportsPassFailCount(reportId, reportDashboardId)) {
                          callback(null, 'success');
                      }

              });

      });
    }

    updateReportsPassFailCount(reportId, reportDashboardId) {
      
        const select = ['GROUP_CONCAT( id SEPARATOR  "," ) report_dashboard_id'];
        DB.select(select).from('t_report_dashboards rd')
            .where('rd.report_id', reportId)
            .get((err, response) => {
              let reportDashboardIds;
              for (let resp in response) {
                reportDashboardIds = response[resp].reportDashboardId.split(',');
              }
              const select = ['COUNT(*) total, COUNT(status="pass" or null) pass_count', 'COUNT(status="fail" or null) fail_count'];
              DB.select(select).from('t_report_dashboard_widgets rdw')
                  .where_in('rdw.report_dashboard_id', reportDashboardIds)
                  .get((err, response) => {
                      let reportData;
                      for (let resp in response) {
                          reportData = {
                              total: response[resp].total,
                              pass: parseInt(response[resp].pass_count),
                              fail: response[resp].fail_count,
                          };
                      }

                      DB.where('rs.id', reportId)
                          .from('t_reports rs')
                          .set(reportData)
                          .update(null, null, null, (err, data) => {
                              if (err) return false;

                              return true;
                      });
                  });
      });


        return true;
    }

    deleteReports(reportID, callback) {
        let CurrentDate = moment().format('YYYY-MM-DD HH:mm:ss');

        DB.where('rs.id', reportID)
            .from('t_reports rs')
            .set('deleted_at',CurrentDate)
            .update(null, null, null, (err, data) => {
                if (err) return callback(err);

                return callback(null, 'success');
        });
    }


    getDetailReport(reportID, callback) {
        const select = [
          'r.created_at', 'r.started_at', 'r.completed_at', 'r.id report_id', 'r.total', 'r.pass', 'r.fail', 'r.message', 'r.status',
          'rdw.id chart_id', 'rdw.chart_name', 'rdw.type as graph_type', 'rdw.status chart_status','rdw.report_dashboard_id report_dashboard_id',
          'rd.errors as dataset_errors',
          'dd.id dataset_id, dd.datafile dataset_file', 'dd.name dataset_name', 'dd.description dataset_description',
          'd.id dashboard_id', 'd.name dashboard_name', 'd.url dashboard_url'];

        DB.select(select).from('t_reports r')
            .join('t_report_dashboards rd', `r.id = rd.report_id and r.id = ${reportID}`)
            .join('t_dashboards d', 'rd.dashboard_id = d.id')
            .join('t_report_dashboard_widgets rdw', 'rdw.report_dashboard_id = rd.id', 'left')
            .join('t_dashboard_datasets dd', 'dd.id = rd.dataset_id', 'left')
            .order_by('rd.id')
            .get((err, response) => {
              if(err)
                console.log(err);

                let results = {
                  dashboards: {}
                };

                if(response && response.length) {
                  results = Object.assign({}, results, {
                    created_at: response[0].created_at ? moment(response[0].created_at).format('MM-DD-YYYY HH:mm:ss') : '',
                    started_at: response[0].started_at ? moment(response[0].started_at).format('MM-DD-YYYY HH:mm:ss'): '',
                    completed_at: response[0].completed_at ? moment(response[0].completed_at).format('MM-DD-YYYY HH:mm:ss') : '',
                    total: response[0].total,
                    pass: response[0].pass,
                    fail: response[0].fail,
                    status: response[0].status
                  });

                  for (let widget of response) {
                      if (typeof results.dashboards[widget.dashboard_id] == 'undefined') {
                          results.dashboards[widget.dashboard_id] = {
                              'dashboard_id': widget.dashboard_id,
                              'dashboard_name': widget.dashboard_name,
                              'datasets': {},
                          };
                      }

                      let dataset_id = widget.dataset_id ? widget.dataset_id : 0;
                      if (typeof results.dashboards[widget.dashboard_id]['datasets'][dataset_id] == 'undefined') {
                          results.dashboards[widget.dashboard_id]['datasets'][dataset_id] = {
                              'dataset_id': dataset_id,
                              'dataset_name': widget.dataset_name,
                              'dataset_file': widget.dataset_file,
                              'dataset_description': widget.dataset_description,
                              'errors': widget.dataset_errors,
                              'charts': [],
                          };
                      }

                      if(widget.chart_id) {
                        results.dashboards[widget.dashboard_id]['datasets'][dataset_id]['charts'].push(widget);
                      }
                  }
                }

                callback(null, results);
            });
    }

    getDashboardId(dashboardId, callback) {
        let url = 'http://localhost:3000/dashboards/'+dashboardId;
        DB.select('*').from('t_dashboards')
        .where('url', url)
        .get((err, response) => {
          callback(null, JSON.stringify(response));
        });
    }

    successResponse(response, res) {
        return res.json({
            status: 200,
            error: false,
            results: response,
        });
    }

    errorResponse(err, res) {
        return res.json({
            status: 404,
            error: true,
            results: 'Data Not Found',
        });
    }

}

export default new TestingModel();
