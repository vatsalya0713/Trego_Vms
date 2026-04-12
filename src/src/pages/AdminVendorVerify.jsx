import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/vendor";

export default function AdminVendorVerify() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

const [showDetailsModal, setShowDetailsModal] = useState(false);
const [showDocsModal, setShowDocsModal] = useState(false);

const [attachments, setAttachments] = useState(null);
const [attachmentImage, setAttachmentImage] = useState(null);


  const [tab, setTab] = useState("PENDING"); // PENDING | APPROVED
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);
const [selectedApplicant, setSelectedApplicant] = useState(null);
const [feedback, setFeedback] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/admin/vendors?status=${tab}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setRows(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);
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
 
const updateStatus = async (applicant_id, action, feedbackText = null) => {
  try {
    await axios.post(
      `${API}/admin/vendor/action`,
      { applicant_id, action, feedback: feedbackText },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    fetchData();

  } catch (err) {
    alert(err.response?.data?.message || "Action failed");
  }
};


  return (
  <>
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Panel</h1>

      {/* TOP BUTTONS */}
      <div className="flex gap-4">
        <button
          onClick={() => setTab("PENDING")}
          className={`px-4 py-2 rounded ${
            tab === "PENDING" ? "bg-indigo-600" : "bg-gray-700"
          }`}
        >
          Pending List
        </button>

        <button
          onClick={() => setTab("APPROVED")}
          className={`px-4 py-2 rounded ${
            tab === "APPROVED" ? "bg-indigo-600" : "bg-gray-700"
          }`}
        >
          Approved List
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2">#</th>
              <th>Applicant ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={r.applicant_id} className="border-t border-gray-700">
                <td className="p-2">{i + 1}</td>
                <td className="cursor-pointer">
                  <button  
                onClick={()=>viewAttachments(r.applicant_id)}>
                  {r.applicant_id}
                </button></td>
                <td>{r.username}</td>
                <td>{r.email}</td>
                <td>{r.mobile}</td>
                <td>
                  <span className="px-2 py-1 text-xs bg-yellow-600 rounded">
                    {r.status}
                  </span>
                </td>

                {/* ACTIONS COLUMN */}
                <td className="flex flex-wrap gap-2 p-2">
                  <button
                    onClick={() => viewAttachmentImages(r.applicant_id)}
                    className="px-2 py-1 bg-gray-600 rounded"
                  >
                    Attachments
                  </button>

                  {tab === "PENDING" && (
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
                        className="px-2 py-1 bg-green-600 rounded"
                      >
                        Accept & Verify
                      </button>

                      <button
                        onClick={() => {
                          setSelectedApplicant(r.applicant_id);
                          setShowFeedback(true);
                        }}
                        className="px-2 py-1 bg-blue-600 rounded"
                      >
                        Send to Super Admin
                      </button>
                    </>
                  )}

                  {tab === "APPROVED" && (
                    <button
                      onClick={() =>
                        updateStatus(r.applicant_id, "TOGGLE_ACTIVE")
                      }
                      className="px-2 py-1 bg-indigo-600 rounded"
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
    </div>

    {showFeedback && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-gray-900 p-5 rounded-lg w-full max-w-md space-y-4">
          <h2 className="text-lg font-semibold">Send to Super Admin</h2>

          <textarea
            className="w-full h-28 rounded bg-gray-800 border border-gray-700 p-2 text-sm"
            placeholder="Write feedback for Super Admin..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowFeedback(false);
                setFeedback("");
                setSelectedApplicant(null);
              }}
              className="px-3 py-1 bg-gray-700 rounded"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                updateStatus(selectedApplicant, "SEND_SUPER", feedback);
                setShowFeedback(false);
                setFeedback("");
                setSelectedApplicant(null);
              }}
              className="px-3 py-1 bg-blue-600 rounded"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    )}

{showDetailsModal  && attachments && (
  <div className="fixed inset-0 z-50  bg-black/60 overflow-y-auto">
    <div className="bg-gray-900 p-6 rounded-lg w-full max-w-5xl mx-auto my-10 space-y-6">

      <h2 className="text-xl font-semibold">
        Vendor Business – Complete Details
      </h2>

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

          <Info
            label="Delivery Time (minutes)"
            value={attachments.delivery_time_minutes}
          />
          <Info
            label="Delivery Range (km)"
            value={attachments.delivery_range_km}
          />

          <Info label="User Discount (%)" value={attachments.user_discount} />
          <Info label="Company Discount (%)" value={attachments.company_discount} />
          <Info label="Vendor Offer (%)" value={attachments.vendor_offer_user} />
          <Info label="Company Offer (%)" value={attachments.company_offer_user} />

          <Info label="Offer Start Date" value={attachments.offer_start_date} />
          <Info label="Offer End Date" value={attachments.offer_end_date} />

          <Info
            label="Active"
            value={attachments.active ? "Yes" : "No"}
          />
          <Info
            label="Verified"
            value={attachments.is_verified ? "Yes" : "No"}
          />
          <Info label="Verified By" value={attachments.verified_by} />

          <Info
            label="Business Address"
            value={attachments.address}
            full
          />
        </div>
      </div>

      {/* <div>
        <h3 className="text-lg font-medium text-gray-300 mb-3">
          Business Documents
        </h3> */}

        {/* <AttachmentLink
          label="PAN Card"
          path={attachments.pan_card}
        />

        <AttachmentLink
          label="Bank Passbook"
          path={attachments.bank_passbook}
        />

        <AttachmentLink
          label="Cancelled Cheque"
          path={attachments.cancelled_cheque}
        /> */}
      {/* </div> */}
      
      <section>
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
      </section>

      {/* <section>
        <h3 className="text-lg font-medium text-gray-300 mb-3">
          Personal Documents
        </h3>

        <AttachmentLink label="Personal PAN Card" path={attachments.personal_pan} />
        <AttachmentLink label="Aadhaar Card" path={attachments.aadhaar_card} />
      </section> */}

      <div className="flex justify-end">
        <button
          onClick={() => setShowAttachments(false)}
          className="px-4 py-2 bg-gray-700 rounded"
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
          className="px-4 py-2 bg-gray-700 rounded"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
  </>
);

}
function Info({ label, value, full = false }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="bg-gray-800 px-3 py-2 rounded text-sm break-words">
        {value !== null && value !== undefined && value !== ""
          ? value
          : "-"}
      </p>
    </div>
  );
}


function AttachmentLink({ label, path }) {
  if (!path) {
    return (
      <p className="text-sm text-gray-500">
        {label}: Not uploaded
      </p>
    );
  }

  const fileUrl = `http://localhost:5000/${path}`;
  const isPdf = path.toLowerCase().endsWith(".pdf");

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm">{label}:</span>

      {isPdf ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline text-sm"
        >
          View PDF
        </a>
      ) : (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline text-sm"
        >
          View Image
        </a>
      )}
    </div>
  );
}
