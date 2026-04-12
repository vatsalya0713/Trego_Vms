import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function RiderLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });
const handleChange = (e) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
};
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setMsg("");
  setLoading(true);

  try {
    const res = await axios.post(
      "http://localhost:5000/rider/login",  // ✅ Rider login API
      form
    );

    const { token, applicationStatus, applicant_id } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("applicant_id", applicant_id);

    if (applicationStatus === "DRAFT") {
      navigate("/rider/login/detail");
    } 
    else if (applicationStatus === "PENDING_APPROVAL") {
      navigate("/rider/review");
    } 
    else if (applicationStatus === "APPROVED") {
      navigate("/rider/dashboard");
    } 
    else if (applicationStatus === "REJECTED") {
      navigate("/login/rider");
    } 
    else {
      navigate("/rider/login/detail");
    }

  } catch (err) {
    setMsg(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};
    

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl rounded-2xl p-8">
        
        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          Rider Login
        </h2>

        {msg && (
          <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />

          <button
            disabled={loading}
            className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition font-medium text-white"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-6 text-center">
          Don’t have an account?{" "}
          <Link to="/sign/rider" className="text-emerald-400 hover:underline">
            Signup
          </Link>
        </p>

      </div>
    </div>
  );
}