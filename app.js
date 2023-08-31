const { default: axios } = require("axios");
const { bootstrap } = require("@kaholo/plugin-library");

const {
  getServerUrl,
  waitForExecutionEnd,
} = require("./helpers");

async function executePipeline(params) {
  const {
    triggerMessage,
    configName,
    configObject,
    pipelineId,
    authToken,
    executionInputs,
    waitUntilPipelineEnds,
  } = params;

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

  const runLink = `${serverUrl}/maps/${pipelineId}/results/${executionDetails.runId}`;
  console.info(`Execution results can be viewed here:\n<a href=${runLink} target="_blank">${runLink}</a>\n`);

  return executionDetails;
}

module.exports = bootstrap({
  executePipeline,
});
