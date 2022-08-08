const { default: axios } = require("axios");
const _ = require("lodash");

const WAIT_INTERVAL = 5000;
const STATUS_DONE = "done";
const AGENT_ENVIRONMENT_VARIABLES_PATH = "../../../core/src/environment/environment";

async function getServerUrl() {
  let serverUrl;
  try {
    // Support for agent version <1.3.0
    const environmentVariables = await import(AGENT_ENVIRONMENT_VARIABLES_PATH);
    serverUrl = environmentVariables.server_url;
  } catch (err) {
    // Support for agent version >=1.3.0
    serverUrl = process.env.SERVER_URL;
  }

  if (!serverUrl) {
    throw new Error("Could not determine Kaholo server URL.");
  }

  const parsedServerUrl = new URL(serverUrl);
  if (parsedServerUrl.protocol !== "http:" && parsedServerUrl.protocol !== "https:") {
    serverUrl = `http://${serverUrl}`;
  }

  return serverUrl;
}

function logToActivityLog(message) {
  // TODO: Change console.error to console.info
  // Right now (Kaholo v4.2.3-1) console.info
  // does not print messages to Activity Log
  // Jira ticket: https://kaholo.atlassian.net/browse/KAH-3636
  console.error(message);
}

async function waitForExecutionEnd({
  pipelineId,
  runId,
  authToken,
}) {
  const serverUrl = await getServerUrl();
  const apiUrl = `${serverUrl}/api/maps/${pipelineId}/results/${runId}/`;

  let pipelineResults;
  try {
    const { data } = await axios({
      url: apiUrl,
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      json: true,
    });
    pipelineResults = data;
  } catch (error) {
    throw new Error(`Kaholo server threw an error: ${error.response.data}`);
  }

  if (pipelineResults.status === STATUS_DONE) {
    const actions = pipelineResults
      .agentResult
      .processes
      .reduce((acc, cur) => [...acc, ...cur.actions], []);
    return { actions };
  }

  await delay(WAIT_INTERVAL);
  return waitForExecutionEnd({ pipelineId, runId, authToken });
}

function delay(delayTime) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayTime);
  });
}

function parseConfigParam(configParamValue) {
  if (_.isPlainObject(configParamValue)) {
    return configParamValue;
  }
  if (_.isString(configParamValue)) {
    try {
      // If the config value is string try to parse it
      return JSON.parse(configParamValue);
    } catch {
      // If the value is not in JSON format, assume it's a config's name
      return configParamValue;
    }
  }
  throw new Error(`Invalid Configuration parameter value: ${configParamValue}`);
}

module.exports = {
  getServerUrl,
  logToActivityLog,
  waitForExecutionEnd,
  parseConfigParam,
};
