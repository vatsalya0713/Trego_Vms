import { useEffect, useState } from "react";
import axios from "axios";

export default function RiderList() {
  const [activeTab, setActiveTab] = useState("PENDING_APPROVAL");
  const [riders, setRiders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRiders();
  }, [activeTab]);

  const fetchRiders = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/rider/admin/list?status=${activeTab}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRiders(res.data);
    } catch (err) {
      console.error("Fetch riders error:", err);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action == "APPROVED") {
        console.log(id)
        console.log(action)
        await axios.post(
          "http://localhost:5000/rider/approve",
          { applicant_id: id },
          // { headers: { Authorization: `Bearer ${token}` } }
        );

        fetchRiders()
      }
      else {
        console.log(id)
                console.log(action)

        await axios.post(
          "http://localhost:5000/rider/reject",
          { applicant_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchRiders();
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-violet-500">Rider Management</h1>

      {/* TOP BUTTONS */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab("PENDING_APPROVAL")}
          className={`px-4 py-2 rounded cursor-pointer ${activeTab === "PENDING_APPROVAL"
              ? "bg-yellow-600 "
              : "bg-gray-700 hover:bg-gray-600"
            }`}
        >
          Pending Requests
        </button>

        <button
          onClick={() => setActiveTab("APPROVED")}
          className={`px-4 py-2 rounded cursor-pointer ${activeTab === "APPROVED"
              ? "bg-emerald-600"
              : "bg-gray-700 hover:bg-gray-600"
            }`}
        >
          Approved Riders
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-slate-900   ">
        <table className="min-w-full text-sm">
          <thead className="bg-violet-500  text-white">
            <tr>
              <th className="px-4 py-2 text-left">S.No</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Attachment</th>
              <th className="px-4 py-2 text-left">Mobile Number</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {riders.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-400"
                >
                  No riders found
                </td>
              </tr>
            ) : (
              riders.map((rider, index) => (
                <tr
                  key={rider.user_id}
                  className="border-t border-white/10 text-slate-900"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{rider.username}</td>

                  <td className="px-4 py-2">
                    {rider.attachment ? (
                      <a
                        href={rider.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        View File
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="px-4 py-2">{rider.mobileNo}</td>
                  <td className="px-4 py-2">{rider.email}</td>

                  <td className="px-4 py-2">
                    {activeTab === "PENDING_APPROVAL" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleAction(rider.user_id, "APPROVED")
                          }
                          className="bg-emerald-600 px-3 py-1 rounded text-xs"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            handleAction(rider.user_id, "REJECTED")
                          }
                          className="bg-red-600 px-3 py-1 rounded text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded bg-emerald-600">
                        Approved
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
