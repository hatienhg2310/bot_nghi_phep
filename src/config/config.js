require('dotenv').config();

module.exports = {
  // Discord Configuration
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    hrChannelId: process.env.HR_CHANNEL_ID
  },

  // Google Sheets Configuration
  googleSheets: {
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    sheetName: process.env.GOOGLE_SHEET_NAME || 'Sheet1',
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    range: 'A:J' // Columns A to J (timestamp to status)
  },

  // Available departments for the form
  departments: [
    'Nhân sự',
    'Kế toán',
    'Kinh doanh',
    'Kỹ thuật',
    'Marketing'
  ],

  // Time options for leave requests
  timeOptions: [
    'Buổi sáng',
    'Buổi chiều',
    'Cả ngày'
  ]
};
