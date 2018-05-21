import workerpool from 'workerpool'

let pool = workerpool.pool(__dirname + '/worker.js',
{
	maxWorkers: 1
});

export const executeReport = function (reportId) {
  pool.exec('capture', [reportId])
      .then(function (result) {
        console.log('Result: ' + result);
      })
      .catch(function (err) {
        console.error(err);
      })
      .then(function () {
        pool.terminate();
      });
};
