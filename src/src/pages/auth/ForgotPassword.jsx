import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
const api="http://localhost:5000";
  const handleEmailCheck = async () => {
    try {
      const res = await axios.post(`${api}/vendor/forgot-password`, { email });
      alert(res.data.msg);
      navigate("/reset-password", { state: { email } }); // redirect with email
    } catch (err) {
      alert(err.response?.data?.msg || "Email not found");
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold text-white">Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your Email"
        className="w-full mt-3 px-3 py-2 rounded bg-black text-white border"
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleEmailCheck} className="mt-4 w-full bg-blue-600 py-2 rounded">
        Verify Email
      </button>
    </div>
  );
}

export default ForgotPassword;
