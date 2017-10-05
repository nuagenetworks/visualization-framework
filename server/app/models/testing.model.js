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
        'PROCESSED': 'processed'
      }
      return statuses[status];
    }

    getReports(callback) {
      DB.select('*')
        .order_by('id', 'desc')
        .where('deleted_at',null)
        .get('t_reports', callback);
    }

    initiate(callback) {
      DB.insert('t_reports', {}, callback);
    }

    getDashboards(callback) {
      DB.select(['d.id as dashboard_id', 'd.name as dashboard_name', 'concat(d.url, IF(ds.datafile IS NOT NULL, concat("?dataset=", ds.datafile), "")) as url', 'ds.id as dataset_id'])
          .from('t_dashboards as d')
          .join('t_dashboard_datasets as ds', 'ds.dashboard_id = d.id and ds.is_active = 1', 'left')
          .where('d.is_active', '1')
          .get(callback);
        //.get_compiled_select();
    }

    updateStatus(data, where, callback) {
      DB.update('t_reports', data, where, callback);
    }

    insertReportDashboard(data, callback) {
      DB.insert('t_report_dashboards', data, callback);
    }

    insertReportDetails(data, callback) {
      DB.insert_batch('t_report_dashboard_widgets', data, callback);
    }

    updateDataSet(chart_id, report_id, report_dashboard_id, callback) {

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
              this.updateChartStatus(status, chart_id, report_id, report_dashboard_id, callback)

        });
    }

    updateChartStatus(status, chart_id, report_id, report_dashboard_id, callback) {
      let query = DB.where('rdw.id', chart_id);

      query.from('t_report_dashboard_widgets rdw')
          .set('status', status)
          .update(null, null, null, (err, data) => {
            
              if (err) return console.error(err);

              DB.where('status',null)
                  .from('t_report_dashboard_widgets rdw')
                  .set('status', 'pass')
                  .update(null, null, null, (err, data) => {
                    
                      if (err) return console.error(err);

                      if (this.updateReportsPassFailCount(report_id, report_dashboard_id)) {
                          callback(null, 'success');
                      }

              });

      });
    }

    updateReportsPassFailCount(report_id, report_dashboard_id) {
      
        const select = ['GROUP_CONCAT( id SEPARATOR  "," ) report_dashboard_id'];
        DB.select(select).from('t_report_dashboards rd')
            .where('rd.report_id', report_id)
            .get((err, response) => {
              let report_dashboard_ids;
              for (let resp in response) {
                  report_dashboard_ids = response[resp].report_dashboard_id.split(',');
              }
              
              const select = ['COUNT(*) total, COUNT(status="pass" or null) pass_count', 'COUNT(status="fail" or null) fail_count'];
              DB.select(select).from('t_report_dashboard_widgets rdw')
                  .where_in('rdw.report_dashboard_id', report_dashboard_ids)
                  .get((err, response) => {
                      let reportData;
                      for (let resp in response) {
                          reportData = {
                              total: response[resp].total,
                              pass: parseInt(response[resp].pass_count),
                              fail: response[resp].fail_count,
                              status: 'completed'
                          };
                      }

                      DB.where('rs.id', report_id)
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
        var CurrentDate = moment().format('YYYY-MM-DD HH:mm:ss');

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
          'rdw.id chart_id', 'rdw.chart_name', 'rdw.status chart_status','rdw.report_dashboard_id report_dashboard_id',
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
                              'datasets': {}
                          }
                      }

                      let dataset_id = widget.dataset_id ? widget.dataset_id : 0;
                      if (typeof results.dashboards[widget.dashboard_id]['datasets'][dataset_id] == 'undefined') {
                          results.dashboards[widget.dashboard_id]['datasets'][dataset_id] = {
                              'dataset_id': dataset_id,
                              'dataset_name': widget.dataset_name,
                              'dataset_description': widget.dataset_description,
                              'errors': widget.dataset_errors,
                              'charts': []
                          }
                      }

                      if(widget.chart_id) {
                        results.dashboards[widget.dashboard_id]['datasets'][dataset_id]['charts'].push(widget);
                      }
                  }
                }

                callback(null, results);
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
