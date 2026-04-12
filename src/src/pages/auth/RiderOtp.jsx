import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RiderOtp() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const mobileNo = localStorage.getItem("riderMobile");

  const handleVerify = async () => {
    setMsg("");
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/rider/verify", {
        mobileNo,
        otp
      });

      navigate("/rider/login");
    } catch (err) {
      setMsg(err.response?.data?.msg || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl rounded-2xl p-8">
        
        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          Verify OTP
        </h2>

        <p className="text-gray-400 text-sm text-center mb-4">
          Enter the OTP sent to your mobile number
        </p>

        {msg && (
          <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
            {msg}
          </div>
        )}

        <input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition mb-4"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition font-medium text-white"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

      </div>
    </div>
  );
}