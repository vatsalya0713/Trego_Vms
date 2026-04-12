import React, { useState } from "react";
import axios from "axios"
export default function Rider() {
    const [form, setForm] = useState({
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res=await axios.post("http://localhost:5000/rider/signup",
                form
            )
            alert(`OTP (TEMP MODE): ${res.data.otp}`);
            

        } catch (err) {
            console.log("err", err);
            res.status(500).json({ "Server Error Occur": err });
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-semibold">Create Rider</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/*=======Account Details=======*/}
                <div className="shadow rounded-xl p-6 space-y-6 border">
                    <h2 className="text-lg font-semibold text-white">
                        Account Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Username */}
                        <div>
                            <label className="block text-sm mb-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={form.username || ""}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email || ""}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password || ""}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        {/* Mobile + Send OTP */}
                        <div>
                            <label className="block text-sm mb-1">Mobile Number</label>
                            <div className="flex gap-2">
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={form.mobile}
                                    onChange={handleChange}
                                    className="w-full border rounded-md  focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!form.mobile) return alert("Enter mobile first");
                                        setOtpSent(true);
                                        alert("OTP Sent ✅ (Demo Mode)");
                                    }}
                                    className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700"
                                >
                                    Send OTP
                                </button>
                            </div>
                        </div>

                        {/* OTP Verification */}
                        {otpSent && (
                            <div className="md:col-span-2">
                                <label className="block text-sm mb-1">Enter OTP</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="Enter 6 digit OTP"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (otp.length === 6) {
                                                setOtpVerified(true);
                                                alert("OTP Verified 🎉");
                                            } else {
                                                alert("Invalid OTP");
                                            }
                                        }}
                                        className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
                                    >
                                        Verify
                                    </button>
                                </div>

                                {otpVerified && (
                                    <p className="text-green-600 text-sm mt-2">
                                        Mobile verified successfully ✅
                                    </p>
                                )}
                            </div>
                        )}

                    </div>
                </div>


                {/* ================= PERSONAL DETAILS ================= */}
                <div className=" shadow rounded-xl p-6 space-y-6 border">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Personal Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Name */}
                        <div>
                            <label className="block text-sm mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-sm mb-1">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={form.age}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm mb-1">Gender</label>
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2"
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Mobile */}
                        <div>
                            <label className="block text-sm mb-1">Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile"
                                value={form.mobile}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm mb-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        {/* Photo */}
                        <div>
                            <label className="block text-sm mb-1">Upload Photo</label>
                            <input
                                type="file"
                                name="photo"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* ================= VEHICLE DETAILS ================= */}
                <div className=" shadow rounded-xl p-6 space-y-6 border">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Vehicle Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Vehicle Number */}
                        <div>
                            <label className="block text-sm mb-1">Vehicle Number</label>
                            <input
                                type="text"
                                name="vehicleNumber"
                                value={form.vehicleNumber}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        {/* Vehicle License Number */}
                        <div>
                            <label className="block text-sm mb-1">
                                Vehicle License Number
                            </label>
                            <input
                                type="text"
                                name="vehicleLicenseNumber"
                                value={form.vehicleLicenseNumber}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        {/* Driving License Number */}
                        <div>
                            <label className="block text-sm mb-1">
                                Driving License Number
                            </label>
                            <input
                                type="text"
                                name="drivingLicenseNumber"
                                value={form.drivingLicenseNumber}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        {/* Vehicle Photo */}
                        <div>
                            <label className="block text-sm mb-1">Vehicle Photo</label>
                            <input
                                type="file"
                                name="vehiclePhoto"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full"
                                required
                            />
                        </div>

                        {/* Driving License Photo */}
                        <div>
                            <label className="block text-sm mb-1">
                                Driving License Photo
                            </label>
                            <input
                                type="file"
                                name="drivingLicensePhoto"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={!otpVerified}
                        className={`px-6 py-2 rounded-md text-white ${otpVerified
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Create Rider
                    </button>
                </div>

            </form>
        </div>
    );
}