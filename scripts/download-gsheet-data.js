const { execSync } = require('child_process');

const args = process.argv.slice(2);

const GOOGLE_SHEET_ID = args[0];
const DEST_FILEPATH = args[1];

// Download Google Sheet as CSV
execSync(`curl -L  https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?exportFormat=csv > ${DEST_FILEPATH}.csv`);

// Convert CSV to JSON
execSync(`csvtojson ${DEST_FILEPATH}.csv > ${DEST_FILEPATH}.json`);
