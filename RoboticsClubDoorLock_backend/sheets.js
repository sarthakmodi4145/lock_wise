import dotenv from 'dotenv';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
dotenv.config();

const isRender = process.env.RENDER === 'true';
const keyPath = isRender
  ? '/etc/secrets/robotics-club-door-lock-592445d6ec57.json'
  : path.join('/tmp', 'robotics-club-door-lock-592445d6ec57.json');

if (!fs.existsSync(keyPath)) {
  const keyJson = Buffer.from(process.env.GOOGLE_KEY_JSON, "base64").toString("utf-8");
  fs.writeFileSync(keyPath, keyJson);
}

const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'PasswordResetListRoboticsClub';

async function getSheetsClient() {
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

function colToLetter(col) {
  let letter = '';
  let temp = col + 1; 
  while (temp > 0) {
    let rem = (temp - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
}

async function appendEmailToSheet({ name, memberEmail, regNo, password, adminEmail }) {
  const sheets = await getSheetsClient();
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:F`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [[name, memberEmail, regNo, password, adminEmail, now]] },
  });
}

async function changeValueSheet(row, col, newValue) {
  const sheets = await getSheetsClient();
  const cell = `${colToLetter(col)}${row + 2}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!${cell}`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [[newValue]] },
  });
}

async function getAllValFromColumn(col) {
  const sheets = await getSheetsClient();
  const colLetter = colToLetter(col);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!${colLetter}:${colLetter}`,
  });
  const rows = response.data.values || [];
  return rows.slice(1).map(r => r[0] || '');
}

async function getAllAdminsFromColumn() {
  const sheets = await getSheetsClient();
  const adminCol = Number(process.env.ADMIN_COL);
  const colLetter = colToLetter(adminCol);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!${colLetter}:${colLetter}`,
  });
  const rows = response.data.values || [];
  return rows.slice(1).map(r => r[0] || '');
}

export default {
  appendEmailToSheet,
  changeValueSheet,
  getAllValFromColumn,
  getAllAdminsFromColumn,
};