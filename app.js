const { default: axios } = require("axios");
const { bootstrap } = require("@kaholo/plugin-library");

const {
  getServerUrl,
  logToActivityLog,
  waitForExecutionEnd,
} = require("./helpers");

async function executePipeline({
  TRIGGER: triggerMessage,
  CONFIG: configName,
  configObject,
  TOKEN: authToken,
  pipeline: pipelineId,
  executionInputs,
  waitUntilPipelineEnds,
}) {
  if (!authToken) {
    throw new Error("Authorization Token is empty! Please specify it in the action's parameters or plugin's settings.");
  }
  if (configName && configObject) {
    throw new Error("Configuration Name and Configuration Object can't be provided together at the same time.");
  }

  const serverUrl = await getServerUrl();
  const executionUrl = `${serverUrl}/api/maps/${pipelineId}/execute/`;

  const requestBody = {
    trigger: triggerMessage,
  };
  if (configName) {
    requestBody.config = configName;
  } else if (configObject) {
    requestBody.config = configObject;
  }
  if (executionInputs) {
    requestBody.inputs = executionInputs;
  }

  let executionDetails;
  try {
    const { data } = await axios({
      url: executionUrl,
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: requestBody,
      json: true,
    });
    executionDetails = data;
  } catch (error) {
    throw new Error(`Kaholo server threw an error: ${error.response.data}`);
  }

  if (waitUntilPipelineEnds) {
    return waitForExecutionEnd({
      runId: executionDetails.runId,
      pipelineId,
      authToken,
    });
  }

  logToActivityLog(`You can view the results of the execution at: ${serverUrl}/maps/${pipelineId}/results`);

  return executionDetails;
}

module.exports = bootstrap({
  executePipeline,
});
