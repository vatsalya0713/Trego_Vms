import { useForm } from "react-hook-form";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function VendorSign() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            username: "",
            email: "",
            mobileNo: "",
            password: "",
            confirmPassword: ""
        },
    });

    const [showOTP, setShowOTP] = useState(false);
    const [mobileNo, setMobileNo] = useState("");
    const [otp, setOtp] = useState("");
    const api="http://localhost:5000";
    const navigate = useNavigate();
    const sendOTP = async (data) => {
        try {
            const res = await axios.post(
                `${api}/vendor/sign`,
                data
            );

            alert(`OTP (TEMP MODE): ${res.data.otp}`);

            navigate("/vendor/otp", {
                state: { mobileNo: data.mobileNo }
            });

        } catch (err) {
            alert(err.response?.data?.msg || "Something went wrong");
        }
    };


    return (
        <AuthShell title="Vendor Sign-Up" hint="Access vendor dashboard">
            {!showOTP ? (
                <form onSubmit={handleSubmit(sendOTP)} className="space-y-3">

                    <Input placeholder="Username" {...register("username", { required: "Username is required" })} />
                    {errors.username && <p className="text-red-400 text-sm">{errors.username.message}</p>}

                    <Input placeholder="Email" {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/, message: "Email must be @gmail.com" }
                    })} />
                    {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}

                    <Input placeholder="Mobile Number" {...register("mobileNo", {
                        required: "Mobile is required", pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: "Enter valid 10 digit mobile number"
                        }
                    })} />
                    {errors.mobileNo && <p className="text-red-400 text-sm">{errors.mobileNo.message}</p>}

                    <Input type="password" placeholder="Create Password" {...register("password", { required: "Password is required" })} />
                    <Input type="password" placeholder="Confirm Password" {...register("confirmPassword", { required: "Confirm Password" })} />

                    <button className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500">
                        Send OTP
                    </button>
                </form>
            ) : (
                // OTP Input UI
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-yellow-400">Enter OTP sent to {mobileNo}</h2>
                    <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                    />


                    <button onClick={verifyOTP} className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500">
                        Verify OTP
                    </button>
                </div>
            )}
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
    <input ref={ref} name={name} onBlur={onBlur} onChange={onChange} placeholder={placeholder} type={type}
        className={`w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 ${className}`} />
));

export default VendorSign;
