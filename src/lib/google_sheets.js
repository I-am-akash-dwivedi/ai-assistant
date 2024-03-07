"use server";

import { google } from "googleapis";
import moment from "moment";

// Config variables
const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_SERVICE_PRIVATE_KEY = process.env.GOOGLE_SERVICE_PRIVATE_KEY;
const CLIENT_ID = process.env.CLIENT_ID;

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: CLIENT_EMAIL,
    client_id: CLIENT_ID,
    private_key: GOOGLE_SERVICE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({
  auth,
  version: "v4",
});

// Append Function
const appendSpreadsheet = async (row, range) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [row],
        },
      });
      resolve({
        message: "Data saved successfully",
        status: "success",
        data: row,
      });
    } catch (e) {
      console.log(e);
      resolve({
        message: "Error: Data not saved",
        status: "error",
        data: row,
      });
    }
  });
};

const saveData = async (payload) => {
  const { question, answer, time_taken, usage } = payload;
  if (question && answer) {
    let new_row = [];
    new_row.push(question);
    new_row.push(answer);
    new_row.push(time_taken + " seconds");
    const formatted_date = moment(new Date()).format("LLLL");
    new_row.push(formatted_date);
    new_row.push(JSON.stringify(usage, null, 2));

    let range = "AIRequest!A2:E";
    const response = await appendSpreadsheet(new_row, range);
    return response;
  } else {
    return {
      message: "Error: No data to save",
      status: "error",
      data: {
        players,
        player_details,
      },
    };
  }
};

export default saveData;
