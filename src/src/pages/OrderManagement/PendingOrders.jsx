// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { ORDER_URLS, getAuthHeaders } from "./orders";

// function PendingOrders() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   const fetchPendingOrders = async () => {
//     try {
//       const res = await axios.get(ORDER_URLS.vendorPending, getAuthHeaders());
//       setOrders(res.data?.data || []);
//     } catch (err) {
//       console.error("Failed to fetch pending orders", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPendingOrders();
//   }, []);

//   const handleApprove = async (order) => {
//     try {
//       await axios.patch(
//         ORDER_URLS.updateStatus(order.id),
//         { order_status: "Assigned" },
//         getAuthHeaders(),
//       );
//       await fetchPendingOrders();
//     } catch (err) {
//       console.error("Approve failed", err);
//       alert("Failed to approve order");
//     }
//   };

//   const handleReject = async (order) => {
//     try {
//       await axios.patch(
//         ORDER_URLS.reject(order.id),
//         { cancel_reason: "Rejected by vendor" },
//         getAuthHeaders(),
//       );
//       await fetchPendingOrders();
//     } catch (err) {
//       console.error("Reject failed", err);
//       alert("Failed to reject order");
//     }
//   };

//   const handleProceed = async (order) => {
//     try {
//       await axios.patch(
//         ORDER_URLS.updateStatus(order.id),
//         { order_status: "Out for Delivery" },
//         getAuthHeaders(),
//       );
//       navigate("/vendor/order/assign");
//     } catch (err) {
//       console.error("Proceed failed", err);
//       alert("Failed to update order");
//     }
//   };

