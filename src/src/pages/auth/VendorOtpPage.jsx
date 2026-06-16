import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function VendorOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mobileNo = location.state?.mobileNo;

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const api="http://localhost:5000";
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* ================= VERIFY OTP ================= */
  const verifyOTP = async () => {
    try {
      const res = await axios.post(
        `${api}/vendor/verify`,
        { mobileNo, otp }
      );

      alert(res.data.msg);
      navigate("/login/vendor");

    } catch (err) {
      alert(err.response?.data?.msg || "Wrong OTP");
    }
  };

  /* ================= RESEND OTP ================= */
  const resendOTP = async () => {
    try {
      const res = await axios.post(
        `${api}/vendor/resend-otp`,
        { mobileNo }
      );

      alert(`OTP resent (TEMP): ${res.data.otp}`);

      // reset timer
      setTimer(30);
      setCanResend(false);

    } catch (err) {
      alert(err.response?.data?.msg || "Failed to resend OTP");
    }
  };

  if (!mobileNo) {
    return <p className="text-center mt-10">Invalid access</p>;
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-gray-900 p-6 mt-12">
      <h2 className="text-xl font-semibold text-yellow-400">Verify OTP</h2>

      <p className="text-gray-400 text-sm mb-3">
        OTP sent to +91 {mobileNo}
      </p>

      <input
        type="password"
        inputMode="numeric"
        autoComplete="new-password"
        placeholder="Enter OTP"
        className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button
        onClick={verifyOTP}
        className="w-full mt-3 rounded-md bg-blue-600 px-4 py-2 hover:bg-blue-500"
      >
        Verify OTP
      </button>

      {/* RESEND OTP */}
      <div className="mt-4 text-center">
        {!canResend ? (
          <p className="text-sm text-gray-400">
            Resend OTP in <span className="text-yellow-400">{timer}s</span>
          </p>
        ) : (
          <button
            onClick={resendOTP}
            className="text-sm text-emerald-400 hover:underline"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}

export default VendorOtpPage;
