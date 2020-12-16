const { execSync } = require('child_process');

const GOOGLE_SHEET_ID = '1IBMHo_5yNtzjHZd4rKbTNS3E2PBGgrfB4QoLosXFe0M';

// Download Google Sheet as CSV
execSync('curl -L  https://docs.google.com/spreadsheets/d/' + GOOGLE_SHEET_ID + '/export\?exportFormat\=csv > src/data/weather-data.csv');

// Convert CSV to JSON
execSync('csvtojson src/data/weather-data.csv > src/data/weather-data.json');