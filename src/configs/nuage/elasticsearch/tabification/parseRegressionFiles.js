export default function parseRegressionFiles(path_to_file) {
    console.log(path_to_file);
    var fs = require('fs');
    var lines = fs.readFileSync(path_to_file).toString().split("\n");
    var output = {};
    let suites, tests, build;
    for (var line of lines){
        if (line && !line.startsWith("#")){
            var line_split = line.split(",");
            build = line_split[2];
            if (!(build in output)){
                output[build] = {"testsuites":[],"testcases":[]};
            }
            var args = line_split[line_split.length-1];
            var args_split = args.split("-");
            for (var arg of args_split) {
                if (arg.startsWith("runSuite")) {
                    suites = arg.split(" ").slice(1);
                    suites.forEach(suite => {
                        if (suite) {
                            output[build]["testsuites"].push(suite);
                        }
                    });
                }
                else if (arg.startsWith("runTest")) {
                    tests = arg.split(" ").slice(1);
                    tests.forEach(test => {
                        if (test) {
                            output[build]["testcases"].push(test);
                        }
                    });
                }
            }
        }
    }
    return output;
}