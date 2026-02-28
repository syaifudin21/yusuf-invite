// Google Apps Script Code untuk Google Sheets
// Copy code ini ke Google Apps Script Editor di Google Sheet Anda

const SHEET_NAME = "Sheet1"; // Nama sheet Anda

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { name, message, status, timestamp } = data;

    // Validate input
    if (!name || !message) {
      return createResponse(400, { error: "Name and message are required" });
    }

    // Get spreadsheet and sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createResponse(500, { error: "Sheet not found" });
    }

    // Append new row
    const id = new Date().getTime().toString();
    sheet.appendRow([
      id,
      name,
      message,
      status,
      new Date(timestamp).toISOString()
    ]);

    return createResponse(200, {
      success: true,
      message: "Wish saved successfully"
    });

  } catch (error) {
    Logger.log("Error: " + error.toString());
    return createResponse(500, { error: "Internal server error" });
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createResponse(500, { error: "Sheet not found" });
    }

    // Get all data (skip header row)
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);

    const wishes = rows.map(row => ({
      id: row[0].toString(),
      name: row[1],
      message: row[2],
      status: row[3],
      timestamp: row[4]
    })).reverse(); // Newest first

    return createResponse(200, { wishes });

  } catch (error) {
    Logger.log("Error: " + error.toString());
    return createResponse(500, { error: "Internal server error" });
  }
}

function createResponse(statusCode, data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
