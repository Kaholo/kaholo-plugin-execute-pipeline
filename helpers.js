const { default: axios } = require("axios");

const DEFAULT_INTERVAL = 5000;
const AGENT_ENVIRONMENT_VARIABLES_PATH = "../../../core/src/environment/environment";
const Status = {
  PENDING: "pending",
  RUNNING: "running",
  DONE: "done",
  ERROR: "error",
};

async function getServerUrl() {
  let serverUrl;
  try {
    // Support for agent version <1.3.0
    const environmentVariables = await import(AGENT_ENVIRONMENT_VARIABLES_PATH);
    serverUrl = environmentVariables.server_url;
  } catch {
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

  console.info(pipelineResults.status);

  if (
    pipelineResults.status !== Status.PENDING
    && pipelineResults.status !== Status.RUNNING
  ) {
    const result = {
      actions: pipelineResults
        .agentResult
        .processes
        .reduce((acc, cur) => [...acc, ...cur.actions], []),
      status: pipelineResults.status,
      details: pipelineResults,
    };
    if (result.status !== Status.DONE) {
      throw result;
    }
    return result;
  }

  await delay(DEFAULT_INTERVAL);
  return waitForExecutionEnd({ pipelineId, runId, authToken });
}

function delay(delayTime) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayTime);
  });
}

module.exports = {
  getServerUrl,
  waitForExecutionEnd,
};
