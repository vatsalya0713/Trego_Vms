import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function RiderDetaillogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    age: "",
    gender: "",
    location: "",
    vehicle_number: "",
    driving_license_number: ""
  });

  const [files, setFiles] = useState({
    photo: null,
    vehicle_photo: null,
    driving_license_photo: null,
    aadhar_card: null,
    pancard: null
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const fd = new FormData();

  const applicant_id = localStorage.getItem("applicant_id");

  if (!applicant_id) {
    alert("Applicant ID missing. Please login again.");
    return;
  }

  fd.append("applicant_id", applicant_id); // ✅ pass manually

  Object.keys(form).forEach((key) => {
    fd.append(key, form[key]);
  });

  Object.keys(files).forEach((key) => {
    if (files[key]) fd.append(key, files[key]);
  });

  try {
    await axios.post(
      "http://localhost:5000/rider/application/submit",
      fd,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    navigate("/rider/review");
  } catch (err) {
    alert("Something went wrong");
  }
};

  return (
    <div className="min-h-screen bg-black px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">

        <h1 className="text-3xl font-bold text-green-500">
          Complete Rider Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* ================= PERSONAL DETAILS ================= */}
          <Section title="Personal Details">
            <Input label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} />
            {/* <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} /> */}
            {/* <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} /> */}
            <Input label="Mobile Number" name="mobile" value={form.mobile} onChange={handleChange} />
            <Input label="Age" type="number" name="age" value={form.age} onChange={handleChange} />
            
            <div>
              <label className="text-green-400 text-sm">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-green-600 rounded-lg px-4 py-2 text-white"
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
            <Input label="Vehicle Number" name="vehicle_number" value={form.vehicle_number} onChange={handleChange} />
            <Input label="Driving License Number" name="driving_license_number" value={form.driving_license_number} onChange={handleChange} />

            <FileInput label="Vehicle Photo" name="vehicle_photo" onChange={handleFileChange} />
            <FileInput label="Driving License Photo" name="driving_license_photo" onChange={handleFileChange} />
            <FileInput label="Aadhar Card" name="aadhar_card" onChange={handleFileChange} />
            <FileInput label="PAN Card" name="pancard" onChange={handleFileChange} />
          </Section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-500 text-black font-semibold px-8 py-3 rounded-lg"
            >
              Next 
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
      <label className="block text-green-400 text-sm mb-1">{label}</label>
      <input
        {...props}
        className="w-full bg-gray-900 border border-green-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}

function FileInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-green-400 text-sm mb-1">{label}</label>
      <input
        type="file"
        {...props}
        className="w-full text-green-400"
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-gray-950 border border-green-700 rounded-2xl p-8 shadow-lg space-y-6">
      <h2 className="text-xl font-semibold text-green-500">{title}</h2>
      <div className="grid md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}