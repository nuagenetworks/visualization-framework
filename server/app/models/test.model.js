import BaseModel from './base.model';
import DB from '../middleware/connection.js';

class TestModel extends BaseModel {

    reports(req, res) {
        DB.select('*')
            .get('reports', (err, response) => {
                if (err)
                    return console.error("Oops! Something went wrong: " + err.msg);
                res.json({
                    results: response,
                });
            });
    }

    updateDataSet(req, res) {
        let {
            report_detail_ids,
            report_id,
            dashboard_id
        } = req.body;

        let status = "pass";

        let query = DB.where('rd.dashboard_id', dashboard_id)

        if (report_detail_ids.length) {
            query = query.where_in('rd.id', report_detail_ids);
            status = "fail";
        }

        query.from('report_detail rd')
            .set('status', status)
            .update(null, null, null, (err, data) => {

                if (err) return console.error(err);

                if (report_detail_ids.length) {
                    DB.where_not_in('rd.id', report_detail_ids)
                        .from('report_detail rd')
                        .set('status', 'pass')
                        .update(null, null, null, (err, data) => {
                            if (err) return console.error(err);

                        });
                }
                if (this.updateReportsPassFailCount(report_id)) {
                    this.successResponse('success', res);
                }

            });
    }

    updateReportsPassFailCount(report_id) {

        const select = ['COUNT(*) total, COUNT(status="pass" or null) pass_count', 'COUNT(status="fail" or null) fail_count'];
        DB.select(select).from('report_detail rd')
            .where('rd.report_id', report_id)
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
                    .from('reports rs')
                    .set(reportData)
                    .update(null, null, null, (err, data) => {
                        if (err) return false;

                        return true;
                    });
            });
        return true;
    }

    deleteReports(req, res) {
        const report_id = req.params.report_id;
        DB.delete('reports', {
            id: report_id
        }, (err, data) => {
            if (err) return console.error(err);
            DB.delete('report_detail', {
                report_id: report_id
            }, (err, data) => {
                if (err) return console.error(err);
                this.successResponse('success', res);
            });
        });
    }


    reportsDetail(req, res) {
        const report_id = req.params.report_id;
        const select = ['rd.id reportDetailId', 'rd.chart_name chartName', 'rd.report_id', 'rd.dashboard_id dashboardsId', 'rd.dashboard_dataset_id dataSetId', 'dd.datafile', 'dd.name dataset_name', 'dd.description', 'dd.context', 'd.name dashboardname', 'd.url dashboardUrl', 'r.start_time', 'r.end_time', 'r.created_at', 'rd.status'];
        DB.select(select).from('report_detail rd')
            .join('dashboards d', 'rd.dashboard_id=d.id')
            .join('dashboard_dataset dd', 'rd.dashboard_dataset_id=dd.id')
            .join('reports r', 'r.id=rd.report_id')
            .order_by('rd.dashboard_dataset_id')
            .where('rd.report_id', report_id)
            .get((err, response) => {

                let dashboard = {},
                    datasets = [],
                    start_time,
                    end_time;

                for (let resp of response) {
                    if (typeof dashboard[resp.dashboardsId] == 'undefined') {
                        start_time = resp.start_time;
                        end_time = resp.end_time;
                        dashboard[resp.dashboardsId] = {
                            'dashboard_id': resp.dashboardsId,
                            'dashboard_name': resp.dashboardname,
                            'start_time': resp.start_time,
                            'end_time': resp.end_time,
                            'report_id': resp.report_id,
                            'datasets': {}
                        }
                    }

                    if (typeof dashboard[resp.dashboardsId]['datasets'][resp.dataSetId] == 'undefined') {
                        dashboard[resp.dashboardsId]['datasets'][resp.dataSetId] = {
                            'data_set_id': resp.dataSetId,
                            'data_set_name': resp.dataset_name,
                            'charts': []
                        }
                    }

                    dashboard[resp.dashboardsId]['datasets'][resp.dataSetId]['charts'].push(resp);
                }

                return res.json({
                    status: 200,
                    error: false,
                    results: {
                        data: dashboard,
                        start_time: start_time,
                        end_time: end_time
                    }
                });
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

export default new TestModel();