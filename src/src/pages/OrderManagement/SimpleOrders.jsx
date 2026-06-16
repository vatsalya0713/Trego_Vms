// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Search, Wallet, Calendar } from "lucide-react";
// import { ORDER_URLS, buildOrderListUrl, getAuthHeaders } from "./orders";

// export default function SimpleOrders() {
//   const navigate = useNavigate();
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [orders, setOrders] = useState([]);
//   const [stats, setStats] = useState({ today: { count: 0 }, total: { count: 0 } });
//   const [loading, setLoading] = useState(true);

//   const fetchOrders = async () => {
//     try {
//       const url = buildOrderListUrl({
//         status: "placed",
//         startDate,
//         endDate,
//         search: searchQuery,
//       });
//       const res = await axios.get(url, getAuthHeaders());
//       setOrders(res.data?.data || []);
//     } catch (err) {
//       console.error("Failed to fetch orders", err);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const res = await axios.get(ORDER_URLS.stats, getAuthHeaders());
//       setStats(res.data?.data || { today: { count: 0 }, total: { count: 0 } });
//     } catch (err) {
//       console.error("Failed to fetch order stats", err);
//     }
//   };

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       await Promise.all([fetchOrders(), fetchStats()]);
//       setLoading(false);
//     };
//     load();
//   }, [startDate, endDate, searchQuery]);

//   const approveOrder = async (orderId) => {
//     try {
//       await axios.patch(ORDER_URLS.approve(orderId), {}, getAuthHeaders());
//       setOrders((prev) => prev.filter((o) => o.id !== orderId && o.order_id !== orderId));
//       navigate("/vendor/order/new");
//     } catch (err) {
//       console.error("Approve failed", err);
//       alert("Failed to approve order");
//     }
//   };

//   const rejectOrder = async (orderId) => {
//     try {
//       await axios.patch(ORDER_URLS.reject(orderId), {}, getAuthHeaders());
//       setOrders((prev) => prev.filter((o) => o.id !== orderId && o.order_id !== orderId));
//       navigate("/vendor/order/cancelled");
//     } catch (err) {
//       console.error("Reject failed", err);
//       alert("Failed to cancel order");
//     }
//   };

//   if (loading) {
//     return <p className="text-gray-400 p-4">Loading orders...</p>;
//   }

//   return (
//     <div className="p-2 space-y-2">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
//         <div className="flex items-center gap-4">
//           <div className="flex flex-col">
//             <label className="text-xs font-bold text-slate-500 mb-1">Start Date</label>
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//             />
//           </div>
//           <div className="flex flex-col">
//             <label className="text-xs font-bold text-slate-500 mb-1">End Date</label>
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//             />
//           </div>
//         </div>

//         <div className="relative w-full md:w-110">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <Search className="h-5 w-5 text-slate-400" />
//           </div>
//           <input
//             type="text"
//             className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full transition-all"
//             placeholder="Search orders ..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
//           <div className="flex items-center gap-5">
//             <div className="p-2 bg-amber-50 rounded-2xl group-hover:scale-110 transition-transform">
//               <Calendar className="w-6 h-6 text-slate-900" />
//             </div>
//             <div>
//               <p className="text-xl font-semibold text-slate-900 mb-1">Today's Orders</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-[14px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
//                   {new Date().toLocaleDateString()}
//                 </span>
//                 <h2 className="text-xl font-bold font-sans text-red-500 ml-70 border-1 border-red-500 py-0.5 px-2 rounded-xl">
//                   {stats.today?.count ?? 0}
//                 </h2>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
//           <div className="flex items-center gap-5">
//             <div className="p-2 bg-violet-50 rounded-2xl group-hover:scale-110 transition-transform">
//               <Wallet className="w-6 h-6 text-violet-600" />
//             </div>
//             <div>
//               <p className="text-xl font-semibold text-slate-900 mb-1">Total Orders</p>
//               <h2 className="text-xl font-bold font-sans text-emerald-500 ml-70 border-1 border-emerald-500 py-0.5 px-2 rounded-xl">
//                 {stats.total?.count ?? 0}
//               </h2>
//             </div>
//           </div>
//         </div>
//       </div>

