import React from "react";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  MapPin,
  Globe,
  Phone,
  Mail,
  FileText,
  BadgeCheck,
  ShieldCheck,
  Ban,
  CalendarClock,
} from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";

function VendorBusinessDetail() {
  const navigate = useNavigate();
  const api = "http://localhost:5000";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      category: "",
      category_type: "",
      website: "",
      logo: "",
      address: "",
      druglicense: "",
      gstin: "",
      mobile: "",
      email: "",
      delivery_time_minutes: "",
      delivery_range_km: "",
      user_discount: "",
      company_discount: "",
      vendor_offer_user: "",
      company_offer_user: "",
      offer_start_date: "",
      offer_end_date: "",
      active: false,
      is_verified: false,
      verified_by: null,
      pan_card: null,
      bank_passbook: null,
      cancelled_cheque: null,
    },
  });

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        if (
          key !== "pan_card" &&
          key !== "bank_passbook" &&
          key !== "cancelled_cheque"
        ) {
          formData.append(key, data[key]);
        }
      });

      // Append files
      formData.append("pan_card", data.pan_card[0]);
      formData.append("bank_passbook", data.bank_passbook[0]);
      formData.append("cancelled_cheque", data.cancelled_cheque[0]);

      const response = await axios.post(
        `${api}/vendor/vendor/business/details`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );

      localStorage.setItem(
        "vendorBusinessMeta",
        JSON.stringify(response.data.data),
      );
      localStorage.setItem("applicant_id", response.data.data.applicant_id);

      navigate("/vendor/personal/detail");
    } catch (error) {
      console.error("Upload failed:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit vendor business details",
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between"> */}
      {/* <Link to="/vendors" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                    <ArrowLeft size={16} /> Back to Vendors
                </Link> */}
      {/* {!vendor && ( */}
      {/* <div className="text-xs text-gray-400"> */}
      {/* Vendor ID: <span className="text-gray-200">{vendor.id}</span> */}
      {/* </div> */}
      {/* )} */}
      {/* </div> */}

      {/* <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-semibold">{isNew ? "Add new Vendor" : form.name}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        {activeChip}
                        {verifiedChip}
                    </div>
                </div> */}

      {/* {msg && (
                <div className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                    {msg}
                </div>
            )} */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
          Business Profile
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Complete your business information to continue
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 rounded-2xl border border-slate-900 bg-white/5 p-6 shadow-lg shadow-violet-200"
      >
        {/* Business Info */}
        <Input
          label="Name"
          register={register("name", {
            required: "Vendor name is required",
            minLength: { value: 3, message: "Minimum 3 characters" },
          })}
          error={errors.name}
        />

        <Input
          label="Website"
          leftIcon={<Globe size={14} />}
          register={register("website", {
            pattern: {
              value: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}\/?$/,
              message: "Invalid website URL",
            },
          })}
          error={errors.website}
        />
        <Input
          label="Logo URL"
          leftIcon={<Globe size={14} />}
          register={register("logo", {
            pattern: {
              value: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}\/?.*$/,
              message: "Invalid logo URL",
            },
          })}
          error={errors.logo}
        />
        {/*Address */}
        <section>
          <h2 className="mb-4 text-[16px] font-semibold uppercase tracking-wide text-[#f72585]">
            Business Address
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <TextareaInput
              label="Address"
              register={register("address", {
                required: "Address is required",
                minLength: {
                  value: 10,
                  message: "Address must be at least 10 characters",
                },
              })}
              error={errors.address}
            />
          </div>
        </section>

        {/* Compliance & Contact */}
        <section>
          <h2 className="mb-4 text-[16px] font-semibold uppercase tracking-wide text-[#f72585]">
            Compliance & Contact
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Drug License */}
            <Input
              label="Drug License No."
              leftIcon={<FileText size={14} />}
              register={register("druglicense", {
                required: "Drug License number is required",
                minLength: {
                  value: 5,
                  message: "License number too short",
                },
              })}
              error={errors.druglicense}
            />

            {/* GSTIN */}
            <Input
              label="GSTIN"
              register={register("gstin", {
                required: "GSTIN is required",
                pattern: {
                  value:
                    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                  message: "Invalid GSTIN format",
                },
              })}
              error={errors.gstin}
            />

            {/* Mobile */}
            <Input
              label="Mobile"
              leftIcon={<Phone size={14} />}
              register={register("mobile", {
                required: "Mobile number is required",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Enter valid 10-digit Indian mobile number",
                },
              })}
              error={errors.mobile}
            />

            {/* Email */}
            <Input
              label="Email"
              leftIcon={<Mail size={14} />}
              register={register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email address",
                },
              })}
              error={errors.email}
            />
          </div>
        </section>
        {/*Category Section */}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Business Category */}
          <section>
            <h2 className="mb-4 text-[16px] font-semibold uppercase tracking-wide text-[#f72585]">
              Business Category
            </h2>

            <div className="grid gap-2">
              <select
                {...register("category", {
                  required: "Category is required",
                })}
                className={`w-full rounded-lg border bg-white/5 px-3 py-2 text-sm text-slate-900
        ${
          errors.category
            ? "border-red-500 focus:ring-red-500"
            : "border-slate-900 focus:ring-[#56cfe1]"
        }
        focus:outline-none focus:ring-1`}
                defaultValue=""
              >
                <option value="" disabled>
                  Select Business Category
                </option>
                <option value="pharmacy">Pharmacy</option>
                {/* <option value="pathology">Pathology</option> */}
                {/* <option value="surgery">Surgery</option>// */}
              </select>

              {errors.category && (
                <p className="text-xs text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>
          </section>

          {/* Business Category Type */}
          <section>
            <h2 className="mb-4 text-[16px] font-semibold uppercase tracking-wide text-[#f72585]">
              Business Category Type
            </h2>

            <div className="grid gap-3">
              <SelectInput
                label="Category Type"
                register={register("category_type", {
                  required: "Category type is required",
                })}
                error={errors.category_type}
                options={[
                  { label: "Retailer", value: "retailer" },
                  { label: "Wholesaler", value: "wholesaler" },
                  { label: "Super stockist ", value: "super stockist " },
                  { label: "Others ", value: "others " },
                ]}
              />
            </div>
          </section>
        </div>

        {/* Delivery */}
        <section>
          <h2 className="mb-4 text-[16px] font-semibold uppercase tracking-wide text-[#f72585]">
            Delivery SLA
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Delivery Time */}
            <Input
              label="Delivery Time (minutes)"
              type="number"
              register={register("delivery_time_minutes", {
                required: "Delivery time is required",
                valueAsNumber: true,
                min: {
                  value: 1,
                  message: "Minimum delivery time is 1 minute",
                },
                max: {
                  value: 240,
                  message: "Delivery time cannot exceed 240 minutes",
                },
              })}
              error={errors.delivery_time_minutes}
            />

            {/* Delivery Range */}
            <Input
              label="Delivery Range (km)"
              type="number"
              register={register("delivery_range_km", {
                required: "Delivery range is required",
                valueAsNumber: true,
                min: {
                  value: 0.5,
                  message: "Minimum delivery range is 0.5 km",
                },
                max: {
                  value: 50,
                  message: "Delivery range cannot exceed 50 km",
                },
              })}
              error={errors.delivery_range_km}
            />
          </div>
        </section>

        {/* Discounts / Offers */}
        <section>
          <h2 className="mb-4 text-[16px] font-semibold uppercase tracking-wide text-[#f72585]">
            Discounts & Offers (%)
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* User Discount */}
            <Input
              label="User Discount"
              type="number"
              register={register("user_discount", {
                valueAsNumber: true,
                min: { value: 0, message: "Minimum 0%" },
                max: { value: 100, message: "Maximum 100%" },
              })}
              error={errors.user_discount}
            />

            {/* Company Discount */}
            <Input
              label="Company Discount"
              type="number"
              register={register("company_discount", {
                valueAsNumber: true,
                min: { value: 0, message: "Minimum 0%" },
                max: { value: 100, message: "Maximum 100%" },
              })}
              error={errors.company_discount}
            />

            {/* Vendor Offer to Users */}
            <Input
              label="Vendor Offer to Users"
              type="number"
              register={register("vendor_offer_user", {
                valueAsNumber: true,
                min: { value: 0, message: "Minimum 0%" },
                max: { value: 100, message: "Maximum 100%" },
              })}
              error={errors.vendor_offer_user}
            />

            {/* Company Offer to Users */}
            <Input
              label="Company Offer to Users"
              type="number"
              register={register("company_offer_user", {
                valueAsNumber: true,
                min: { value: 0, message: "Minimum 0%" },
                max: { value: 100, message: "Maximum 100%" },
              })}
              error={errors.company_offer_user}
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Offer Start Date */}
            <Input
              label="Offer Start Date"
              type="date"
              register={register("offer_start_date", {
                required: "Offer start date is required",
              })}
              error={errors.offer_start_date}
            />

            {/* Offer End Date */}
            <Input
              label="Offer End Date"
              type="date"
              register={register("offer_end_date", {
                required: "Offer end date is required",
                validate: (endDate, formValues) =>
                  !formValues.offer_start_date ||
                  endDate >= formValues.offer_start_date ||
                  "End date must be after start date",
              })}
              error={errors.offer_end_date}
            />
          </div>
        </section>
        {/*Upload Document */}
        <section>
          <h2 className="mb-4 text-[16px] font-semibold uppercase tracking-wide text-[#f72585]">
            KYC Documents
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FileInput
              label="PAN Card"
              accept="image/*,.pdf"
              register={register("pan_card", {
                required: "PAN Card is required",
              })}
              error={errors.pan_card}
            />

            <FileInput
              label="Bank Passbook"
              accept="image/*,.pdf"
              register={register("bank_passbook", {
                required: "Bank Passbook is required",
              })}
              error={errors.bank_passbook}
            />

            <FileInput
              label="Cancelled Cheque"
              accept="image/*,.pdf"
              register={register("cancelled_cheque", {
                required: "Cancelled Cheque is required",
              })}
              error={errors.cancelled_cheque}
            />
          </div>
        </section>

        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm hover:bg-emerald-500"
          >
            {isSubmitting ? "Validating..." : "Next →"}
          </button>
        </div>
      </form>
    </div>
    // </div >
  );
}
function SelectInput({ label, register, error, options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-gray-400">{label}</span>

      <div
        className={`rounded-md border px-3
          ${error ? "border-red-500/50 bg-red-500/10" : "border-slate-900 bg-white/5"}
        `}
      >
        <select
          className="w-full bg-transparent py-2 outline-none text-slate-900"
          {...register}
        >
          <option value="">Select category</option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-black text-white"
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <span className="mt-1 block text-xs text-red-400">{error.message}</span>
      )}
    </label>
  );
}

