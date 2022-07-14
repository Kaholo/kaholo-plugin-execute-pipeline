const { default: axios } = require("axios");
const _ = require("lodash");

const WAIT_INTERVAL_TIME = 5000;
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

function parseExecutionInputs(executionInputs) {
  if (_.isPlainObject(executionInputs)) {
    return executionInputs;
  }

  return Object.fromEntries(
    executionInputs
      .split("\n")
      .map((inputLine) => {
        const [key, ...rest] = inputLine.split("=");
        return [key, rest.join("=")];
      }),
  );
}

async function waitForExecutionEnd({
  pipelineId,
  runId,
  authToken,
}) {
  const serverUrl = await getServerUrl();
  const apiUrl = `${serverUrl}/api/maps/${pipelineId}/results/${runId}/`;

  let status;
  try {
    const { data } = await axios({
      url: apiUrl,
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      json: true,
    });
    status = data.status;
  } catch (error) {
    throw new Error(`Kaholo server threw an error: ${error.response.data}`);
  }

  if (status === STATUS_DONE) {
    return status;
  }

  await delay(WAIT_INTERVAL_TIME);
  return waitForExecutionEnd({ pipelineId, runId, authToken });
}

function delay(delayTime) {
  return new Promise((res) => {
    setTimeout(res, delayTime);
  });
}

module.exports = {
  getServerUrl,
  logToActivityLog,
  parseExecutionInputs,
  waitForExecutionEnd,
};
