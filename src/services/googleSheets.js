const { google } = require('googleapis');
const config = require('../config/config');

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.init();
  }

  async init() {
    try {
      // Create JWT authentication
      this.auth = new google.auth.JWT(
        config.googleSheets.serviceAccountEmail,
        null,
        config.googleSheets.privateKey,
        ['https://www.googleapis.com/auth/spreadsheets']
      );

      // Authorize the client
      await this.auth.authorize();
      
      // Create sheets API instance
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      console.log('✅ Google Sheets service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets service:', error.message);
    }
  }

  /**
   * Add a new leave request to Google Sheets
   * @param {Object} requestData - Leave request data
   * @param {string} status - Request status ('Đã duyệt' or 'Từ chối')
   */
  async addLeaveRequest(requestData, status = 'Đã duyệt') {
    try {
      if (!this.sheets) {
        throw new Error('Google Sheets service not initialized');
      }

      // Prepare data for columns A to J
      const now = new Date();
      const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      const hours = String(vietnamTime.getHours()).padStart(2, '0');
      const minutes = String(vietnamTime.getMinutes()).padStart(2, '0');
      const day = String(vietnamTime.getDate()).padStart(2, '0');
      const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
      const year = vietnamTime.getFullYear();
      const timestamp = `${hours}:${minutes} ${day}/${month}/${year}`;
      const values = [[
        timestamp,                   // Column A
        requestData.email,           // Column B
        requestData.employeeId,      // Column C  
        requestData.fullName,        // Column D
        requestData.department,      // Column E
        requestData.leaveDate,       // Column F
        requestData.leaveTime,       // Column G
        requestData.reason,          // Column H
        requestData.directManager,   // Column I
        status                       // Column J
      ]];

      const request = {
        spreadsheetId: config.googleSheets.spreadsheetId,
        range: `${config.googleSheets.sheetName}!${config.googleSheets.range}`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: values
        }
      };

      const response = await this.sheets.spreadsheets.values.append(request);
      
      console.log('✅ Leave request added to Google Sheets:', {
        updatedRows: response.data.updates.updatedRows,
        updatedRange: response.data.updates.updatedRange
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error adding to Google Sheets:', error.message);
      throw error;
    }
  }

  /**
   * Get the next available row number (for reference)
   */
  async getNextRowNumber() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.googleSheets.spreadsheetId,
        range: `${config.googleSheets.sheetName}!A:A`
      });

      const rows = response.data.values || [];
      return rows.length + 1; // Next available row
    } catch (error) {
      console.error('❌ Error getting next row number:', error.message);
      return 2; // Default to row 2 (after header)
    }
  }

  /**
   * Test connection to Google Sheets
   */
  async testConnection() {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: config.googleSheets.spreadsheetId
      });
      
      console.log('✅ Google Sheets connection test successful');
      console.log(`📊 Spreadsheet: ${response.data.properties.title}`);
      return true;
    } catch (error) {
      console.error('❌ Google Sheets connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = new GoogleSheetsService();
