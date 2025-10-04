import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import sheets from './sheets.js';
import cron from "node-cron";

dotenv.config();
const { appendEmailToSheet, getAllValFromColumn, changeValueSheet, getAllAdminsFromColumn } = sheets;

const emailCol = Number(process.env.MEMBER_EMAIL_COL);
const regNoCol = Number(process.env.MEMBER_REG_NO_COL);
const passwordCol = Number(process.env.MEMBER_PASSWORD_COL);
const adminCol = Number(process.env.ADMIN_COL);
const timestampCol = Number(process.env.TIMESTAMP_COL);
const adminOtpCol = Number(process.env.ADMIN_OTP_COL || 6); // ✅ New column for admin OTPs

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function sendEmailBrevo(to, subject, htmlContent) {
  const url = "https://api.brevo.com/v3/smtp/email";
  const body = {
    sender: { name: "Robotics Club", email: process.env.EMAIL_USER },
    to: [{ email: to }],
    subject,
    htmlContent
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Brevo email failed: ${response.statusText}`);
  return response.json();
}

// ========================= //
// Admin login (fixed)
// ========================= //
app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const admins = await getAllAdminsFromColumn();

  if (!admins.includes(email)) {
    return res.status(403).json({ success: false, message: "Unauthorized: not an admin" });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Incorrect password" });
  }

  // Send success, token, and email for frontend localStorage
  res.json({ success: true, token: "sample-admin-token", email });
});

// ========================= //
// Admin Add member
// ========================= //

app.post('/admin/add-member', async (req, res) => {
  const { name, memberEmail, regNo, adminEmail } = req.body;
  if (!name || !memberEmail || !regNo) {  // <-- remove adminEmail check
    return res.status(400).send("Missing required fields");
  }
  try {
    await appendEmailToSheet({ name, memberEmail, regNo, password: "", adminEmail: adminEmail || "" });
    res.status(200).json({ success: true, message: "User added successfully" });
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ success: false, message: "Error adding user" });
  }
});

// ========================= //
// Admin/Guest OTP
// ========================= //
app.post('/admin/otp', async (req, res) => {
  const { adminEmail } = req.body;

  if (!adminEmail) return res.status(400).send("Admin email required");
  const admins = await getAllAdminsFromColumn();
  if (!admins.includes(adminEmail)) {
    return res.status(403).send("Unauthorized: Not an admin");
  }

  const code = `${Math.floor(100000 + Math.random() * 900000)}`; // 6-digit OTP
  const subject = "Your Admin/Guest OTP";
  const htmlContent = `<p>Your one-time Admin/Guest OTP is: <b>${code}</b></p>`;

  try {
    await sendEmailBrevo(adminEmail, subject, htmlContent);

    // Store OTP in Admin OTP column (row 2)
    await changeValueSheet(0, adminOtpCol, code);

    return res.json({ success: true, otp: code });
  } catch (err) {
    console.error("Error sending admin OTP:", err);
    return res.status(500).send("Failed to send OTP");
  }
});

// ========================= //
// Bulk OTPs
// ========================= //
app.post('/admin/send-otps', async (req, res) => {
  const { adminEmail } = req.body;
  if (!adminEmail) return res.status(400).send("Admin email required");
  const admins = await getAllAdminsFromColumn();
  if (!admins.includes(adminEmail)) {
    return res.status(403).send("Unauthorized: Not an admin");
  }

  try {
    const emails = await getAllValFromColumn(emailCol);
    const regNos = await getAllValFromColumn(regNoCol);
    const results = [];

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const regNo = regNos[i];
      const code = `${String(regNo).slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
      const subject = "Your Robotics Club OTP";
      const htmlContent = `<p>Your OTP is: <b>${code}</b></p>`;

      try {
        await sendEmailBrevo(email, subject, htmlContent);
        await changeValueSheet(i, passwordCol, code);
        await changeValueSheet(i, timestampCol, new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));

        results.push({ email, status: "sent" });
      } catch (err) {
        results.push({ email, status: "failed" });
      }
    }
    res.json({ message: "Bulk OTP sending completed", results });
  } catch (err) {
    res.status(500).send("Error sending bulk OTPs");
  }
});

