'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  db.createTable('t_report_dashboards', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    report_id: 'int',
    dashboard_id: 'int',
    dataset_id: 'int',
    errors: { type: 'string', length: 10000 },
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('t_report_dashboards', callback);
};

exports._meta = {
  "version": 1
};
