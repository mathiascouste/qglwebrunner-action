"use strict";

const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
var request = require('request');
const axios = require('axios');

const wait = function (milliseconds) {
  return new Promise((resolve) => {
    if (typeof milliseconds !== 'number') {
      throw new Error('milliseconds not a number');
    }
    setTimeout(() => resolve("done!"), milliseconds)
  });
};

function uploadFile(apiToken, jarPath) {

  const fullPath = jarPath;
  console.log('uploadFile: ' + fullPath);
  if (fs.existsSync(fullPath)) {
    console.log('File exists. Uploading...');
  } else {
    console.log('File does not exists. Aborting...');
  }

  return new Promise((resolve, reject) => {
    request.post({
      url: 'https://qglwebrunner.io-labs.fr/api/files',
      headers: {
        "Authorization": apiToken,
        "Content-Type": "multipart/form-data"
      },
      formData: {
        file: fs.createReadStream(fullPath)
      },
    }, function(error, response, body) {
      if (error) {
        console.log('Error during upload: ', error);
        reject({error});
      }
      if (body) {
        resolve(JSON.parse(body));
      } else {
        reject({error: 'Cannot upload jar file.'});
      }
    });
  });
}

function startRun(apiToken, gameId, teamId, file, timeout) {
  console.log('Launching starting run command ...');
  return new Promise((resolve, reject) => {
    request.post({
        url: 'https://qglwebrunner.io-labs.fr/api/runs',
        headers: {
          "Authorization": apiToken,
          "Content-Type": "application/json"
        },
        json: {
         gameId: gameId,
         players: [
           {
             teamId: teamId,
             jarUrl: file.url
           }
         ],
         timeout: timeout
       }
      }, function(error, response, body) {
        if (error) {
          console.log('Error during run start: ', error);
          reject({error});
        }
        if (body) {
          resolve(body);
        } else {
          reject({error: 'Cannot start run.'});
       }
      });
  });
}

function fetchRun(apiToken, runId) {
  return new Promise((resolve, reject) => {
    request.get({
        url: `https://qglwebrunner.io-labs.fr/api/runs/${runId}`,
        headers: {
          "Authorization": apiToken
        }
      }, function(error, response, body) {
        if (body) {
          resolve(JSON.parse(body));
        } else {
          reject({error: 'Cannot retrieve run.'});
       }
      });
  });
}

async function run() {
  try {
    const gameId = core.getInput('game-id');
    const teamId = core.getInput('team-id');
    const jarPath = core.getInput('jar-path');
    const apiToken = core.getInput('api-token');
    const timeout = core.getInput('timeout');

    console.log(`Running ${gameId} for ${teamId} (${jarPath}) - timeout: ${timeout}`);

    const uploadedFile = await uploadFile(apiToken, jarPath);
    console.log('File uploaded: ', JSON.stringify(uploadedFile));

    const createdRun = await startRun(apiToken, gameId, teamId, uploadedFile, timeout);
    console.log('Run started: ', JSON.stringify(createdRun));

    const runId = createdRun.id;

    let status = 'PENDING';
    let fetchedRun = undefined;
    do {
      await wait(1000);
      fetchedRun = await fetchRun(apiToken, runId);
      status = fetchedRun.status;
    } while (status === 'PENDING');

    console.log('Run finished: ', JSON.stringify(fetchedRun));
    const playerStatus = fetchedRun.players[0].status;
    const success = playerStatus.finishedGame && !playerStatus.error && !playerStatus.gameError;

    if (!success) {
      if (fetchedRun.status === 'INTERUPT') {
        core.setFailed(`The run was interupted`);
      } else {
        core.setFailed(`The run failed: ${playerStatus.gameError}`);
      }
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
