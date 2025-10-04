"use client";
import { useState } from "react";
import { adminLogin } from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  try {
    const res = await adminLogin(email, password);
    if (res.data.success) {
      // ✅ Save admin email for later API requests
      localStorage.setItem("adminEmail", email);

      alert("Login successful!");
      window.location.href = "/admin"; // redirect to dashboard
    } else {
      setError(res.data.message);
    }
  } catch (err) {
    setError("Login failed. Check credentials.");
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-10 w-full max-w-md border border-gray-200">
        <h1 className="text-5xl font-extrabold text-center text-blue-700 mb-4 tracking-wide font-serif">
          Lock_Wise
        </h1>
        <h2 className="text-lg font-semibold text-center text-gray-600 mb-8">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="Enter password"
              required
            />
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}