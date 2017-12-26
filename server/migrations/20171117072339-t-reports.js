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
  db.createTable('t_reports', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    started_at: 'timestamp',
    completed_at: 'timestamp',
    total: 'int',
    pass: 'int',
    fail: 'int',
    status: 'string',
    message: 'string',
    deleted_at: 'timestamp',
    created_at: 'timestamp'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('t_reports', callback);
};

exports._meta = {
  "version": 1
};
