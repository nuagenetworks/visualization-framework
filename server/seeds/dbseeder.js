let fs = require('fs');
let DB = require('../app/middleware/connection');
let async = require('async');
let config = require('./seeder-config.js');
let seederData = [];
function dbseeder(cb) {
    async.forEachOf(config, function(value, key, callback) {
        fs.readFile(process.cwd()+'/seeds/seed-files/'+value.file, 'utf8', function(err, data) {
            if (err) return callback(err);
            try {
                let obj = {};
                let insertData = JSON.parse(data);
                obj[value.table] = insertData;
                seederData.push(obj);
            } catch (e) {
                return callback(e);
            }
            callback();
        });
    }, function(err) {
        if (err) return cb(true, 'Error');
        insertData(seederData, function( err, result ) {
            if(err)
                return cb(true, result);
            else
                return cb(null);
        });
    });
}

let insertData = function(seederData, callback) {
    let counter = 0;
    for(let key in seederData) {
        if(seederData.hasOwnProperty(key)) {
            for(let subset in seederData[key]) {
                if(seederData[key].hasOwnProperty(subset)) {
                    DB.insert_batch(subset.toString(), seederData[key][subset], (err, res) => {
                        counter++;
                        if (err) {
                            const data = {
                                message: err.message,
                            };
                            insertLogDetails(data);
                        }
                        let errorMessage = err.message+' Table('+subset.toString()+')';
                        if(counter==seederData.length) {
                            if(err)
                                return callback(true, errorMessage);
                            else
                                return callback(null);
                        }
                    });
                }
            }
        }
    }
};

function insertLogDetails(data) {
    DB.insert('seeder_logs', data, (err, res) => { });
}
exports.dbseeder = dbseeder;