//   if (loading) {
//     return <p className="text-gray-400">Loading pending orders...</p>;
//   }

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-[#f72585]">Pending Orders</h1>

//       <div className="overflow-x-auto rounded-xl border border-slate-900/90 bg-white/5">
//         <table className="min-w-full text-sm">
//           <thead className="bg-violet-500">
//             <tr>
//               <th className="px-3 py-2 text-left">S.No</th>
//               <th className="px-3 py-2 text-left">Order ID</th>
//               <th className="px-3 py-2 text-left">Items</th>
//               <th className="px-3 py-2 text-left">Attachments</th>
//               <th className="px-3 py-2 text-left">Distance</th>
//               <th className="px-3 py-2 text-left">Delivery Date & Time</th>
//               <th className="px-3 py-2 text-left">Waiting Time</th>
//               <th className="px-3 py-2 text-left">Status</th>
//               <th className="px-3 py-2 text-left">Remark</th>
//               <th className="px-3 py-2 text-left">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {orders.map((order, index) => (
//               <tr
//                 key={order.id}
//                 className="border-t border-slate-900/90 hover:bg-slate-900/20 text-slate-900 hover:cursor-pointer"
//               >
//                 <td className="px-3 py-2">{index + 1}</td>
//                 <td className="px-3 py-2 font-bold text-slate-900">{order.orderId}</td>
//                 <td className="px-3 py-2">{order.items}</td>
//                 <td className="px-3 py-2">
//                   {order.attachment ? (
//                     <span className="text-emerald-400">Yes</span>
//                   ) : (
//                     <span className="text-gray-400">No</span>
//                   )}
//                 </td>
//                 <td className="px-3 py-2">{order.distance}</td>
//                 <td className="px-3 py-2">
//                   {order.deliveryDate
//                     ? new Date(order.deliveryDate).toLocaleString()
//                     : "—"}
//                 </td>
//                 <td className="px-3 py-2 text-yellow-400">
//                   {order.waitingTime || order.waiting_time || "—"}
//                 </td>
//                 <td className="px-3 py-2">
//                   <span className="rounded-2xl bg-violet-500 px-2 py-1 text-xs text-white">
//                     {order.status || order.order_status}
//                   </span>
//                 </td>
//                 <td className="px-3 py-2 text-slate-900">{order.remark || "—"}</td>
//                 <td className="px-3 py-2">
//                   <div className="flex gap-2">
//                     <button
//                       className="rounded-md border-1 border-emerald-600 px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-500 cursor-pointer hover:text-white"
//                       onClick={() => handleApprove(order)}
//                     >
//                       Approve
//                     </button>
//                     <button
//                       className="rounded-md border border-red-600 px-2 py-1 text-xs text-red-600 hover:bg-red-500 cursor-pointer hover:text-white"
//                       onClick={() => handleReject(order)}
//                     >
//                       Reject
//                     </button>
//                     <button
//                       className="rounded-md border-1 border-indigo-600 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-500 cursor-pointer hover:text-white"
//                       onClick={() => handleProceed(order)}
//                     >
//                       Proceed To Delivery
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {!orders.length && (
//               <tr>
//                 <td colSpan="10" className="text-center p-4 text-gray-400">
//                   No pending orders
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default PendingOrders;


import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PendingOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        // 🔹 API: pending orders for vendor
        const res = await axios.get(
          "http://localhost:5000/vendor/orders?status=pending",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch pending orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

  if (loading) {
    return <p className="text-gray-400">Loading pending orders...</p>;
  }
const dummyOrders = [
  {
    id: 1,
    orderId: "ORD-1001",
    items: 4,
    attachment: true,
    distance: "3.2 km",
    deliveryDate: "2026-02-02 11:30 AM",
    waitingTime: "10 min",
    status: "PENDING",
    remark: "Urgent delivery",
  },
  {
    id: 2,
    orderId: "ORD-1002",
    items: 2,
    attachment: false,
    distance: "5.8 km",
    deliveryDate: "2026-02-02 01:00 PM",
    waitingTime: "—",
    status: "PENDING",
    remark: "Call before delivery",
  },
  {
    id: 3,
    orderId: "ORD-1003",
    items: 6,
    attachment: true,
    distance: "1.5 km",
    deliveryDate: "2026-02-02 04:45 PM",
    waitingTime: "25 min",
    status: "PENDING",
    remark: "Prescription attached",
  },
];

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-semibold text-slate-900">Pending Orders</h1>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-black/10 bg-black/5">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-slate-900">
            <tr>
                <th className="px-3 py-2 text-left">S.No</th>
              <th className="px-3 py-2 text-left">Order ID</th>
              <th className="px-3 py-2 text-left">Items</th>
              <th className="px-3 py-2 text-left">Attachments</th>
              <th className="px-3 py-2 text-left">Distance</th>
              <th className="px-3 py-2 text-left">Delivery Date & Time</th>
                <th className="px-3 py-2 text-left">Waiting Time</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Remark</th>
              <th className="px-3 py-2 text-left">Action</th>

            </tr>
          </thead>

          <tbody>
  {dummyOrders.map((order, index) => (
    <tr
      key={order.id}
      className="border-t border-white/10 hover:bg-white/5"
    >
      {/* S.No */}
      <td className="px-3 py-2 text-slate-900">{index + 1}</td>

      {/* Order ID */}
      <td className="px-3 py-2 font-medium text-slate-900">
        {order.orderId}
      </td>

      {/* Items */}
      <td className="px-3 py-2">{order.items}</td>

      {/* Attachments */}
      <td className="px-3 py-2">
        {order.attachment ? (
          <span className="text-emerald-400">Yes</span>
        ) : (
          <span className="text-gray-400">No</span>
        )}
      </td>

      {/* Distance */}
      <td className="px-3 py-2 text-slate-900">{order.distance}</td>

      {/* Delivery Date & Time */}
      <td className="px-3 py-2 text-slate-900">{order.deliveryDate}</td>

      {/* Waiting Time */}
      <td className="px-3 py-2 text-yellow-400">
        {order.waitingTime}
      </td>

      {/* Status */}
      <td className="px-3 py-2">
  <span className="rounded-full bg-purple-500/10 px-2 py-1 text-xs text-slate-900">
    {order.status}
  </span>
</td>

      {/* Remark */}
      <td className="px-3 py-2 text-gray-400">
        {order.remark}
      </td>

      {/* Actions */}
      <td className="px-3 py-2">
        <div className="flex gap-2">
          <button
            className="rounded-md bg-emerald-600 px-2 py-1 text-xs hover:bg-emerald-500"
            onClick={() => alert(`Approved ${order.orderId}`)}
          >
            Approve
          </button>

          <button
            className="rounded-md bg-red-600 px-2 py-1 text-xs hover:bg-red-500"
            onClick={() => alert(`Rejected ${order.orderId}`)}
          >
            Reject
          </button>

          <button
            className="rounded-md bg-indigo-600 px-2 py-1 text-xs hover:bg-indigo-500"
            // onClick={() => alert(`Marked delivered ${order.orderId}`)}
            onClick={() => navigate("/vendor/order/assign")} 
          >
           Proceed To Delivery
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
    </div>
  );
}

export default PendingOrders;
