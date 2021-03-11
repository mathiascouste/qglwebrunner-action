const core = require('@actions/core');
const github = require('@actions/github');

try {
  const gameId = core.getInput('game-id');
  const teamId = core.getInput('team-id');
  const jarPath = core.getInput('jar-path');
  const timeout = core.getInput('timeout');

  console.log(`Running ${gameId} for ${teamId} (${jarPath}) - timeout: ${timeout}`);

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
} catch (error) {
  core.setFailed(error.message);
}
