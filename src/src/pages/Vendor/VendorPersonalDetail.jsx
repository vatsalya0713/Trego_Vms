import { useForm } from "react-hook-form";
import React from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
function VendorPersonalDetail() {
  const navigate=useNavigate();

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
      "http://localhost:5000/vendor/vendor/personal-detail",
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
          className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2"
          {...register("gender", { required: "Select your gender" })}>
          <option value="">-- Select Gender --</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
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
          className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2"
          rows="3"
          {...register("address", { required: "Address is required" })}
        ></textarea>
        {errors.address && <p className="text-red-400 text-sm">{errors.address.message}</p>}
          {/* Profile Picture */}
<label className="m-2">Profile Picture</label>
<input
  type="file"
  accept="image/*"
  {...register("profile_image", {
    required: "Profile picture is required"
  })}
  className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2"
/>
{errors.profile_image && (
  <p className="text-red-400 text-sm">
    {errors.profile_image.message}
  </p>
)}
          {/* Aadhaar Card */}
  <label htmlFor="aadhar_card" className="m-2">Aadhar Card</label>
<input
placeholder="Aadhar Card"
  type="file"
  accept="image/*,.pdf"
  {...register("aadhaar_card", { required: "Aadhaar Card is required" })}
  className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2"
/>
{errors.aadhaar_card && (
  <p className="text-red-400 text-sm">{errors.aadhaar_card.message}</p>
)}

{/* PAN Card */}
  <label htmlFor="pan_card" className="m-2">PAN Card</label>
<input
placeholder="Upload PAN Card"
  type="file"
  accept="image/*,.pdf"
  {...register("pan_card", { required: "PAN Card is required" })}
  className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2"
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
    <div className="mx-auto max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 mt-12">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {hint && <p className="mt-1 text-sm text-gray-400">{hint}</p>}
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
    className={`w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 ${className}`}
  />
));

export default VendorPersonalDetail;
