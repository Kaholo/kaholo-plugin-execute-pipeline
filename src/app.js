const request = require("request");

function executeMap(action, settings) {
  const serverUrl = getServerUrl();
  return new Promise((resolve, reject) => {
    const executionUrl = `${serverUrl}/api/maps/${action.params.MAP}/execute/`;
    
    const body = {
      trigger: action.params.TRIGGER || "Started by map-executer plugin",
    }

    if (action.params.AGENTS) {
      if (typeof action.params.AGENTS == "string") {
        body.agents = action.params.AGENTS.split(",").map((agent) => agent.trim());
      } else if (Array.isArray(action.params.AGENTS)) {
        body.agents = action.params.AGENTS;
      } else {
        return reject(
          "Agents parameter must be either an Array or comma seperated list"
        );
      }
    }

    if(action.params.CONFIG){
      body.config = action.params.CONFIG
    }

    request.post(
      executionUrl,
      {
        body: body,
        headers: {
          authorization: settings.TOKEN,
        },
        json: true,
      },
      function (error, response, body) {
        if (error || response.statusCode !== 200) {
          return reject(body || error);
        }
        console.log("You can view the results of the map by entering");
        console.log(`/maps/${action.params.MAP}/results`);
        return resolve(body);
      }
    );
  });
}

/**
 * In order to be able to support multiple agent versions (<1.3.0, >=1.3.0)
 */
function getServerUrl() {
  let server_url;
  try {
    const env = require("../../../core/src/environment/environment");
    server_url = env.server_url;
  } catch (err) {
    server_url = process.env.SERVER_URL;
  }

  if (server_url) return server_url;
  throw "Could not determine Kaholo server URL";
}

module.exports = {
  executeMap: executeMap,
};