function Input({ label, leftIcon, type = "text", register, error }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600 tracking-wide">
        {label}
      </span>

      <div
        className={`flex items-center gap-2 rounded-lg border px-3 transition-all duration-150
          ${
            error
              ? "border-red-500/60 bg-red-500/5 focus-within:ring-1 focus-within:ring-red-500"
              : "border-slate-900 bg-white/5 hover:border-slate-700 focus-within:border-[#56cfe1] focus-within:ring-1 focus-within:ring-[#56cfe1]"
          }
        `}
      >
        {leftIcon && <span className="text-slate-500">{leftIcon}</span>}

        <input
          type={type}
          className="w-full bg-transparent py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
          {...register}
        />
      </div>

      {error && (
        <span className="mt-1 block text-xs text-red-400">{error.message}</span>
      )}
    </label>
  );
}

function FileInput({ label, register, error, accept }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600 tracking-wide">
        {label}
      </span>

      <div
        className={`relative rounded-lg border px-3 py-2 transition-all duration-150
          ${
            error
              ? "border-red-500/60 bg-red-500/5 focus-within:ring-1 focus-within:ring-red-500"
              : "border-slate-900 bg-white/5 hover:border-slate-700 focus-within:border-[#56cfe1] focus-within:ring-1 focus-within:ring-[#56cfe1]"
          }
        `}
      >
        <input
          type="file"
          accept={accept}
          className="w-full cursor-pointer text-sm text-slate-600
            file:mr-4 file:rounded-md file:border-0
            file:bg-emerald-600 file:px-3 file:py-1.5
            file:text-xs file:font-semibold file:text-white
            hover:file:bg-emerald-500
            focus:outline-none"
          {...register}
        />
      </div>

      {error && (
        <span className="mt-1 block text-xs text-red-400">{error.message}</span>
      )}
    </label>
  );
}

function TextareaInput({ label, register, error }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600 tracking-wide">
        {label}
      </span>

      <div
        className={`rounded-lg border px-3 transition-all duration-150
          ${
            error
              ? "border-red-500/60 bg-red-500/5 focus-within:ring-1 focus-within:ring-red-500"
              : "border-slate-900 bg-white/5 hover:border-slate-700 focus-within:border-[#56cfe1] focus-within:ring-1 focus-within:ring-[#56cfe1]"
          }
        `}
      >
        <textarea
          rows={3}
          className="w-full bg-transparent py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none resize-none"
          {...register}
        />
      </div>

      {error && (
        <span className="mt-1 block text-xs text-red-400">{error.message}</span>
      )}
    </label>
  );
}

export default VendorBusinessDetail;
