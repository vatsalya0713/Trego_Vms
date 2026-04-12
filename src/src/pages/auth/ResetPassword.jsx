import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // get email from previous page

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async () => {
    try {
      const res = await axios.post("http://localhost:5000/vendor/reset-password", {
        email, newPassword, confirmPassword
      });
      alert(res.data.msg);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Error");
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold text-white">Create New Password</h2>
      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setNewPassword(e.target.value)}
        className="mt-3 w-full px-3 py-2 bg-black text-white border rounded"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="mt-3 w-full px-3 py-2 bg-black text-white border rounded"
      />
      <button onClick={handleReset} className="mt-4 w-full bg-green-600 py-2 rounded">
        Reset Password
      </button>
    </div>
  );
}

export default ResetPassword;
