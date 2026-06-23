import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function RiderSignup() {
  const navigate = useNavigate();
const api="http://localhost:5000";
  const [form, setForm] = useState({
    username: "",
    email: "",
    mobileNo: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Send OTP
 const handleSendOtp = async () => {
  try {
    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    const res = await axios.post(
      `${api}/rider/signup`,
      form
    );

    alert(`Your OTP is: ${res.data.otp}`);

    setOtpSent(true);

  } catch (err) {
    alert(err.response?.data?.message || "Signup failed");
  }
};

  // ✅ Verify OTP
  const handleVerifyOtp = async () => {
    try {
      await axios.post(`${api}/rider/verify`, {
        mobileNo: form.mobileNo,
        otp,
      });

      alert("Signup successful!");
      navigate("/login/rider");

    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Rider Signup
        </h2>

        {!otpSent ? (
          <>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded bg-gray-900 text-white border border-gray-700"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded bg-gray-900 text-white border border-gray-700"
            />

            <input
              type="text"
              name="mobileNo"
              placeholder="Mobile Number"
              value={form.mobileNo}
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded bg-gray-900 text-white border border-gray-700"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded bg-gray-900 text-white border border-gray-700"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full mb-6 p-3 rounded bg-gray-900 text-white border border-gray-700"
            />

            <button
              onClick={handleSendOtp}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mb-4 p-3 rounded bg-gray-900 text-white border border-gray-700"
            />

            <button
              onClick={handleVerifyOtp}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg"
            >
              Verify OTP
            </button>
          </>
        )}

        <p className="text-gray-400 text-center mt-4">
          Already have an account?{" "}
          <Link to="/rider/login" className="text-emerald-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
