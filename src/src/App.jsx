import { Routes, Route, useNavigate, Link } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Admins from "./pages/Admins";
import AdminDetails from "./pages/AdminDetails";
import Vendors from "./pages/Vendors";
import VendorDetails from "./pages/Vendor/VendorDetails"
import Settings from "./pages/Settings";
import LoginSuperAdmin from "./pages/auth/SuperAdminLogin";
import AdminLogin from "./pages/auth/AdminLogin";
import VendorLogin from "./pages/auth/VendorLogin";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./components/Layout/AppLayout";
import React, { useEffect, useState } from "react";
import Medicine from "./pages/Medicine";
import MedicineDetails from "./pages/MedicineDetails";
import VendorSign from "./pages/auth/VendorSign";
import VendorOtpPage from "./pages/auth/VendorOtpPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VendorPersonalDetail from "./pages/Vendor/VendorPersonalDetail";
import VendorBusinessDetail from "./pages/Vendor/VendorBusinessDetail";
import VendorDetailReview from "./pages/Vendor/VendorDetailReview";
import AdminVendorVerify from "./pages/AdminVendorVerify";
import VendorsRedirect from "./pages/Vendor/VendorRedirect";
import VendorMedicine from "./pages/Vendor/VendorMedicine";
import Profile from "./pages/Vendor/VendorProfile";
import VendorBucketMedicines from "./pages/Vendor/VendorBucketMedicine";
import OrderManagement from "./pages/OrderManagement/OrderManagement";
import DeliveryManagement from "./pages/DeliveryManagement/DeliveryManagement";
import PendingOrders from "./pages/OrderManagement/PendingOrders";
import NewOrder from "./pages/OrderManagement/NewOrder";
import OutForDelivery from "./pages/DeliveryManagement/OutForDelivery.jsx";
import Assign from "./pages/OrderManagement/Assign";
import CancelledOrder from "./pages/DeliveryManagement/CancelledOrder";
import Rider from "./pages/OrderManagement/Rider";
import RiderSignup from "./pages/auth/RiderSignup.jsx";
import RiderDetails from "./pages/Rider/RiderDetails.jsx";
import RiderLogin from "./pages/auth/RiderLogin.jsx"
import RiderOtp from "./pages/auth/RiderOtp.jsx"
import RiderList from "./pages/Rider/RiderList.jsx";
import RiderDashboard from "./pages/Rider/RiderDashboard.jsx";
import RiderDetaillogin from "./pages/Rider/RiderDetaillogin.jsx";
import RiderReview from "./pages/Rider/RiderReview.jsx";
import NotFound from "../resuable/NotFound.jsx";
// (Optional) import Header from "./components/Layout/Header"; // pre-login header

export default function App() {

  const [data, setData] = useState("");
  // useEffect(()=>{
  //   axios.get("http://localhost:5000/auth/register-super-admin")
  //   .then((response)=>{setData(response.data.message)})
  //   .catch((error)=>{console.log(error)});
  //   })

  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const doLogout = () => { logout(); navigate("/", { replace: true }); };

  return (
    <div className="
    text-white min-h-screen">
      {/* Pre-login header (optional) */}
      {/* {!user && (
        <div className="border-1 border-gray-800 bg-gray-800 px-6 py-3">
          <div className="mx-auto max-w-6xl flex items-center justify-between text-sm">
            <div className="font-semibold">Traco<span className="text-indigo-400">Admin</span></div>
            <div className="flex gap-4">
              <Link to="/login/super-admin">Super Admin Login</Link>
              <a href="/login/admin">Admin Login</a>
              <a href="/login/vendor">Vendor Login</a>
              <a href="/login/rider">Rider Login</a>

            </div>
          </div>
        </div>
      )} */}

      <Routes>

        <Route path="/" element={<Home />} />

        {/* Protected Dashboard Layout */}
        <Route element={<AppLayout onLogout={doLogout} />}>

          {/* Shared: All logged in users */}
          <Route element={<ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "VENDOR"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />

          </Route>

          {/* SUPER_ADMIN ONLY */}
          <Route element={<ProtectedRoute roles={["SUPER_ADMIN"]} />}>
            <Route path="/admins" element={<Admins />} />
            <Route path="/admins/:id" element={<AdminDetails />} />
            <Route path="/medicine" element={<Medicine />} />
            <Route path="/medicine/:id" element={<MedicineDetails />} />
            <Route path="/users" element={<NotFound/>} />
            <Route path="/basket" element={<NotFound/>} />
          </Route>

          {/* ADMIN + SUPER_ADMIN */}
          <Route element={<ProtectedRoute roles={["SUPER_ADMIN", "ADMIN"]} />}>
            <Route path="/vendors" element={<VendorsRedirect />} />
            <Route path="/vendors/list" element={<Vendors />} />
            <Route path="/vendors/add" element={<VendorDetails />} />
            <Route path="/vendors/:id" element={<VendorDetails />} />
            <Route path="/vendors/detail" element={<VendorDetails />} />
          </Route>

          {/* ADMIN ONLY */}
          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/vendors/admin/verify" element={<AdminVendorVerify />} />
          </Route>

          {/* VENDOR ROUTES (MOVED HERE) */}
          <Route element={<ProtectedRoute roles={["VENDOR"]} />}>
            <Route path="/vendor/medicine" element={<VendorMedicine />} />
            <Route
              path="/vendor/bucket/:id"
              element={<VendorBucketMedicines />}
            />
          </Route>
          <Route path="/vendor/profile" element={<Profile />} />
          <Route path="/vendor/order/management" element={<OrderManagement />} />
          <Route path="/vendor/order/pending" element={<PendingOrders />} />
          <Route path="/vendor/order/new" element={<NewOrder />} />

          <Route path="/vendor/delivery/list" element={<DeliveryManagement />} />
          <Route path="/vendor/order/outfordelivery" element={<DeliveryManagement />} />
          <Route path="/vendor/order/assign" element={<DeliveryManagement />} />
          <Route path="/vendor/delivery/delivered" element={<DeliveryManagement />} />
          <Route path="/vendor/delivery/cancelled" element={<DeliveryManagement />} />
          <Route path="/vendor/order/rider/create" element={<Rider />} />
          <Route path="/vendor/order/rider/list" element={<RiderList/>}/>
          
          {/* <Route path="/vender/c"/> */}
        </Route>

        {/*Rider Dashboard */}
        <Route path="/rider/dashboard" element={<RiderDashboard/>}/>
        {/* Auth Routes (outside layout) */}
        <Route path="/login/super-admin" element={<LoginSuperAdmin />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/login/vendor" element={<VendorLogin />} />
        <Route path="/login/rider" element={<RiderLogin />} />
        <Route path="/sign/vendor" element={<VendorSign />} />
        <Route path="/sign/rider" element={<RiderSignup/>}/>
        <Route path="/rider/otp" element={<RiderOtp />} />
        <Route path="/vendor/otp" element={<VendorOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/vendor/personal/detail" element={<VendorPersonalDetail />} />
        <Route path="/vendor/business/detail" element={<VendorBusinessDetail />} />
        <Route path="/rider/details" element={<RiderDetails/>}/>
       <Route path="/rider/login/detail" element={<RiderDetaillogin/>}/>
        <Route path="/rider/review" element={<RiderReview/>}/>
        <Route path="/vendor/review" element={<VendorDetailReview />} />
      </Routes>

    </div>
  );
}