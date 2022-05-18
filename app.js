const { default: axios } = require("axios");
const { bootstrap } = require("kaholo-plugin-library");
const { getServerUrl, logToActivityLog } = require("./helpers");

async function executePipeline({
  TRIGGER: triggerMessage,
  CONFIG: configurationName,
  TOKEN: authToken,
  pipeline: pipelineId,
}) {
  if (!authToken) {
    throw new Error("Authorization Token is empty! Please specify it in the action's parameters or plugin's settings.");
  }

  const serverUrl = await getServerUrl();
  const executionUrl = `${serverUrl}/api/maps/${pipelineId}/execute/`;

  const requestBody = {
    trigger: triggerMessage,
  };
  if (configurationName) {
    requestBody.config = configurationName;
  }

  let serverResponse;
  try {
    const { data: axiosResponseData } = await axios({
      url: executionUrl,
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: requestBody,
      json: true,
    });
    serverResponse = axiosResponseData;
  } catch (error) {
    const axiosResponseErrorMessage = error.response.data;
    throw new Error(`Kaholo server threw an error: ${axiosResponseErrorMessage}`);
  }

  logToActivityLog(`You can view the results of the pipeline by going to: ${serverUrl}/maps/${pipelineId}/results`);

  return serverResponse;
}

module.exports = bootstrap({
  executePipeline,
});
