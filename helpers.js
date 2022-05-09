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

module.exports = {
  getServerUrl,
  logToActivityLog,
};
