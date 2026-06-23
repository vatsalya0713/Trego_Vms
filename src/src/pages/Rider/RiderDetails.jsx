import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RiderDetails() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    age: "",
    gender: "",
    mobile: "",
    location: "",
    vehicleNumber: "",
    vehicleLicenseNumber: "",
    drivingLicenseNumber: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [files, setFiles] = useState({
    photo: null,
    vehiclePhoto: null,
    drivingLicensePhoto: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!otpVerified) {
      return alert("Verify mobile number first");
    }

    console.log("Form Data:", form);
    console.log("Files:", files);

    alert("Profile Completed Successfully ✅");

    navigate("/rider/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">

        <h1 className="text-3xl font-semibold text-white">
          Complete Rider Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ================= ACCOUNT DETAILS ================= */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
            <h2 className="text-xl font-semibold text-white">
              Account Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              <Input label="Username" name="username" value={form.username} onChange={handleChange} />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
              <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} />

              {/* Mobile + OTP */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Mobile Number
                </label>
                <div className="flex gap-3">
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.mobile) return alert("Enter mobile first");
                      setOtpSent(true);
                      alert("OTP Sent ✅ (Demo Mode)");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-white"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">
                    Enter OTP
                  </label>
                  <div className="flex gap-3">
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="6 digit OTP"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (otp.length === 6) {
                          setOtpVerified(true);
                        } else {
                          alert("Invalid OTP");
                        }
                      }}
                      className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-white"
                    >
                      Verify
                    </button>
                  </div>

                  {otpVerified && (
                    <p className="text-green-400 text-sm mt-2">
                      Mobile verified successfully ✅
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ================= PERSONAL DETAILS ================= */}
          <Section title="Personal Details">
            <Input label="Full Name" name="name" value={form.name} onChange={handleChange} />
            <Input label="Age" name="age" type="number" value={form.age} onChange={handleChange} />
            
            <div>
              <label className="block text-sm text-gray-300 mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <Input label="Location" name="location" value={form.location} onChange={handleChange} />

            <FileInput label="Upload Photo" name="photo" onChange={handleFileChange} />
          </Section>

          {/* ================= VEHICLE DETAILS ================= */}
          <Section title="Vehicle Details">
            <Input label="Vehicle Number" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} />
            <Input label="Vehicle License Number" name="vehicleLicenseNumber" value={form.vehicleLicenseNumber} onChange={handleChange} />
            <Input label="Driving License Number" name="drivingLicenseNumber" value={form.drivingLicenseNumber} onChange={handleChange} />
            <FileInput label="Vehicle Photo" name="vehiclePhoto" onChange={handleFileChange} />
            <FileInput label="Driving License Photo" name="drivingLicensePhoto" onChange={handleFileChange} />
          </Section>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              disabled={!otpVerified}
              className={`px-8 py-3 rounded-lg text-white font-medium ${
                otpVerified
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              Complete Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
      />
    </div>
  );
}

function FileInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">
        {label}
      </label>
      <input
        type="file"
        {...props}
        className="w-full text-gray-300"
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
}