//       <h1 className="text-2xl font-semibold text-[#f72585] md:mt-5">Orders</h1>

//       <table className="w-full border border-gray-700 text-sm">
//         <thead className="bg-violet-500">
//           <tr>
//             <th className="p-2 text-left">S.No</th>
//             <th className="text-left">Order ID</th>
//             <th className="text-left">Order Value</th>
//             <th className="text-left">Delivery Distance</th>
//             <th className="text-left">Action</th>
//           </tr>
//         </thead>

//         <tbody>
//           {orders.map((order, index) => (
//             <tr
//               key={order.id || order.order_id}
//               className="border-t border-slate-900 hover:cursor-pointer text-slate-900"
//             >
//               <td className="p-2">{index + 1}</td>
//               <td>{order.orderId || order.order_id}</td>
//               <td>₹{order.order_value ?? order.orderValue}</td>
//               <td>{order.distance || "—"}</td>
//               <td className="flex gap-2 p-2">
//                 <button
//                   onClick={() => approveOrder(order.id)}
//                   className="px-3 py-1 text-green-500 border-1 border-green-600 rounded hover:bg-green-500"
//                 >
//                   Accept
//                 </button>
//                 <button
//                   onClick={() => rejectOrder(order.id)}
//                   className="px-3 py-1 border-1 text-red-500 border-red-600 rounded hover:bg-red-500"
//                 >
//                   Cancelled
//                 </button>
//               </td>
//             </tr>
//           ))}

//           {!orders.length && (
//             <tr>
//               <td colSpan="5" className="text-center p-4 text-gray-400">
//                 No orders available
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

export default function SimpleOrders() {
  const navigate = useNavigate();

  // ✅ Dummy Orders
  const [orders, setOrders] = useState([
    {
      order_id: "ORD001",
      order_value: 1200,
      distance: "3.5 km",
    },
    {
      order_id: "ORD002",
      order_value: 850,
      distance: "1.8 km",
    },
    {
      order_id: "ORD003",
      order_value: 1560,
      distance: "5.2 km",
    },
  ]);

  // ✅ Approve → New Orders
  const approveOrder = (orderId) => {
    console.log("Approved:", orderId);

    // remove from current list
    setOrders((prev) =>
      prev.filter((o) => o.order_id !== orderId)
    );

    // redirect to NEW orders page
    navigate("/vendor/order/new");
  };

  // ❌ Reject → Cancelled Orders
  const rejectOrder = (orderId) => {
    console.log("Rejected:", orderId);

    setOrders((prev) =>
      prev.filter((o) => o.order_id !== orderId)
    );

    // redirect to CANCELLED orders page
    navigate("/vendor/order/cancelled");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>

      <table className="w-full border border-gray-700 text-sm">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 text-left">S.No</th>
            <th className="text-left">Order ID</th>
            <th className="text-left">Order Value</th>
            <th className="text-left">Delivery Distance</th>
            <th className="text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order, index) => (
            <tr
              key={order.order_id}
              className="border-t border-gray-700 text-slate-900 hover:bg-gray-800/40"
            >
              <td className="p-2">{index + 1}</td>
              <td>{order.order_id}</td>
              <td>₹{order.order_value}</td>
              <td>{order.distance}</td>
              <td className="flex gap-2 p-2">
                <button
                  onClick={() => approveOrder(order.order_id)}
                  className="px-3 py-1 bg-green-600 rounded hover:bg-green-500"
                >
                  Accept
                </button>

                <button
                  onClick={() => rejectOrder(order.order_id)}
                  className="px-3 py-1 bg-red-600 rounded hover:bg-red-500"
                >
                  Cancelled
                </button>
              </td>
            </tr>
          ))}

          {!orders.length && (
            <tr>
              <td
                colSpan="5"
                className="text-center p-4 text-gray-400"
              >
                No orders available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}