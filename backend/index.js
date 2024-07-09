const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const CREDENTIALS = require('./credentials.json'); // Your OAuth2 credentials
const { client_secret, client_id, redirect_uris } = CREDENTIALS.web;
const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Step 2: OAuth2 Consent URL
app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

// Step 3: OAuth2 Callback
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Store tokens securely (e.g., in a database)
  // For demonstration, redirect with tokens in URL (not recommended for production)
  res.redirect(`/tokens?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`);
});

// Step 4: Endpoint to Add Application
app.post('/addApplication', async (req, res) => {
  const { company, title, resume, notes, access_token } = req.body;

  oauth2Client.setCredentials({ access_token });
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: 'USER_SPREADSHEET_ID', // Use the user's spreadsheet ID
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      resource: {
        values: [[company, title, resume, notes]],
      },
    });
    res.status(200).send('Application added successfully');
  } catch (error) {
    res.status(500).send('Error adding application: ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
