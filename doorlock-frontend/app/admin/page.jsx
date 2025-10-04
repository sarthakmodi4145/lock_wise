"use client";
import { useEffect, useState } from "react";
import { fetchMembers, sendAdminOTP, generateDailyOTPs, addMember } from "../../services/api";

export default function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [dailyOtpMessage, setDailyOtpMessage] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", regNo: "", memberEmail: "", isAdmin: false });

  const loadMembers = async () => {
    try {
      const res = await fetchMembers();
      setMembers(res.data || []);
    } catch (err) {
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem("adminEmail");
    if (email) setAdminEmail(email);
    loadMembers();
  }, []);

  const handleAdminOTP = async () => {
    try {
      const res = await sendAdminOTP(adminEmail);
      setOtpMessage(`Admin OTP generated: ${res.data.otp}`);
    } catch {
      setOtpMessage("Failed to generate Admin OTP");
    }
  };

  const handleDailyOTP = async () => {
    try {
      const res = await generateDailyOTPs(adminEmail);
      await loadMembers(); // Refresh members after generating daily OTPs
      setDailyOtpMessage("Daily OTPs generated and sent successfully!");
    } catch {
      setDailyOtpMessage("Failed to generate daily OTPs");
    }
  };

 const handleAddMember = async (e) => {
  e.preventDefault();
  try {
    // If the checkbox is checked, assign member's email as admin, else keep blank
    const assignedAdmin = newUser.isAdmin ? newUser.memberEmail : "";
    await addMember(newUser.name, newUser.memberEmail, newUser.regNo, assignedAdmin);
    alert("New member added!");
    setShowAddForm(false);
    setNewUser({ name: "", regNo: "", memberEmail: "", isAdmin: false });
    await loadMembers(); // Refresh members after adding
  } catch {
    alert("Failed to add member");
  }
};

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6 relative">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Admin Dashboard
        </h1>

        {/* Add member button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="absolute top-6 right-6 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          {showAddForm ? "Close" : "Add Member"}
        </button>

        {showAddForm && (
          <form onSubmit={handleAddMember} className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg shadow-inner">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Reg No"
              value={newUser.regNo}
              onChange={(e) => setNewUser({ ...newUser, regNo: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.memberEmail}
              onChange={(e) => setNewUser({ ...newUser, memberEmail: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newUser.isAdmin}
                onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-gray-700">Make Admin</span>
            </label>
            <button
              type="submit"
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Member
            </button>
          </form>
        )}

        {/* OTP buttons */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={handleAdminOTP}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Generate Admin OTP
          </button>
          <button
            onClick={handleDailyOTP}
            className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            Generate Daily OTPs
          </button>
        </div>

        {otpMessage && (
          <p className="text-center text-green-700 font-medium mb-2">{otpMessage}</p>
        )}
        {dailyOtpMessage && (
          <p className="text-center text-green-700 font-medium mb-6">{dailyOtpMessage}</p>
        )}

        {/* Members table */}
        {loading ? (
          <p className="text-center text-gray-600">Loading members...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : members.length === 0 ? (
          <p className="text-center text-gray-600">No members found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Reg No</th>
                  <th className="px-4 py-2">OTP</th>
                  <th className="px-4 py-2">Admin</th>
                  <th className="px-4 py-2">Timestamp</th>
                  <th className="px-4 py-2">Admin OTP</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-2 text-black">{m.name}</td>
                    <td className="px-4 py-2 text-black">{m.email}</td>
                    <td className="px-4 py-2 text-black">{m.regNo}</td>
                    <td className="px-4 py-2 font-mono text-black">{m.otp}</td>
                    <td className="px-4 py-2 text-black">{m.admin}</td>
                    <td className="px-4 py-2 text-black">{m.timestamp}</td>
                    <td className="px-4 py-2 text-black">{m.adminOtp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}