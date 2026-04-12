import Button from '@mui/material/Button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DeliveryManagement() {
  const navigate = useNavigate();
  const [orders] = useState([
    {
      id: 1,
      shipmentId: "SHP-5001",
      orderId: "ORD-1001",
      orderValue: 1250,
      deliveryAddress: "Sector 21, Noida, UP",
      status: "Assigned",
      distance: "4.2 km",
      dateTime: "13 Feb 2026, 10:30 AM",
    },
    {
      id: 2,
      shipmentId: "SHP-5002",
      orderId: "ORD-1002",
      orderValue: 890,
      deliveryAddress: "MG Road, Bangalore",
      status: "Assigned",
      distance: "2.8 km",
      dateTime: "13 Feb 2026, 09:15 AM",
    },
    {
      id: 3,
      shipmentId: "SHP-5003",
      orderId: "ORD-1003",
      orderValue: 1540,
      deliveryAddress: "Andheri East, Mumbai",
      status: "Assigned",
      distance: "6.1 km",
      dateTime: "12 Feb 2026, 07:45 PM",
    },
  ]);
  const statusBadge = (status) => {
    const base =
      "px-2 py-1 rounded-full text-xs font-medium border inline-block";

    if (status === "Pending")
      return (
        <span className={`${base} border-yellow-500 bg-yellow-500/10 text-yellow-400`}>
          Pending
        </span>
      );

    if (status === "Assigned")
      return (
        <span className={`${base} border-blue-500 bg-blue-500/10 text-blue-400`}>
          Assigned
        </span>
      );

    if (status === "Cancelled")
      return (
        <span className={`${base} border-red-500 bg-red-500/10 text-red-400`}>
          Cancelled
        </span>
      );

    return null;
  };

  return (
    <div>
      <div className="flex justify-end gap-3 mb-4">
        <Button variant="contained">Self</Button>
        <Button variant="contained">Partner</Button>
      </div>

      <section className="mt-6">

        {/* Title */}
        <h1 className="text-xl font-semibold mb-4">
          Today Overview
        </h1>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Total Orders */}
          <div className="bg-white shadow-md rounded-xl p-4 border-l-4 border-indigo-500">
            <p className="text-sm text-gray-500">
              Today Orders
            </p>
            <h2 className="text-2xl text-gray-600 font-bold mt-1">
              1000
            </h2>
          </div>

          {/* Pending */}
          <div className="bg-white shadow-md rounded-xl p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">
              Pending Orders
            </p>
            <h2 className="text-2xl font-bold mt-1 text-yellow-600">
              10
            </h2>
          </div>

          {/* Delivered */}
          <div className="bg-white shadow-md rounded-xl p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">
              Orders Delivered
            </p>
            <h2 className="text-2xl font-bold mt-1 text-green-600">
              900
            </h2>
          </div>

        </div>

      </section>

      <section className='mt-4'>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-3 py-2 text-left">S.No</th>
                <th className="px-3 py-2 text-left">Shipment ID</th>
                <th className="px-3 py-2 text-left">Order ID</th>
                <th className="px-3 py-2 text-left">Order Value (₹)</th>
                <th className="px-3 py-2 text-left">Delivery Address</th>
                <th className="px-3 py-2 text-left">Delivery Distance</th>
                <th className="px-3 py-2 text-left">Delivery Date & Time</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id} className="border-t border-white/10">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2 font-medium text-indigo-300">
                    {order.shipmentId}
                  </td>
                  <td className="px-3 py-2 font-medium text-white">
                    {order.orderId}
                  </td>
                  <td className="px-3 py-2">₹{order.orderValue}</td>
                  <td className="px-3 py-2">{order.deliveryAddress}</td>
                  <td className="px-3 py-2">{order.distance}</td>
                  <td className="px-3 py-2">{order.dateTime}</td>
                  <td className="px-3 py-2">
                    {statusBadge(order.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2 flex-wrap">

                      {/* Cancel */}
                      <button
                        className="px-2 py-1 text-xs rounded-md bg-red-600 hover:bg-red-500"
                        onClick={() => navigate("/vendor/delivery/cancelled")}
                      >
                        Cancel
                      </button>

                      {/* ✅ Edit Assign */}
                      <button
                        className="px-2 py-1 text-xs rounded-md bg-blue-600 hover:bg-blue-500"
                        onClick={() =>
                          navigate("/vendor/order/assign", {
                            state: {
                              order,
                              mode: "edit"
                            }
                          })
                        }
                      >
                        Edit Assign
                      </button>

                      {/* ✅ Proceed */}
                      <button
                        className="px-2 py-1 text-xs rounded-md bg-indigo-600 hover:bg-indigo-500"
                        onClick={() =>
                          navigate("/vendor/order/outfordelivery", {
                            state: { order }
                          })
                        }
                      >
                        Proceed
                      </button>

                    </div>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-4 text-gray-400"
                  >
                    No orders available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </section>
    </div>

  )
}

export default DeliveryManagement
