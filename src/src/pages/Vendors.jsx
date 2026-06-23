import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Search } from "lucide-react";

const API = "http://localhost:5000/vendor";

export default function Vendors() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
const [showDetailsModal, setShowDetailsModal] = useState(false);
const [showDocsModal, setShowDocsModal] = useState(false);

const [attachments, setAttachments] = useState(null);
  const [attachmentImage, setAttachmentImage] = useState(null);

  // SUPER ADMIN starts with review tab
  const [tab, setTab] = useState("SUPER_ADMIN_REVIEW");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const q = query.toLowerCase().trim();
    return rows.filter(r => 
      !q || 
      (r.username || "").toLowerCase().includes(q) ||
      (r.email || "").toLowerCase().includes(q) ||
      (r.applicant_id || "").toString().toLowerCase().includes(q) ||
      (r.mobile || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  /* =========================
     FETCH DATA (SINGLE SOURCE)
  ========================== */
  const fetchData = async () => {
    if (!tab) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/admin/vendors?status=${tab}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRows(res.data);
    } catch (err) {
      console.error("Failed to load vendors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      fetchData();
    }
  }, [tab, user]);

  /* =========================
     ACTION HANDLER
  ========================== */
  const updateStatus = async (applicant_id, action) => {
    try {
      await axios.post(
        `${API}/admin/vendor/action`,
        { applicant_id, action },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // refresh list after action
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };
  /*Attachement Table */
  const viewAttachments = async (applicant_id) => {
    try {
      const res = await axios.get(
        `${API}/vendor/application/${applicant_id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

        setAttachments(res.data);
    setShowDetailsModal(true);
    setShowDocsModal(false);
    setAttachmentImage(null);
    } catch (err) {
      alert("Failed to load attachments");
    }
  };

  const viewAttachmentImages = async (applicant_id) => {
    try {
      const res = await axios.get(
        `${API}/vendor/application/${applicant_id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAttachmentImage(res.data);
    setShowDocsModal(true);
    setShowDetailsModal(false);
    setAttachments(null);
    } catch (err) {
      alert("Failed to load attachments");
    }
  };
  /* =========================
     UI
  ========================== */
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">
        Super Admin Panel
      </h1>

      {/* 🔘 TABS + SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4">
          <button
            onClick={() => setTab("SUPER_ADMIN_REVIEW")}
            className={`px-4 py-2 hover:cursor-pointer rounded transition-colors ${tab === "SUPER_ADMIN_REVIEW"
              ? "bg-violet-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
          >
            Pending Review
          </button>

          <button
            onClick={() => setTab("APPROVED")}
            className={`px-4 py-2 hover:cursor-pointer rounded transition-colors ${tab === "APPROVED"
              ? "bg-violet-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
          >
            Approved
          </button>
        </div>

        <div className="flex items-center min-w-[300px] gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 shadow-sm">
          <Search size={18} className="text-gray-400" />
          <input
            className="w-full bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400"
            placeholder="Search vendors…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 📋 TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-700 bg-white">
          <thead className="bg-violet-500">
            <tr>
              <th className="p-2">#</th>
              <th>Applicant ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Remark</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((r, i) => (
              <tr key={r.applicant_id} className="border-t border-gray-700 text-slate-900 hover:cursor-pointer">
                <td className="p-2">{i + 1}</td>
                <td className="cursor-pointer">
                  <button className="hover:cursor-pointer"
                    onClick={() => viewAttachments(r.applicant_id)}>
                    {r.applicant_id}
                  </button></td>                
                  <td>{r.username}</td>
                <td>{r.email}</td>
                <td>{r.mobile}</td>
                <td>
                  <span className="px-2 py-1 text-xs bg-green-600 rounded">
                    {r.status}
                  </span>
                </td>
                <td className="p-2 max-w-xs">
                  {r.admin_feedback ? (
                    <div className="text-sm text-gray-900 whitespace-pre-wrap max-h-24 overflow-y-auto">
                      {r.admin_feedback}
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">
                      No feedback
                    </span>
                  )}
                </td>
                <td className="flex gap-2 p-2">
                  {/*Attachement Table */}
                  <button
                    onClick={() => viewAttachmentImages(r.applicant_id)}
                    className="px-2 py-1  text-[#ffe863] bg-violet-500 rounded hover:cursor-pointer"
                  >
                    Attachments
                  </button>

                  {/* SUPER ADMIN ACTIONS */}
                  {user?.role?.toLowerCase() === "super_admin" &&
                    tab === "SUPER_ADMIN_REVIEW" && (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(r.applicant_id, "REJECT")
                          }
                          className="px-2 py-1 bg-red-600 rounded"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(r.applicant_id, "VERIFY")
                          }
                          className="px-2 py-1 bg-green-600 rounded hover:cursor-pointer"
                        >
                          Approve
                        </button>
                      </>
                    )}

                  {/* POST-APPROVAL CONTROL */}
                  {tab === "APPROVED" && (
                    <button
                      onClick={() =>
                        updateStatus(r.applicant_id, "TOGGLE_ACTIVE")
                      }
                      className="px-2 py-1 bg-violet-200 text-[#f72585] rounded"
                    >
                      Activate / Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {!rows.length && !loading && (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-400">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showDetailsModal  && attachments && (
        <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-5xl mx-auto my-10 space-y-6">

            <h2 className="text-xl font-semibold">
              Vendor Business – Complete Details
            </h2>

            {/* BUSINESS INFO */}
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-3">
                Business Information
              </h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Business Name" value={attachments.ref_name || attachments.name} />
                <Info label="Category" value={attachments.category} />
                <Info label="Category Type" value={attachments.category_type} />
                <Info label="Website" value={attachments.website} />
                <Info label="Logo URL" value={attachments.logo} />
                <Info label="Drug License" value={attachments.druglicense} />
                <Info label="GSTIN" value={attachments.gstin} />
                <Info label="Mobile" value={attachments.mobile} />
                <Info label="Email" value={attachments.email} />

                <Info label="Delivery Time (minutes)" value={attachments.delivery_time_minutes} />
                <Info label="Delivery Range (km)" value={attachments.delivery_range_km} />

                <Info label="Active" value={attachments.active ? "Yes" : "No"} />
                <Info label="Verified" value={attachments.is_verified ? "Yes" : "No"} />
                <Info label="Verified By" value={attachments.verified_by} />

                <Info label="Business Address" value={attachments.address} full />
              </div>
            </div>


            {/* PERSONAL INFO */}
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-3">
                Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Owner Name" value={attachments.owner_name} />
                <Info label="Age" value={attachments.age} />
                <Info label="Gender" value={attachments.gender} />
                <Info label="Contact No" value={attachments.contact_no} />
                <Info label="Personal Address" value={attachments.personal_address} full />
              </div>
            </div>


            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-700 rounded hover:cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

{showDocsModal  && attachmentImage && (
  <div className="fixed inset-0 z-50  bg-black/60 overflow-y-auto">
    <div className="bg-gray-900 p-6 rounded-lg w-full max-w-5xl mx-auto my-10 space-y-6">

      <div>
        <h3 className="text-lg font-medium text-gray-300 mb-3">
          Business Documents
        </h3>

         <AttachmentLink
          label="PAN Card"
          path={attachmentImage.pan_card}
        />

        <AttachmentLink
          label="Bank Passbook"
          path={attachmentImage.bank_passbook}
        />

        <AttachmentLink
          label="Cancelled Cheque"
          path={attachmentImage.cancelled_cheque}
        /> 
      </div>
      
      <section>
        <h3 className="text-lg font-medium text-gray-300 mb-3">
          Personal Documents
        </h3>

        <AttachmentLink label="Personal PAN Card" path={attachmentImage.personal_pan} />
        <AttachmentLink label="Aadhaar Card" path={attachmentImage.aadhaar_card} />
      </section>

      <div className="flex justify-end">
        <button
          onClick={() => setAttachmentImage(false)}
          className="px-4 py-2 bg-gray-700 rounded hover:cursor-pointer"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}
function Info({ label, value, full = false }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="bg-gray-800 px-3 py-2 rounded text-sm break-words">
        {value ?? "-"}
      </p>
    </div>
  );
}

function AttachmentLink({ label, path }) {
  if (!path) {
    return <p className="text-sm text-gray-500">{label}: Not uploaded</p>;
  }

  const fileUrl = path.startsWith("http") ? path : `http://localhost:5000/${path}`;
  const isPdf = path.toLowerCase().endsWith(".pdf");

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm">{label}:</span>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline text-sm"
      >
        {isPdf ? "View PDF" : "View Image"}
      </a>
    </div>
  );
}
