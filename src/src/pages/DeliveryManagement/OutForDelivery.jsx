import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye,Search,HistoryIcon,Wallet,Calendar } from "lucide-react";

const initialShipments = [
  {
    id: 1,
    dateTime: "2026-02-09 10:30 AM",
    shipmentId: "SHIP-1023",
    customerName: "Rahul Sharma",
    distance: "12 km",
    address: "Sector 62, Noida, UP",
    contact: "9876543210",
    paymentMode: "COD",
    status: "Pending",
  },
  {
    id: 2,
    dateTime: "2026-02-09 11:15 AM",
    shipmentId: "SHIP-1024",
    customerName: "Anjali Verma",
    distance: "8 km",
    address: "Indirapuram, Ghaziabad",
    contact: "9123456789",
    paymentMode: "GPay",
    status: "Pending",
  },
];

export default function ShipmentTable() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState(initialShipments);
const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const handlePaymentChange = (id, value) => {
    setShipments((prev) =>
        prev.map((item) =>
            item.id === id ? { ...item, paymentMode: value } : item
        )
    );
  };

  const handleCancel = (id) => {
    setShipments((prev) =>
        prev.map((item) =>
            item.id === id ? { ...item, status: "Cancelled" } : item
        )
    );
  };

  const handleProceed = (id) => {
    setShipments((prev) =>
        prev.map((item) =>
            item.id === id ? { ...item, status: "Assigned to Rider" } : item
        )
    );
  };

  return (
    <>
     {/* Filter Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="relative w-full md:w-110">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full transition-all"
              placeholder="Search orders ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
          <h1 className="text-2xl font-semibold text-[#f72585] md:mt-5 md:mb-5">Out For Delivery</h1>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-violet-500 text-xs uppercase text-white ">
          <tr>
            <th className="px-4 py-3 text-left">S.No</th>
            <th className="px-4 py-3 text-left">Date Time</th>
            <th className="px-4 py-3 text-left">Shipment ID</th>
            <th className="px-4 py-3 text-left">Customer Name</th>
            <th className="px-4 py-3 text-left">Distance</th>
            <th className="px-4 py-3 text-left">Address</th>
            <th className="px-4 py-3 text-left">Contact No</th>
            <th className="px-4 py-3 text-left">Payment Mode</th>
            <th className="px-4 py-3 text-left">Days Count</th>
            <th className="px-4 py-3 text-left">Status</th>
            
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
          </thead>

          <tbody>
          {shipments.map((item, index) => (
              <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{item.dateTime}</td>
                <td className="px-4 py-3 font-medium">{item.shipmentId}</td>
                <td className="px-4 py-3">{item.customerName}</td>
                <td className="px-4 py-3">{item.distance}</td>
                <td className="px-4 py-3">{item.address}</td>
                <td className="px-4 py-3">{item.contact}</td>

                {/* Payment Mode Dropdown */}
                <td className="px-4 py-3">
                  <select
                      value={item.paymentMode}
                      onChange={(e) =>
                          handlePaymentChange(item.id, e.target.value)
                      }
                      className="rounded-md border border-gray-300 px-6 py-1 text-sm"
                  >
                    <option value="COD">COD</option>
                    <option value="GPay">GPay</option>
                  </select>
                </td>
                                  {/* Payment Mode Dropdown */}
                <td className="px-4 py-3">
                 0
                </td>
                {/* Status Badge */}
                <td className="px-4 py-3">
                <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold
                    ${
                        item.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {item.status}
                </span>
                </td>

                {/* Action Buttons */}
                <td className="px-4 py-3 flex gap-2">
                  <button
                      onClick={() => handleCancel(item.id)}
                      className="rounded-md bg-red-500 px-3 py-1 text-white text-xs hover:bg-red-600"
                  >
                    Cancel
                  </button>

                  <button
                      onClick={() => {
                        handleProceed(item.id);
                        navigate("/vendor/order/rider/list");
                      }}
                      className="rounded-md bg-blue-500 px-3 py-1 text-white text-xs hover:bg-blue-600"
                  >
                    Proceed
                  </button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
      </>
  );
}