// ========================= //
// Daily OTP generation
// ========================= //
app.post('/admin/generate-daily-otp', async (req, res) => {
  const { adminEmail } = req.body;
  if (!adminEmail) return res.status(400).send("Admin email required");

  try {
    const admins = await getAllAdminsFromColumn();
    if (!admins.includes(adminEmail)) return res.status(403).send("Unauthorized");

    // ✅ Always fetch latest members from sheet
    const emails = await getAllValFromColumn(emailCol);
    const regNos = await getAllValFromColumn(regNoCol);
    const results = [];

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const regNo = regNos[i];
      const code = `${String(regNo).slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
      const subject = "Your Daily Robotics Club OTP";
      const htmlContent = `<p>Your new daily OTP is: <b>${code}</b></p>`;

      try {
        await sendEmailBrevo(email, subject, htmlContent);
        await changeValueSheet(i, passwordCol, code);
        await changeValueSheet(i, timestampCol, new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));

        results.push({ email, otp: code, status: "sent & updated" });
      } catch (err) {
        results.push({ email, status: "failed" });
      }
    }

    res.status(200).json({ message: "Daily OTP generation completed", results });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating daily OTPs");
  }
});

// ========================= //
// Verify OTP (ESP32)
// ========================= //
app.post("/verify-otp", async (req, res) => {
  const { otp } = req.body;

  if (!otp) return res.status(400).json({ success: false, message: "OTP is required" });

  try {
    const dailyOtps = await getAllValFromColumn(passwordCol);
    const adminOtps = await getAllValFromColumn(adminOtpCol);

    if (dailyOtps.includes(otp) || adminOtps.includes(otp)) {
      return res.json({ success: true, message: "OTP verified, access granted" });
    }

    return res.status(401).json({ success: false, message: "Invalid OTP" });
  } catch (err) {
    console.error("Error in /verify-otp:", err);
    res.status(500).json({ success: false, message: "Server error verifying OTP" });
  }
});

// ========================= //
// Members log
// ========================= //
app.get('/admin/members', async (req, res) => {
  try {
    const names = await getAllValFromColumn(Number(process.env.MEMBER_NAME_COL));
    const emails = await getAllValFromColumn(Number(process.env.MEMBER_EMAIL_COL));
    const regNos = await getAllValFromColumn(Number(process.env.MEMBER_REG_NO_COL));
    const otps = await getAllValFromColumn(Number(process.env.MEMBER_PASSWORD_COL));
    const admins = await getAllValFromColumn(Number(process.env.ADMIN_COL));
    const timestamps = await getAllValFromColumn(Number(process.env.TIMESTAMP_COL));
    const adminOtps = await getAllValFromColumn(adminOtpCol);

    const members = names.map((name, i) => ({
      name,
      email: emails[i],
      regNo: regNos[i],
      otp: otps[i],
      admin: admins[i],
      timestamp: timestamps[i],
      adminOtp: adminOtps[i] || ""
    }));

    res.json(members);
  } catch (err) {
    res.status(500).send("Error fetching members");
  }
});

app.get('/get', (req, res) => res.send("Hello World!"));

// ============================= //
// Daily OTP Auto-Generation Job
// ============================= //
cron.schedule("0 2 * * *", async () => {
  try {
    console.log("Running daily OTP generation job...");

    // ✅ Always fetch latest data
    const emails = await getAllValFromColumn(emailCol);
    const regNos = await getAllValFromColumn(regNoCol);

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const regNo = regNos[i];
      const code = `${String(regNo).slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
      const subject = "Your Robotics Club Daily OTP";
      const htmlContent = `<p>Your OTP is: <b>${code}</b></p>`;

      try {
        await sendEmailBrevo(email, subject, htmlContent);
        await changeValueSheet(i, passwordCol, code);
        await changeValueSheet(i, timestampCol, new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
      } catch (err) {
        console.error(`Error sending daily OTP to ${email}:`, err);
      }
    }

    console.log("Daily OTP generation completed:", emails.length, "members processed");
  } catch (err) {
    console.error("Error in cron job:", err);
  }
}, { timezone: "Asia/Kolkata" });

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));