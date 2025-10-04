import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

export const adminLogin = (email, password) =>
  instance.post("/admin/login", { email, password });

export const fetchMembers = () => instance.get("/admin/members");

export const sendAdminOTP = (adminEmail) =>
  instance.post("/admin/otp", { adminEmail });

export const sendBulkOTPs = (adminEmail) =>
  instance.post("/admin/send-otps", { adminEmail });

export const generateDailyOTPs = (adminEmail) =>
  instance.post("/admin/generate-daily-otp", { adminEmail });

export const addMember = (name, memberEmail, regNo, adminEmail) =>
  instance.post("/admin/add-member", { name, memberEmail, regNo, adminEmail });

export default instance;