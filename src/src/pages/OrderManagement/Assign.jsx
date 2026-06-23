// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { Search } from "lucide-react";
// import { ORDER_URLS, buildOrderListUrl, getAuthHeaders } from "./orders";

// export default function OrderShipmentTable() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const isEditMode = location.state?.mode === "edit";
//   const editOrder = location.state?.order;

//   const [riders, setRiders] = useState([]);
//   const [selectedRiders, setSelectedRiders] = useState({});
//   const [selectedRoutes, setSelectedRoutes] = useState({});

//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     const fetchRiders = async () => {
//       try {
//         const res = await axios.get(
//           "http://localhost:5000/rider/admin/list?status=APPROVED"
//         );
//         setRiders(res.data || []);
//       } catch (error) {
//         console.error("Failed to fetch riders", error);
//       }
//     };
//     fetchRiders();
//   }, []);

//   useEffect(() => {
//     const fetchAssignedOrders = async () => {
//       if (isEditMode) {
//         setLoading(false);
//         return;
//       }
//       try {
//         const url = buildOrderListUrl({
//           status: "assigned",
//           startDate,
//           endDate,
//           search: searchQuery,
//         });
//         const res = await axios.get(url, getAuthHeaders());
//         const rows = (res.data?.data || []).map((o) => ({
//           id: o.id,
//           dateTime: o.created_at
//             ? new Date(o.created_at).toLocaleString()
//             : "—",
//           orderId: o.orderId,
//           orderValue: `₹${o.order_value ?? o.total_amount}`,
//           distance: o.distance,
//           address: o.address,
//           route: o.route || "Warehouse → Noida",
//           status: o.order_status,
//         }));
//         setOrders(rows);
//       } catch (err) {
//         console.error("Failed to fetch assigned orders", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAssignedOrders();
//   }, [startDate, endDate, searchQuery, isEditMode]);

//   const handleRiderChange = (orderId, value) => {
//     setSelectedRiders((prev) => ({
//       ...prev,
//       [orderId]: value,
//     }));
//   };

//   const handleRouteChange = (orderId, value) => {
//     setSelectedRoutes((prev) => ({
//       ...prev,
//       [orderId]: value,
//     }));
//   };

//   const handleProceed = async (orderId) => {
//     const rider = selectedRiders[orderId];
//     const route = selectedRoutes[orderId];

//     if (!rider) {
//       alert("Please select a rider first");
//       return;
//     }

//     try {
//       await axios.patch(
//         ORDER_URLS.assign(orderId),
//         { rider_username: rider, route },
//         getAuthHeaders(),
//       );
//       navigate("/vendor/delivery/list");
//     } catch (err) {
//       console.error("Assign rider failed", err);
//       alert("Failed to assign rider");
//     }
//   };

//   const displayOrders = isEditMode ? [editOrder] : orders;

//   if (loading && !isEditMode) {
//     return <p className="text-gray-400 p-4">Loading assign orders...</p>;
//   }

//   return (
//     <>
//     {/* Filter Section */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
//           <div className="flex items-center gap-4">
//             <div className="flex flex-col">
//               <label className="text-xs font-bold text-slate-500 mb-1">Start Date</label>
//               <input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//               />
//             </div>
//             <div className="flex flex-col">
//               <label className="text-xs font-bold text-slate-500 mb-1">End Date</label>
//               <input
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
//               />
//             </div>
//           </div>
          
//           <div className="relative w-full md:w-110">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Search className="h-5 w-5 text-slate-400" />
//             </div>
//             <input
//               type="text"
//               className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full transition-all"
//               placeholder="Search orders ..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//         </div>
//               <h1 className="text-2xl font-semibold text-[#f72585] md:mt-5 md:mb-5">Assign Table</h1>
//     <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm p-4">


//       {/* Edit Mode Badge */}
//       {isEditMode && (
//         <div className="mb-4 text-sm font-semibold text-blue-600">
//           Edit Assign Mode
//         </div>
//       )}

//       <table className="min-w-full text-sm text-slate-900 ">
//         <thead className="bg-violet-500 text-sm uppercase text-white">
//           <tr>
//             <th className="px-4 py-3 text-left">S.No</th>
//             <th className="px-4 py-3 text-left">Date & Time</th>
//             <th className="px-4 py-3 text-left">Order ID</th>
//             <th className="px-4 py-3 text-left">Order Value</th>
//             <th className="px-4 py-3 text-left">Distance</th>
//             <th className="px-4 py-3 text-left">Delivery Address</th>
//             <th className="px-4 py-3 text-left">Rider</th>
//             <th className="px-4 py-3 text-left">Route</th>
//             <th className="px-4 py-3 text-left">Status</th>
//             <th className="px-4 py-3 text-left">Action</th>
//           </tr>
//         </thead>

//         <tbody>
//           {displayOrders.map((order, index) => (
//             <tr key={order.id} className="border-t hover:bg-gray-50 transition">
//               <td className="px-4 py-3">{index + 1}</td>

//               {/* 🔒 Locked Fields */}
//               <td className="px-4 py-3 text-slate-900">{order.dateTime}</td>
//               <td className="px-4 py-3 text-slate-900">{order.orderId}</td>
//               <td className="px-4 py-3 text-slate-900">{order.orderValue}</td>
//               <td className="px-4 py-3 text-slate-900">{order.distance}</td>
//               <td className="px-4 py-3 text-slate-900">{order.address}</td>

//               {/* ✅ Rider Editable */}
//               {/* ✅ Rider Editable */}
//               <td className="px-4 py-3">
//                 <select
//                   value={selectedRiders[order.id] || ""}
//                   onChange={(e) =>
//                     handleRiderChange(order.id, e.target.value)
//                   }
//                   className="rounded-md border border-gray-300 px-2 py-1 text-sm"
//                 >
//                   <option value="">Select Rider</option>
//                   {riders.map((rider) => (
//                     <option key={rider.id} value={rider.username}>
//                       {rider.username}
//                     </option>
//                   ))}
//                 </select>
//               </td>

//               {/* ✅ Route Column Hidden In Edit Mode */}
//               {!isEditMode && (
//                 <td className="px-4 py-3">
//                   <select
//                     value={selectedRoutes[order.id] || order.route}
//                     onChange={(e) =>
//                       handleRouteChange(order.id, e.target.value)
//                     }
//                     className="rounded-md border border-gray-300 px-2 py-1 text-sm"
//                   >
//                     <option value="Warehouse → Noida">
//                       Warehouse → Noida
//                     </option>
//                     <option value="Warehouse → Delhi">
//                       Warehouse → Delhi
//                     </option>
//                     <option value="Warehouse → Gurgaon">
//                       Warehouse → Gurgaon
//                     </option>
//                     <option value="Warehouse → Faridabad">
//                       Warehouse → Faridabad
//                     </option>
//                   </select>
//                 </td>
//               )}

//               {/* Status */}
//               <td className="px-4 py-3 text-emerald-500 ">
//                 {order.status}
//               </td>

//               {/* Proceed */}
//               <td className="px-4 py-3">
//                 <button
//                   onClick={() => handleProceed(order.id)}
//                   className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-500"
//                 >
//                   {isEditMode ? "Update & Proceed" : "Proceed"}
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//     </>
//   );
// }


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

      <table className="min-w-full text-sm text-slate-900 ">
        <thead className="bg-gray-100 text-xs uppercase text-slate-900">
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
