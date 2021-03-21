# QGL Web Runner action

This action can be used to trigger a Run on the Web runner.
A run will consume one credit.

For now, failing the run does not make to action to fail.

## Inputs

### `game-id`

**Required** The ID of the game to be ran.

### `team-id`

**Required** Your teamId.

### `jar-path`

**Required** The path to the Jar file you can to use (`player/target/...`).

### `api-token`

**Required** The API token of your account. You can find it in your [settings](https://qglwebrunner.io-labs.fr/settings/accesstokens). 

## Example usage

uses: actions/hello-world-javascript-action@v1.1
with:
  who-to-greet: 'Mona the Octocat'

