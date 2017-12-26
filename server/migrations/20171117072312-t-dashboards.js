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
  db.createTable('t_dashboards', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    name: 'string',
    url: 'string',
    is_active: 'smallint',
    deleted_at: 'timestamp',
    created_at: 'timestamp'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('t_dashboards', callback);
};

exports._meta = {
  "version": 1
};
