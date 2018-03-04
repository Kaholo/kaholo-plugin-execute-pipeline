const request = require("request");
const env = require('../../../core/src/environment/environment');

function executeMap(action) {
    return new Promise((resolve, reject) => {
        let executionUrl = `${env.server_url}/api/maps/${action.params.MAP}/execute/`;
        if (action.params.VERSION) {
            executionUrl += action.params.VERSION;
        } if (action.params.CONFIG) {
            executionUrl += `?config=${action.params.CONFIG}`;
        }
        request.get(executionUrl, function(error, response, body) {
            if (error || response.statusCode !== 200) {
                return reject(error);
            }
            console.log("You can view the results of the map by entering");
            console.log(`${env.server_url}/maps/${action.params.MAP}/results`);
            return resolve(body);
        });
    });
}


function main(argv) {
    if (argv.length < 3) {
        console.log('{err: "not enough parameters"}');
        // Invalid Argument
        // Either an unknown option was specified, or an option requiring a value was provided without a value.
        process.exit(9);
    }
    const action = JSON.parse(argv[2]);
    executeMap(action).then(function(res) {
        console.log(res);
        process.exit(0); // Success
    }, function(err) {
        console.log("an error occured", err);
        // Uncaught Fatal Exception
        // There was an uncaught exception, and it was not handled by a domain or an 'uncaughtException' event handler.
        process.exit(1); // Failure
    });
}

main(process.argv);