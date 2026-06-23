import { useEffect, useState } from "react";
import axios from "axios";

export default function VendorProfile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const api = "http://localhost:5000";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${api}/vendor/vendor/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Profile fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ---------- GUARDS ---------- */

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>No profile found</p>;

  if (profile.status !== "APPROVED") {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <div className="bg-yellow-600/20 border border-yellow-600 text-yellow-300 p-4 rounded">
          <p className="font-medium">Profile not approved</p>
          <p className="text-sm">
            Current status: <b>{profile.status}</b>
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    await axios.put(`${api}/vendor/vendor/business/update`, profile, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEditMode(false);
    alert("Profile updated");
  };

  /* ---------- UI ---------- */

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-[#f72585]">My Profile</h1>

      <span className="px-3 py-1 bg-green-600 rounded text-xs">
        {profile.status}
      </span>

      {/* BUSINESS DETAILS */}
      <Section title="Business Details">
        <Field
          label="Vendor ID"
          name="vendor_id"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="Business Name"
          name="ref_name"
          {...{ profile, editMode, handleChange }}
        />
        <Field
          label="Category"
          name="category"
          {...{ profile, editMode, handleChange }}
        />
        <Field
          label="Category Type"
          name="category_type"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="Email"
          name="email"
          {...{ profile, editMode, handleChange }}
        />
        <Field
          label="Mobile"
          name="mobile"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="GSTIN"
          name="gstin"
          {...{ profile, editMode, handleChange }}
        />
        <Field
          label="Drug License No"
          name="druglicense"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="Website"
          name="website"
          {...{ profile, editMode, handleChange }}
        />
        <Field
          label="Logo URL"
          name="logo"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="Delivery Time (minutes)"
          name="delivery_time_minutes"
          {...{ profile, editMode, handleChange }}
        />
        <Field
          label="Delivery Range (km)"
          name="delivery_range_km"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="Latitude"
          name="lat"
          {...{ profile, editMode, handleChange }}
        />
        <Field
          label="Longitude"
          name="lng"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="User Discount (%)"
          name="user_discount"
          {...{ profile, editMode, handleChange }}
        />
        <Field
          label="Company Discount (%)"
          name="company_discount"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="Vendor Offer (%)"
          name="vendor_offer_user"
          {...{ profile, editMode, handleChange }}
        />
        <Field
          label="Company Offer (%)"
          name="company_offer_user"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="Offer Start Date"
          name="offer_start_date"
          {...{ profile, editMode, handleChange }}
        />
        <Field
          label="Offer End Date"
          name="offer_end_date"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="Verified By"
          name="verified_by"
          {...{ profile, editMode, handleChange }}
        />
        <Field
          label="Is Verified"
          name="is_verified"
          {...{ profile, editMode, handleChange }}
        />
        <Field
          label="Active"
          name="active"
          {...{ profile, editMode, handleChange }}
        />

        {/* FILE PATH DISPLAY (READ-ONLY) */}
        <Field
          label="PAN Card"
          name="pan_card"
          {...{ profile, editMode: false }}
        />
        <Field
          label="Bank Passbook"
          name="bank_passbook"
          {...{ profile, editMode: false }}
        />
        <Field
          label="Cancelled Cheque"
          name="cancelled_cheque"
          {...{ profile, editMode: false }}
        />

        <Field
          label="Business Address"
          name="address"
          textarea
          {...{ profile, editMode, handleChange }}
        />
      </Section>

      {/* PERSONAL DETAILS */}
      <Section title="Personal Details">
        <Field
          label="Owner Name"
          name="owner_name"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="Age"
          name="age"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="Gender"
          name="gender"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="Contact Number"
          name="contact_no"
          {...{ profile, editMode, handleChange }}
        />

        <Field
          label="Residential Address"
          name="personal_address"
          textarea
          {...{ profile, editMode, handleChange }}
        />

        {/* FILE PATHS – READ ONLY */}
        <Field
          label="Aadhaar Card"
          name="aadhaar_card"
          profile={profile}
          editMode={false}
        />

        <Field
          label="PAN Card"
          name="pan_card"
          profile={profile}
          editMode={false}
        />
      </Section>

      {/* ACTIONS */}
      {profile.editable && (
        <div className="flex gap-3">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 px-4 py-2 rounded"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-600 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="bg-emerald-600 px-4 py-2 rounded"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- UI HELPERS ---------- */

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-medium mb-3 text-slate-900">{title}</h2>
      <div className="grid grid-cols-2 gap-3 text-slate-900 ">{children}</div>
    </div>
  );
}

function Field({ label, name, profile, editMode, handleChange, textarea }) {
  return (
    <div>
      <p className="text-sm font-medium text-[#56cfe1]">{label}</p>
      {!editMode ? (
        <p className="bg-white/5 px-3 py-2 rounded text-sm text-slate-900">
          {profile[name] || "-"}
        </p>
      ) : textarea ? (
        <textarea
          name={name}
          value={profile[name] || ""}
          onChange={handleChange}
          className="w-full bg-gray-900 border px-3 py-2 rounded "
        />
      ) : (
        <input
          name={name}
          value={profile[name] || ""}
          onChange={handleChange}
          className="w-full border-slate-900 border-1 px-3 py-2 rounded "
        />
      )}
    </div>
  );
}
