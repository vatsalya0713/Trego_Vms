import { useForm } from "react-hook-form";
import React from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
function VendorPersonalDetail() {
  const navigate=useNavigate();
  const api="http://localhost:5000";

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      ownerName: "",
      age: "",
      gender: "",
      contactNo: "",
      address: "",
        profile_image: null,
      aadhaar_card: null,
    pan_card: null
    },
  });


 const onSubmit = async (data) => {
  try {
    const applicant_id = localStorage.getItem("applicant_id");
    const token = localStorage.getItem("token"); 

    if (!applicant_id) {
      alert("Applicant ID missing");
      return;
    }

    const formData = new FormData();

    formData.append("applicant_id", applicant_id);
    formData.append("ownerName", data.ownerName);
    formData.append("age", data.age);
    formData.append("gender", data.gender);
    formData.append("contactNo", data.contactNo);
    formData.append("address", data.address);

    formData.append("profile_image", data.profile_image[0]);
    formData.append("aadhaar_card", data.aadhaar_card[0]);
    formData.append("pan_card", data.pan_card[0]);

    await axios.post(
      `${api}/vendor/vendor/personal-detail`,
      formData,
      {
        headers: {
            Authorization: `Bearer ${token}`, 

          "Content-Type": "multipart/form-data"
        }
      }
    );

    alert("Personal Details Saved");
    navigate("/vendor/review");

  } catch (error) {
    console.error(error);
    alert("Failed to save personal details");
  }
};


  return (
    <AuthShell title="Vendor Registration" hint="Vendor Personal Information Form">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

        {/* Owner Name */}
        <Input
          placeholder="Owner Name"
          {...register("ownerName", { required: "Owner Name is required" })}
        />
        {errors.ownerName && <p className="text-red-400 text-sm">{errors.ownerName.message}</p>}

        {/* Age */}
        <Input
          type="number"
          placeholder="Age"
          {...register("age", {
            required: "Age is required",
            min: { value: 18, message: "Minimum age is 18" },
            max: { value: 80, message: "Maximum age is 80" }
          })}
        />
        {errors.age && <p className="text-red-400 text-sm">{errors.age.message}</p>}

        {/* Gender Dropdown */}
        <select
          className="w-full rounded-md border border-slate-900 bg-white/5 px-3 py-2 text-slate-900"
          {...register("gender", { required: "Select your gender" })}>
          <option value="" className="bg-white text-slate-900">-- Select Gender --</option>
          <option value="Male" className="bg-white text-slate-900">Male</option>
          <option value="Female" className="bg-white text-slate-900">Female</option>
          <option value="Other" className="bg-white text-slate-900">Other</option>
        </select>
        {errors.gender && <p className="text-red-400 text-sm">{errors.gender.message}</p>}

        {/* Contact Number */}
        <Input
          placeholder="Contact Number"
          maxLength={10}
          {...register("contactNo", {
            required: "Contact number is required",
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: "Enter valid 10 digit mobile number"
            }
          })}
        />
        {errors.contactNo && <p className="text-red-400 text-sm">{errors.contactNo.message}</p>}



        {/* Address */}
        <textarea
          placeholder="Full Address"
          className="w-full rounded-md border border-slate-900 bg-white/5 px-3 py-2 text-slate-900 outline-none focus:ring-[#56cfe1]"
          rows="3"
          {...register("address", { required: "Address is required" })}
        ></textarea>
        {errors.address && <p className="text-red-400 text-sm">{errors.address.message}</p>}
          {/* Profile Picture */}
<label className="m-2 text-xs font-semibold uppercase tracking-wide text-[#f72585]">Profile Picture</label>
<input
  type="file"
  accept="image/*"
  {...register("profile_image", {
    required: "Profile picture is required"
  })}
  className="w-full rounded-md border border-slate-900 bg-white/5 px-3 py-2 text-slate-600"
/>
{errors.profile_image && (
  <p className="text-red-400 text-sm">
    {errors.profile_image.message}
  </p>
)}
          {/* Aadhaar Card */}
  <label htmlFor="aadhar_card" className="m-2 text-xs font-semibold uppercase tracking-wide text-[#f72585]">Aadhar Card</label>
<input
placeholder="Aadhar Card"
  type="file"
  accept="image/*,.pdf"
  {...register("aadhaar_card", { required: "Aadhaar Card is required" })}
  className="w-full rounded-md border border-slate-900 bg-white/5 px-3 py-2 text-slate-600"
/>
{errors.aadhaar_card && (
  <p className="text-red-400 text-sm">{errors.aadhaar_card.message}</p>
)}

{/* PAN Card */}
  <label htmlFor="pan_card" className="m-2 text-xs font-semibold uppercase tracking-wide text-[#f72585]">PAN Card</label>
<input
placeholder="Upload PAN Card"
  type="file"
  accept="image/*,.pdf"
  {...register("pan_card", { required: "PAN Card is required" })}
  className="w-full rounded-md border border-slate-900 bg-white/5 px-3 py-2 text-slate-600"
/>
{errors.pan_card && (
  <p className="text-red-400 text-sm">{errors.pan_card.message}</p>
)}

        {/* Submit */}
        <button className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500">
          Next
        </button>
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, hint, children }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-900 bg-white/5 p-6 mt-12 shadow-lg shadow-violet-200">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

const Input = React.forwardRef(({ onChange, onBlur, name, placeholder, type = "text", className }, ref) => (
  <input
    ref={ref}
    name={name}
    onBlur={onBlur}
    onChange={onChange}
    placeholder={placeholder}
    type={type}
    className={`w-full rounded-md border border-slate-900 bg-white/5 px-3 py-2 text-slate-900 placeholder-slate-400 outline-none focus:ring-[#56cfe1] ${className}`}
  />
));

export default VendorPersonalDetail;
