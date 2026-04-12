import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const orders = [
  {
    id: 1,
    dateTime: "2026-02-10 09:45 AM",
    orderId: "ORD-9001",
    orderValue: "₹1,250",
    distance: "10 km",
    address: "Sector 18, Noida, UP",
    route: "Warehouse → Noida",
    status: "Delivered",
  },
  {
    id: 2,
    dateTime: "2026-02-10 11:20 AM",
    orderId: "ORD-9002",
    orderValue: "₹3,480",
    distance: "18 km",
    address: "Indirapuram, Ghaziabad",
    route: "Warehouse → Ghaziabad",
    status: "Out for Delivery",
  },
];

export default function OrderShipmentTable() {
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = location.state?.mode === "edit";
  const editOrder = location.state?.order;

  const [riders, setRiders] = useState([]);
  const [selectedRiders, setSelectedRiders] = useState({});
  const [selectedRoutes, setSelectedRoutes] = useState({});

  // ✅ Fetch Approved Riders
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/rider/admin/list?status=APPROVED"
        );
        setRiders(res.data || []);
      } catch (error) {
        console.error("Failed to fetch riders", error);
      }
    };
    fetchRiders();
  }, []);

  const handleRiderChange = (orderId, value) => {
    setSelectedRiders((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  };

  const handleRouteChange = (orderId, value) => {
    setSelectedRoutes((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  };

  const handleProceed = (orderId) => {
    const rider = selectedRiders[orderId];

    if (!rider) {
      alert("Please select a rider first");
      return;
    }

    if (isEditMode) {
      console.log("Updating Rider:", rider);
      console.log("Updating Route:", selectedRoutes[orderId]);
      // 🔥 Here you can call update API
    }

    navigate("/vendor/delivery/list");
  };

  const displayOrders = isEditMode ? [editOrder] : orders;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm p-4">

      {/* Edit Mode Badge */}
      {isEditMode && (
        <div className="mb-4 text-sm font-semibold text-blue-600">
          Edit Assign Mode
        </div>
      )}

      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">S.No</th>
            <th className="px-4 py-3 text-left">Date & Time</th>
            <th className="px-4 py-3 text-left">Order ID</th>
            <th className="px-4 py-3 text-left">Order Value</th>
            <th className="px-4 py-3 text-left">Distance</th>
            <th className="px-4 py-3 text-left">Delivery Address</th>
            <th className="px-4 py-3 text-left">Rider</th>
            <th className="px-4 py-3 text-left">Route</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {displayOrders.map((order, index) => (
            <tr key={order.id} className="border-t hover:bg-gray-50 transition">
              <td className="px-4 py-3">{index + 1}</td>

              {/* 🔒 Locked Fields */}
              <td className="px-4 py-3 text-gray-400">{order.dateTime}</td>
              <td className="px-4 py-3 text-gray-400">{order.orderId}</td>
              <td className="px-4 py-3 text-gray-400">{order.orderValue}</td>
              <td className="px-4 py-3 text-gray-400">{order.distance}</td>
              <td className="px-4 py-3 text-gray-400">{order.address}</td>

              {/* ✅ Rider Editable */}
              {/* ✅ Rider Editable */}
              <td className="px-4 py-3">
                <select
                  value={selectedRiders[order.id] || ""}
                  onChange={(e) =>
                    handleRiderChange(order.id, e.target.value)
                  }
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                >
                  <option value="">Select Rider</option>
                  {riders.map((rider) => (
                    <option key={rider.id} value={rider.username}>
                      {rider.username}
                    </option>
                  ))}
                </select>
              </td>

              {/* ✅ Route Column Hidden In Edit Mode */}
              {!isEditMode && (
                <td className="px-4 py-3">
                  <select
                    value={selectedRoutes[order.id] || order.route}
                    onChange={(e) =>
                      handleRouteChange(order.id, e.target.value)
                    }
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="Warehouse → Noida">
                      Warehouse → Noida
                    </option>
                    <option value="Warehouse → Delhi">
                      Warehouse → Delhi
                    </option>
                    <option value="Warehouse → Gurgaon">
                      Warehouse → Gurgaon
                    </option>
                    <option value="Warehouse → Faridabad">
                      Warehouse → Faridabad
                    </option>
                  </select>
                </td>
              )}

              {/* Status */}
              <td className="px-4 py-3 text-gray-400">
                {order.status}
              </td>

              {/* Proceed */}
              <td className="px-4 py-3">
                <button
                  onClick={() => handleProceed(order.id)}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-500"
                >
                  {isEditMode ? "Update & Proceed" : "Proceed"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}