import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

export default function VendorDetailReview() {
  const navigate = useNavigate();
  const applicant_id = localStorage.getItem("applicant_id");

  const [data, setData] = useState(null);
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState({ ...data });
const [editMode, setEditMode] = useState(false);
const api="http://localhost:5000";
const {
  register,
  getValues,
  reset
} = useForm();

  useEffect(() => {
    if (!applicant_id) return;

    axios
      .get(`${api}/vendor/vendor/application/${applicant_id}`)
      .then((res) => {
        setData(res.data);
          setFormData(res.data); //  copy for editing

        setEditable(res.data.editable);
            reset(res.data);

      })
      .catch(() => alert("Failed to load application"))
      .finally(() => setLoading(false));
  }, [applicant_id]);

  //edit button

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleSaveEdit = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `${api}/vendor/vendor/business/update`,
      {
        applicant_id,
        ...getValues()
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("Changes saved");
    setEditMode(false);

    // reload updated data
    const res = await axios.get(
      `${api}/vendor/vendor/application/${applicant_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setData(res.data);
    reset(res.data);

  } catch (err) {
    alert(err.response?.data?.message || "Update failed");
  }
};




  const handleSubmit = async () => {
    try {
      const token=localStorage.getItem("token");
      await axios.post(`${api}/vendor/vendor/application/submit`, {
        applicant_id
      },
    {
      headers:{
        Authorization: `Bearer ${token}`
      }
    });

      alert("Your request has been generated successfully. Please wait for approval.");
      navigate("/vendor/review");
    } catch (err) {
      alert(err.response?.data?.message || "Submit failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!data) return <p className="text-center mt-10">No application found</p>;
  const canEdit = data.status === "DRAFT" && editable;

  return (
    <div className="max-w-4xl mx-auto mt-10 rounded-2xl border border-slate-900 bg-white/5 p-6 shadow-lg shadow-violet-200">
      <h1 className="text-2xl font-semibold mb-2 text-slate-900">Review Vendor Application</h1>

      <StatusBadge status={data.status} />

      {/* BUSINESS DETAILS */}
  <Section title="Business Details">

  {/* Basic Info */}
  <ReviewField
    label="Name"
    name="name"
    value={data.ref_name}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="Vendor ID"
    value={data.vendor_id}
    disabled
  />

  <ReviewField
    label="Category"
    name="category"
    value={data.category}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="Category Type"
    name="category_type"
    value={data.category_type}
    editMode={editMode}
    register={register}
  />

  {/* Address */}
  <ReviewField
    label="Business Address"
    name="address"
    type="textarea"
    value={data.address}
    editMode={editMode}
    register={register}
  />

  {/* Online Presence */}
  <ReviewField
    label="Website"
    name="website"
    value={data.website}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="Logo URL"
    name="logo"
    value={data.logo}
    editMode={editMode}
    register={register}
  />

  {/* Compliance */}
  <ReviewField
    label="Drug License No."
    name="druglicense"
    value={data.druglicense}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="GSTIN"
    name="gstin"
    value={data.gstin}
    editMode={editMode}
    register={register}
  />

  {/* Contact */}
  <ReviewField
    label="Mobile"
    name="mobile"
    value={data.mobile}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="Email"
    name="email"
    value={data.email}
    editMode={editMode}
    register={register}
  />

  {/* Delivery SLA */}
  <ReviewField
    label="Delivery Time (minutes)"
    name="delivery_time_minutes"
    type="number"
    value={data.delivery_time_minutes}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="Delivery Range (km)"
    name="delivery_range_km"
    type="number"
    value={data.delivery_range_km}
    editMode={editMode}
    register={register}
  />

  {/* Discounts */}
  <ReviewField
    label="User Discount (%)"
    name="user_discount"
    type="number"
    value={data.user_discount}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="Company Discount (%)"
    name="company_discount"
    type="number"
    value={data.company_discount}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="Vendor Offer to Users (%)"
    name="vendor_offer_user"
    type="number"
    value={data.vendor_offer_user}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="Company Offer to Users (%)"
    name="company_offer_user"
    type="number"
    value={data.company_offer_user}
    editMode={editMode}
    register={register}
  />

  {/* Offers */}
  <ReviewField
    label="Offer Start Date"
    name="offer_start_date"
    value={data.offer_start_date}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="Offer End Date"
    name="offer_end_date"
    value={data.offer_end_date}
    editMode={editMode}
    register={register}
  />

</Section>



      {/* PERSONAL DETAILS */}
<Section title="Personal Details">

  <ReviewField
    label="Owner Name"
    name="owner_name"
    value={data.owner_name}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="Age"
    name="age"
    value={data.age}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="Gender"
    name="gender"
    value={data.gender}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="Contact Number"
    name="contact_no"
    value={data.contact_no}
    editMode={editMode}
    register={register}
  />

  <ReviewField
    label="Personal Address"
    name="address"        
    value={data.address}  
    editMode={editMode}
    register={register}
  />

</Section>



      {/* ACTION BUTTONS */}
<div className="mt-6 flex justify-end gap-3">

  {/* STATE 1: REVIEW MODE */}
  {!editMode && canEdit  && (
    <>
      <button
        onClick={() => setEditMode(true)}
        className="rounded-md bg-blue-600 px-4 py-2 hover:bg-blue-500"
      >
        Edit
      </button>

      <button
        onClick={handleSubmit}
        className="rounded-md bg-emerald-600 px-4 py-2 hover:bg-emerald-500"
      >
        Submit for Approval
      </button>
    </>
  )}

  {/* STATE 2: EDIT MODE */}
  {editMode && (
    <>
      <button
        onClick={() => setEditMode(false)}
        className="rounded-md bg-gray-600 px-4 py-2 hover:bg-gray-500"
      >
        Cancel
      </button>

      <button
        onClick={handleSaveEdit}
        className="rounded-md bg-emerald-600 px-4 py-2 hover:bg-emerald-500"
      >
        Save Changes
      </button>
    </>
  )}

  {/* STATE 3: LOCKED */}
  {!canEdit  && (
    <p className="text-sm text-yellow-400">
      Your application is locked and under review.
    </p>
  )}

</div>


    </div>
  );
}


function Section({ title, children }) {
  return (
    <div className="mt-6">
      <h2 className="mb-3 text-[16px] font-semibold uppercase tracking-wide text-[#f72585]">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function ReviewField({ label, value, name, editMode, register }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>

      {!editMode ? (
        <p className="rounded-md bg-white/5 border border-slate-900 px-3 py-2 text-sm text-slate-900">
          {value || "-"}
        </p>
      ) : (
        <input
          {...register(name)}
          defaultValue={value}
          className="w-full rounded-md border border-slate-900 bg-white/5 px-3 py-2 text-sm text-slate-900 focus:ring-[#56cfe1] outline-none"
        />
      )}
    </div>
  );
}



function StatusBadge({ status }) {
  const colors = {
    DRAFT: "bg-gray-600",
    PENDING_APPROVAL: "bg-yellow-600",
    APPROVED: "bg-emerald-600",
    REJECTED: "bg-red-600"
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium text-white ${colors[status]}`}
    >
      {status}
    </span>
  );
}
