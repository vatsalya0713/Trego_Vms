import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

function NewOrder() {
  const navigate = useNavigate();

  // ✅ Modal state
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remark, setRemark] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [activeBillingId, setActiveBillingId] = useState(null);
  // ✅ Dummy Data
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderId: "ORD-101",
      items: 3,
      attachment: true,
      address: "Sector 62, Noida",
      distance: "2.5 km",
      waitingTime: "10 min",
    },
    {
      id: 2,
      orderId: "ORD-102",
      items: 5,
      attachment: true,
      address: "Indirapuram, Ghaziabad",
      distance: "6.2 km",
      waitingTime: "20 min",
    },
  ]);

  // ✅ Waiting time change
  const updateWaitingTime = (id, value) => {
    const selected = orders.find((o) => o.id === id);

    // Update waiting time
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, waitingTime: value } : o
      )
    );

    // Open modal for remark
    setSelectedOrder({ ...selected, waitingTime: value });
    setRemark("");
    setModalType("WAITING");
    setShowRemarkModal(true);
  };

  // ✅ Actions
  const handleBilling = (orderId) => {
    setActiveBillingId(orderId);
  };

  const handleNext = () => {
    navigate("/vendor/order/assign"); // 👈 navigate when next clicked
  };

  const handleDelivery = () => {
    navigate("/vendor/delivery/orders");
  };

  const handleCancelledClick = (order) => {
    setSelectedOrder(order);
    setRemark("");
    setModalType("CANCEL");
    setShowRemarkModal(true);
  };

  const handleSubmitRemark = () => {
    if (modalType === "WAITING") {
      console.log("Order moved to Pending:", selectedOrder);
      console.log("Waiting Time Remark:", remark);

      navigate("/vendor/order/pending");
    }

    if (modalType === "CANCEL") {
      console.log("Order Cancelled:", selectedOrder);
      console.log("Cancel Remark:", remark);

      navigate("/vendor/delivery/cancelled");
    }

    setShowRemarkModal(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Orders</h1>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">S.No</th>
              <th className="px-3 py-2 text-left">Order ID</th>
              <th className="px-3 py-2 text-left">Items</th>
              <th className="px-3 py-2 text-left">Attachments</th>
              <th className="px-3 py-2 text-left">Delivery Address</th>
              <th className="px-3 py-2 text-left">Distance</th>
              <th className="px-3 py-2 text-left">Waiting Time</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order.id}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="px-3 py-2">{index + 1}</td>

                <td className="px-3 py-2 font-medium text-indigo-300">
                  {order.orderId}
                </td>

                <td className="px-3 py-2">{order.items}</td>

                <td className="px-3 py-2">
                  {order.attachment ? (
                    <button
                      onClick={() => window.open(order.attachment, "_blank")}
                      className="text-emerald-400 hover:text-emerald-300"
                      title="View Attachment"
                    >
                      <Eye size={18} />
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                <td className="px-3 py-2">{order.address}</td>
                <td className="px-3 py-2">{order.distance}</td>

                <td className="px-3 py-2">
                  <select
                    value={order.waitingTime}
                    onChange={(e) =>
                      updateWaitingTime(order.id, e.target.value)
                    }
                    className="rounded-md border border-white/10 bg-gray-900 px-2 py-1 text-sm"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={`${i * 5} min`}>
                        {i * 5} min
                      </option>
                    ))}
                    <option disabled>────────</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hour">2 hour</option>
                    <option value="6 hour">6 hour</option>
                    <option value="12 hour">12 hour</option>
                    <option disabled>────────</option>
                    <option value="1 day">1 day</option>
                  </select>
                </td>

                <td className="px-3 py-2">
                  <div className="flex gap-2">

                    {activeBillingId === order.id ? (
                      // ✅ After Billing Click → Show ONLY Next
                      <button
                        onClick={handleNext}
                        className="bg-emerald-600 px-4 py-2 rounded text-white"
                      >
                        Next
                      </button>
                    ) : (
                      // ✅ Before Billing Click → Show All Buttons
                      <>
                        <button
                          onClick={() => handleCancelledClick(order)}
                          className="rounded-md bg-red-600 px-2 py-1 text-xs hover:bg-red-500"
                        >
                          Cancelled
                        </button>

                        <button
                          onClick={() => handleBilling(order.id)}
                          className="bg-blue-600 px-4 py-2 rounded text-white"
                        >
                          Billing
                        </button>

                        <button
                          onClick={handleDelivery}
                          className="rounded-md bg-emerald-600 px-2 py-1 text-xs hover:bg-emerald-500"
                        >
                          Proceed to Delivery
                        </button>
                      </>
                    )}

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Remark Modal */}
      {showRemarkModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-gray-900 p-6">
            <h2 className="text-lg font-semibold mb-4">
              Pending Order – Remark
            </h2>

            <textarea
              rows="4"
              placeholder="Enter cancellation remark..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-gray-800 px-3 py-2 text-sm outline-none"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowRemarkModal(false)}
                className="rounded-md px-3 py-1.5 text-sm hover:bg-white/5"
              >
                Close
              </button>

              <button
                disabled={!remark.trim()}
                onClick={handleSubmitRemark}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm hover:bg-red-500 disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewOrder;
