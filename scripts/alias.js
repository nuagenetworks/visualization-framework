var fs = require('fs');
var join = require('path').join;
var baseURL = join(__dirname, '..');
var srcURL = join(baseURL, 'src');
var nodeModules = join(srcURL, 'node_modules');
var alias = join(nodeModules, '@');

if (!fs.existsSync(nodeModules)) {
    fs.mkdirSync(nodeModules);
}

if (!fs.existsSync(alias)) {
    fs.symlinkSync('..', alias);
}