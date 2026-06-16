import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Users, CheckCircle, Clock, XCircle, Search, RefreshCw,
  Eye, Check, X, Phone, Mail, Calendar, MapPin, Award,
  FileText, ShieldCheck, User, Truck, ClipboardList, AlertCircle, Plus
} from "lucide-react";

const API = "http://localhost:5000";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function RiderList() {
  const [activeTab, setActiveTab] = useState("PENDING_APPROVAL");
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRider, setSelectedRider] = useState(null); // rider info for detail view
  const [detailLoading, setDetailLoading] = useState(false);
  const [riderDetails, setRiderDetails] = useState(null); // fetched detailed info
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [toast, setToast] = useState(null);

  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    mobileNo: "",
    password: "",
    confirmPassword: ""
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState("");
  const [tempOtp, setTempOtp] = useState(""); // to display the dev mode OTP to user
  const [registerLoading, setRegisterLoading] = useState(false);

  /* ── SHOW TOAST ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── FETCH RIDERS ── */
  const fetchRiders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/rider/admin/list?status=${activeTab}`,
        authHeaders()
      );
      setRiders(res.data || []);
    } catch (err) {
      console.error("Fetch riders error:", err);
      showToast("Failed to fetch riders list", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  /* ── FETCH COUNTS FOR STATS ── */
  const fetchStats = useCallback(async () => {
    try {
      const [pRes, aRes, rRes] = await Promise.all([
        axios.get(`${API}/rider/admin/list?status=PENDING_APPROVAL`, authHeaders()),
        axios.get(`${API}/rider/admin/list?status=APPROVED`, authHeaders()),
        axios.get(`${API}/rider/admin/list?status=REJECTED`, authHeaders())
      ]);
      setStats({
        pending: pRes.data?.length || 0,
        approved: aRes.data?.length || 0,
        rejected: rRes.data?.length || 0,
      });
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  }, []);

  useEffect(() => {
    fetchRiders();
    fetchStats();
  }, [fetchRiders, fetchStats]);

  /* ── APPROVE / REJECT ACTION ── */
  const handleRiderAction = async (id, action) => {
    try {
      const endpoint = action === "APPROVED" ? "approve" : "reject";
      await axios.post(
        `${API}/rider/${endpoint}`,
        { applicant_id: id },
        authHeaders()
      );
      showToast(
        action === "APPROVED" ? "Rider approved successfully ✓" : "Rider application rejected",
        action === "APPROVED" ? "success" : "info"
      );
      setSelectedRider(null);
      setRiderDetails(null);
      fetchRiders();
      fetchStats();
    } catch (err) {
      console.error("Action error:", err);
      showToast("Operation failed", "error");
    }
  };

  /* ── OPEN RIDER REVIEW MODAL ── */
  const openReviewModal = async (rider) => {
    setSelectedRider(rider);
    setDetailLoading(true);
    setRiderDetails(null);
    try {
      const res = await axios.get(`${API}/rider/application/${rider.user_id}`, authHeaders());
      setRiderDetails(res.data || null);
    } catch (err) {
      console.error("Failed to load details:", err);
      showToast("No additional application details submitted yet.", "info");
    } finally {
      setDetailLoading(false);
    }
  };

  /* ── HANDLE REGISTER CHANGE ── */
  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  /* ── SUBMIT SIGNUP (STEP 1) ── */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      return showToast("Passwords do not match", "error");
    }
    setRegisterLoading(true);
    try {
      const res = await axios.post(`${API}/rider/signup`, registerForm);
      setOtpSent(true);
      setTempOtp(res.data.otp || "");
      showToast("Verification OTP sent successfully ✓");
    } catch (err) {
      console.error("Signup error:", err);
      showToast(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setRegisterLoading(false);
    }
  };

  /* ── VERIFY OTP (STEP 2) ── */
  const handleVerifyOtp = async () => {
    if (!otpVal) return showToast("Enter OTP code", "error");
    setRegisterLoading(true);
    try {
      await axios.post(`${API}/rider/verify`, {
        mobileNo: registerForm.mobileNo,
        otp: otpVal
      });
      showToast("Rider account created & verified successfully ✓");
      // Reset registration states
      setShowRegisterModal(false);
      setOtpSent(false);
      setOtpVal("");
      setTempOtp("");
      setRegisterForm({
        username: "",
        email: "",
        mobileNo: "",
        password: "",
        confirmPassword: ""
      });
      fetchRiders();
      fetchStats();
    } catch (err) {
      console.error("Verify OTP error:", err);
      showToast(err.response?.data?.message || "Invalid or expired OTP", "error");
    } finally {
      setRegisterLoading(false);
    }
  };

  /* ── SEARCH FILTER ── */
  const filteredRiders = riders.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      String(r.user_id).includes(q) ||
      (r.username || "").toLowerCase().includes(q) ||
      (r.mobileNo || "").includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      
      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all
          ${toast.type === "error" ? "bg-red-500" : toast.type === "info" ? "bg-amber-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <AlertCircle size={16}/> : <Check size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rider Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your delivery personnel, review document submissions, and authorize riders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm font-semibold text-white shadow-md transition"
          >
            <Plus size={16}/> Register Rider
          </button>
          <button
            onClick={() => { fetchRiders(); fetchStats(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition"
          >
            <RefreshCw size={14}/> Refresh List
          </button>
        </div>
      </div>

      {/* ── STATS SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending Approvals", value: stats.pending, icon: Clock, color: "amber" },
          { label: "Authorized Riders", value: stats.approved, icon: ShieldCheck, color: "green" },
          { label: "Rejected Applicants", value: stats.rejected, icon: XCircle, color: "red" },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{c.label}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{c.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${
                c.color === "amber" ? "bg-amber-50 text-amber-600" :
                c.color === "green" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}>
                <Icon size={24}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── TABS AND SEARCH ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        {/* Tabs */}
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-fit">
          {[
            { key: "PENDING_APPROVAL", label: "Pending Requests", count: stats.pending, color: "amber" },
            { key: "APPROVED",         label: "Approved Riders",  count: stats.approved, color: "green" },
            { key: "REJECTED",         label: "Rejected Applications", count: stats.rejected, color: "red" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all
                ${activeTab === tab.key
                  ? tab.color === "amber" ? "bg-amber-500 text-white" :
                    tab.color === "green" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, Username..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
      </div>

      {/* ── RIDERS TABLE ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <RefreshCw size={18} className="animate-spin"/> Loading riders list…
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <Users size={40} className="opacity-30"/>
            <p className="font-semibold">No riders found in this list</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["S.No", "Rider ID", "Username", "Mobile Number", "Submitted At", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRiders.map((rider, index) => {
                  const submittedDate = rider.submitted_at
                    ? new Date(rider.submitted_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    : "—";

                  return (
                    <tr key={rider.user_id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-medium">{index + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-violet-600">#{rider.user_id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-xs">
                            {(rider.username || "R")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{rider.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">{rider.mobileNo || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{submittedDate}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          activeTab === "APPROVED"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : activeTab === "PENDING_APPROVAL"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {activeTab === "APPROVED" ? "Approved" : activeTab === "PENDING_APPROVAL" ? "Pending Approval" : "Rejected"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openReviewModal(rider)}
                            className="p-1.5 rounded-lg hover:bg-violet-50 text-violet-500 transition-all flex items-center gap-1 text-xs font-bold border border-transparent hover:border-violet-200"
                            title="Review Application"
                          >
                            <Eye size={14}/> Review & Verify
                          </button>

                          {activeTab === "PENDING_APPROVAL" && (
                            <>
                              <button
                                onClick={() => handleRiderAction(rider.user_id, "APPROVED")}
                                className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-all border border-transparent hover:border-green-200"
                                title="Approve Rider"
                              >
                                <Check size={14}/>
                              </button>
                              <button
                                onClick={() => handleRiderAction(rider.user_id, "REJECTED")}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all border border-transparent hover:border-red-200"
                                title="Reject Rider"
                              >
                                <X size={14}/>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DETAIL & REVIEW MODAL ── */}
      {selectedRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Verify Rider Application</h2>
                <p className="text-xs text-gray-400">Review documents and profile info for #{selectedRider.user_id}</p>
              </div>
              <button
                onClick={() => { setSelectedRider(null); setRiderDetails(null); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
              >
                <X size={18}/>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {detailLoading ? (
                <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
                  <RefreshCw size={18} className="animate-spin"/> Fetching complete profile info…
                </div>
              ) : riderDetails ? (
                <div className="space-y-6">
                  {/* Photo & Profile Intro */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-violet-500 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      {riderDetails.photo ? (
                        <img src={riderDetails.photo} alt="Rider Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={40} className="text-gray-400"/>
                      )}
                    </div>
                    <div className="text-center sm:text-left min-w-0">
                      <h3 className="font-bold text-lg text-gray-800 truncate">{riderDetails.full_name || selectedRider.username}</h3>
                      <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                        <MapPin size={13}/> {riderDetails.location || "Location not provided"}
                      </p>
                      <div className="flex gap-2 flex-wrap justify-center sm:justify-start mt-2">
                        <a href={`tel:${riderDetails.mobile || selectedRider.mobileNo}`} className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
                          <Phone size={11}/> {riderDetails.mobile || selectedRider.mobileNo}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Personal & Vehicle Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-2">Personal Information</p>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p><span className="text-gray-400 font-medium">Age:</span> {riderDetails.age || "—"}</p>
                        <p><span className="text-gray-400 font-medium">Gender:</span> {riderDetails.gender || "—"}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-2">Vehicle Information</p>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p><span className="text-gray-400 font-medium">Vehicle Number:</span> {riderDetails.vehicle_number || "—"}</p>
                        <p><span className="text-gray-400 font-medium">DL Number:</span> {riderDetails.driving_license_number || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Documents Grid */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-2.5 flex items-center gap-1.5">
                      <FileText size={15} className="text-violet-500"/> Submitted Documents & Photos
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Driving License", path: riderDetails.driving_license_photo },
                        { label: "Vehicle Photo", path: riderDetails.vehicle_photo },
                        { label: "Aadhar Card", path: riderDetails.aadhar_card },
                        { label: "PAN Card", path: riderDetails.pancard },
                      ].map((doc) => (
                        <div key={doc.label} className="bg-white border border-gray-200 rounded-xl p-2 text-center flex flex-col justify-between h-36">
                          <p className="text-[10px] text-gray-500 font-bold mb-1 truncate">{doc.label}</p>
                          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded overflow-hidden mb-1.5">
                            {doc.path ? (
                              <img src={doc.path} alt={doc.label} className="w-full h-full object-cover max-h-24" />
                            ) : (
                              <span className="text-xs text-gray-400">Not uploaded</span>
                            )}
                          </div>
                          {doc.path ? (
                            <a
                              href={doc.path}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded transition"
                            >
                              View Full Size
                            </a>
                          ) : (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <User size={48} className="mx-auto text-gray-300"/>
                  <div>
                    <h3 className="font-bold text-gray-700 text-base">Profile Setup Incomplete</h3>
                    <p className="text-sm text-gray-400 max-w-sm mx-auto mt-1">
                      This rider has verified their account, but has not completed uploading application details or photos yet.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 p-5 border-t border-gray-100 bg-gray-50 sticky bottom-0">
              {activeTab === "PENDING_APPROVAL" && (
                <>
                  <button
                    onClick={() => handleRiderAction(selectedRider.user_id, "APPROVED")}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Check size={16}/> Approve Application
                  </button>
                  <button
                    onClick={() => handleRiderAction(selectedRider.user_id, "REJECTED")}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <X size={16}/> Reject Application
                  </button>
                </>
              )}
              <button
                onClick={() => { setSelectedRider(null); setRiderDetails(null); }}
                className="flex-1 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REGISTER RIDER MODAL ── */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Register New Rider</h2>
                <p className="text-xs text-gray-400">Add a self-delivery rider to your network</p>
              </div>
              <button
                onClick={() => { setShowRegisterModal(false); setOtpSent(false); setTempOtp(""); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
              >
                <X size={18}/>
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {registerLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                  <RefreshCw size={24} className="animate-spin text-violet-500"/>
                  <p className="text-sm font-medium">Processing registration request…</p>
                </div>
              ) : !otpSent ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={registerForm.username}
                      onChange={handleRegisterChange}
                      placeholder="e.g. rahul_delivery"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      placeholder="e.g. rahul@example.com"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobileNo"
                      value={registerForm.mobileNo}
                      onChange={handleRegisterChange}
                      placeholder="e.g. 9876543210"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition"
                    >
                      Send Verification OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRegisterModal(false)}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 text-amber-700 text-xs p-3 rounded-xl border border-amber-100 space-y-1">
                    <p className="font-bold flex items-center gap-1"><AlertCircle size={14}/> OTP Verification Required</p>
                    <p>An OTP code was sent to {registerForm.mobileNo}. Please verify to complete account registration.</p>
                    {tempOtp && (
                      <p className="mt-1 font-semibold text-emerald-700">Dev Mode OTP: <span className="bg-white px-2 py-0.5 border rounded font-mono text-sm">{tempOtp}</span></p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Verification OTP</label>
                    <input
                      type="text"
                      value={otpVal}
                      onChange={(e) => setOtpVal(e.target.value)}
                      placeholder="Enter 6-digit OTP code"
                      maxLength={6}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleVerifyOtp}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
                    >
                      Verify & Register
                    </button>
                    <button
                      onClick={() => { setOtpSent(false); setTempOtp(""); setOtpVal(""); }}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
