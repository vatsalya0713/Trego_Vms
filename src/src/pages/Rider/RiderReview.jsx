import React, { useEffect, useState } from "react";
import axios from "axios";

export default function RiderReview() {
  const applicant_id = localStorage.getItem("applicant_id");

  const [status, setStatus] = useState("DRAFT");
  const [details, setDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!applicant_id) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/rider/application/${applicant_id}`
        );
        setDetails(res.data);
        setFormData(res.data);

        const statusRes = await axios.get(
          `http://localhost:5000/rider/status/${applicant_id}`
        );
        setStatus(statusRes.data.status);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [applicant_id]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleUpdate = async () => {
    try {
      const fd = new FormData();
      fd.append("applicant_id", applicant_id);

      Object.keys(formData).forEach((key) => {
        fd.append(key, formData[key]);
      });

      Object.keys(files).forEach((key) => {
        if (files[key]) fd.append(key, files[key]);
      });

      await axios.patch(
        "http://localhost:5000/rider/application/update",
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      setEditMode(false);
      window.location.reload();

    } catch (err) {
      alert("Update failed");
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      setLoading(true);

      await axios.post("http://localhost:5000/rider/submit", {
        applicant_id
      });

      setStatus("PENDING_APPROVAL");
    } catch (err) {
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (!details) return <div className="p-8 text-white">Loading...</div>;

  const isLocked = status !== "DRAFT";

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold text-green-500">
          Review Your Profile
        </h1>

        {/* Status */}
        <div>
          <span className="px-3 py-1 rounded bg-green-700/30 text-green-400 text-sm">
            Status: {status}
          </span>
        </div>

        {/* DETAILS CARD */}
        <div className="bg-gray-900 border border-green-600 rounded-xl p-6 space-y-5">

          <Field label="Full Name" name="full_name" value={formData.full_name} editMode={editMode} onChange={handleChange} />
          <Field label="Age" name="age" value={formData.age} editMode={editMode} onChange={handleChange} />
          <Field label="Gender" name="gender" value={formData.gender} editMode={editMode} onChange={handleChange} />
          <Field label="Mobile" name="mobile" value={formData.mobile} editMode={editMode} onChange={handleChange} />
          <Field label="Location" name="location" value={formData.location} editMode={editMode} onChange={handleChange} />

          <hr className="border-green-700" />

          <Field label="Vehicle Number" name="vehicle_number" value={formData.vehicle_number} editMode={editMode} onChange={handleChange} />
          <Field label="Driving License" name="driving_license_number" value={formData.driving_license_number} editMode={editMode} onChange={handleChange} />

          <ImageField label="Profile Photo" name="photo" existing={details.photo} editMode={editMode} onChange={handleFileChange} />
          <ImageField label="Vehicle Photo" name="vehicle_photo" existing={details.vehicle_photo} editMode={editMode} onChange={handleFileChange} />
          <ImageField label="Driving License Photo" name="driving_license_photo" existing={details.driving_license_photo} editMode={editMode} onChange={handleFileChange} />
          <ImageField label="Aadhar Card" name="aadhar_card" existing={details.aadhar_card} editMode={editMode} onChange={handleFileChange} />
          <ImageField label="PAN Card" name="pancard" existing={details.pancard} editMode={editMode} onChange={handleFileChange} />

        </div>

        {/* BUTTONS */}
        <div className="flex gap-4">

          {!isLocked && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-2 rounded bg-gray-700 hover:bg-gray-600"
            >
              Edit
            </button>
          )}

          {!isLocked && editMode && (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="px-6 py-2 rounded bg-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="px-6 py-2 rounded bg-green-600 hover:bg-green-500"
              >
                Save Changes
              </button>
            </>
          )}

          {!isLocked && !editMode && (
            <button
              onClick={handleSubmitForApproval}
              disabled={loading}
              className="px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-500"
            >
              {loading ? "Submitting..." : "Send For Approval"}
            </button>
          )}

          {isLocked && (
            <p className="text-gray-400 text-sm">
              Application is under review. Editing disabled.
            </p>
          )}

        </div>

      </div>
    </div>
  );
}

/* ================= FIELD COMPONENT ================= */

function Field({ label, name, value, editMode, onChange }) {
  return (
    <div>
      <label className="text-green-400 text-sm">{label}</label>
      {editMode ? (
        <input
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full mt-1 bg-gray-800 border border-green-600 rounded px-3 py-2"
        />
      ) : (
        <p className="mt-1">{value || "—"}</p>
      )}
    </div>
  );
}

/* ================= IMAGE FIELD ================= */

function ImageField({ label, name, existing, editMode, onChange }) {
  return (
    <div>
      <label className="text-green-400 text-sm">{label}</label>

      {existing && (
        <img
          src={`http://localhost:5000/${existing}`}
          alt=""
          className="w-32 h-32 object-cover rounded mt-2 mb-2 border border-green-500"
        />
      )}

      {editMode && (
        <input
          type="file"
          name={name}
          onChange={onChange}
          className="text-sm mt-1"
        />
      )}
    </div>
  );
}