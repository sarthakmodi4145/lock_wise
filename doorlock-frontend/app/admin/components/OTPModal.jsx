"use client";
import { useState } from "react";
import { sendAdminOTP } from "../../../services/api";

export default function OTPModal({ adminEmail }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await sendAdminOTP(adminEmail);
      if (res.data.success) {
        setOtp(res.data.otp);
      } else {
        alert("Failed to generate OTP");
      }
    } catch (err) {
      alert("Error generating OTP");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-96">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Admin OTP</h2>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {loading ? "Generating..." : "Generate OTP"}
      </button>
      {otp && (
        <p className="mt-4 text-green-600 text-lg">
          ✅ OTP: <b>{otp}</b>
        </p>
      )}
    </div>
  );
}