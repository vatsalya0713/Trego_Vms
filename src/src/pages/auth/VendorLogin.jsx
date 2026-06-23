import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function VendorLogin() {
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const api="http://localhost:5000";

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!username || !pwd) {
      setErr("Please enter username and password");
      return;
    }

    try {
      const res = await axios.post(
        `${api}/vendor/vendorlogin`,
        {
          username,
          password: pwd,
        },
      );

      const { token, applicationStatus, applicant_id, user } = res.data;
      if (!token) throw new Error("No token received");
      if (applicant_id) {
        localStorage.setItem("applicant_id", applicant_id);
      }

      localStorage.setItem("token", token);
      console.log(token);

      if (applicant_id) {
        localStorage.setItem("applicant_id", applicant_id);
      }

      setUser({
        id: user.id,
        role: "VENDOR",
        username: user.username,
      });
      console.log("LOGIN STATUS ROW:", applicationStatus);

      /* 🚦 Redirect based on application status */
      if (
        (applicationStatus === "PENDING_APPROVAL" ||
          applicationStatus === "SUBMITTED" )
      ) {
        navigate("/vendor/review", { replace: true });
      } else if (applicationStatus === "APPROVED") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/vendor/business/detail", { replace: true });
      }
    } catch (e) {
      console.error("Login error:", e);
      setErr(e.response?.data?.message || "Login failed");
    }
  };

  const handleCreate = () => {
    navigate("/sign/vendor");
  };

  const handleForget = () => {
    navigate("/forgot-password");
  };

  return (
    <AuthShell title="Vendor Login" hint="Access vendor dashboard">
      <form onSubmit={submit} className="space-y-3">
        <Input value={username} onChange={setUsername} placeholder="Username" />
        <Input
          value={pwd}
          onChange={setPwd}
          placeholder="Password"
          type="password"
        />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500">
          Login
        </button>
      </form>

      <div className="flex justify-between mt-3 text-sm">
        <button onClick={handleForget}>Forgot Password</button>
        <button onClick={handleCreate}>Create New Account</button>
      </div>
    </AuthShell>
  );
}

/* ---------- UI HELPERS ---------- */

function AuthShell({ title, hint, children }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {hint && <p className="mt-1 text-sm text-gray-400">{hint}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
    />
  );
}
