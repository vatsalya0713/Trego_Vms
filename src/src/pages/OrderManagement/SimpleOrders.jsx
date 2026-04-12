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
      <h1 className="text-2xl font-semibold">Orders</h1>

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
              className="border-t border-gray-700 hover:bg-gray-800/40"
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
