/**
 * handles basic authentication for using the google API
 */


import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'];
const TOKEN_PATH = './token.json';

export async function authenticate() {
  const credentials = require('./credentials.json');
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  try {
    const token = readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    await getNewToken(oAuth2Client);
  }

  return oAuth2Client;
}

async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', async (code) => {
    rl.close();
    console.log("code---->", code);
    const token = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(token.tokens);
    // Save the token to disk for future program executions
    writeFileSync(TOKEN_PATH, JSON.stringify(token.tokens));
  });
}

export default authenticate;


