import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package, CheckCircle, Clock, Truck, XCircle, ShoppingBag,
  RefreshCw, Search, Eye, ChevronDown, X, User, MapPin,
  Phone, IndianRupee, Calendar, AlertCircle, Check, Bike,
  CalendarDays, Navigation
} from "lucide-react";

const API = "http://localhost:5000";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

/* ── STATUS TABS CONFIG ── */
const STATUS_TABS = [
  { key: "all",               label: "All Deliveries",    icon: Package,     color: "violet"  },
  { key: "accepted",          label: "Ready to Dispatch", icon: ShoppingBag, color: "blue"    },
  { key: "assigned",          label: "Assigned to Rider", icon: Bike,        color: "indigo"  },
  { key: "out for delivery",  label: "Out for Delivery",  icon: Truck,       color: "orange"  },
  { key: "delivered",         label: "Delivered",         icon: Check,       color: "green"   },
  { key: "cancelled",         label: "Cancelled",         icon: XCircle,     color: "red"     },
];

const STATUS_BADGE = {
  accepted:         "bg-blue-100 text-blue-700 border-blue-200",
  assigned:         "bg-indigo-100 text-indigo-700 border-indigo-200",
  "out for delivery":"bg-orange-100 text-orange-700 border-orange-200",
  delivered:        "bg-green-100 text-green-700 border-green-200",
  cancelled:        "bg-red-100 text-red-700 border-red-200",
};

const COLOR_RING = {
  violet: "ring-violet-500 bg-violet-50 text-violet-700",
  blue:   "ring-blue-500 bg-blue-50 text-blue-700",
  indigo: "ring-indigo-500 bg-indigo-50 text-indigo-700",
  orange: "ring-orange-500 bg-orange-50 text-orange-700",
  green:  "ring-green-500 bg-green-50 text-green-700",
  red:    "ring-red-500 bg-red-50 text-red-700",
};

export default function DeliveryManagement() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial tab based on route pathname
  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes("outfordelivery")) return "out for delivery";
    if (path.includes("delivered")) return "delivered";
    if (path.includes("cancelled")) return "cancelled";
    return "all";
  };

  const [activeTab, setActiveTab]     = useState(getInitialTab());
  const [orders,    setOrders]        = useState([]);
  const [stats,     setStats]         = useState(null);
  const [riders,    setRiders]        = useState([]);
  const [loading,   setLoading]       = useState(true);
  const [search,    setSearch]        = useState("");
  const [startDate, setStartDate]     = useState("");
  const [endDate,   setEndDate]       = useState("");
  
  const [detail,    setDetail]        = useState(null);   // selected order for detail modal
  const [action,    setAction]        = useState(null);   // { type, order }
  const [actionNote,setActionNote]    = useState("");
  const [assignRider,setAssignRider]  = useState("");
  const [toast,     setToast]         = useState(null);

  // Sync tab with route changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  /* ── FETCH DELIVERIES ── */
  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (activeTab !== "all") queryParams.append("status", activeTab);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (search) queryParams.append("search", search);

      const res = await axios.get(`${API}/order/vendor/deliveries?${queryParams.toString()}`, authHeaders());
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load deliveries", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, startDate, endDate, search]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/order/vendor/delivery-stats`, authHeaders());
      setStats(res.data);
    } catch (err) {
      console.error("delivery stats error", err);
    }
  }, []);

  const fetchRiders = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/order/vendor/riders`, authHeaders());
      setRiders(res.data?.data || []);
    } catch (err) {
      console.error("riders error", err);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
    fetchStats();
    fetchRiders();
  }, [fetchDeliveries, fetchStats, fetchRiders]);

  /* ── TOAST ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── ACTION SUBMIT ── */
  const handleActionSubmit = async () => {
    if (!action) return;
    const { type, order } = action;
    const id = order.id;

    try {
      if (type === "assign" || type === "reassign") {
        if (!assignRider) return showToast("Select a rider", "error");
        const rider = riders.find((r) => String(r.id) === String(assignRider));
        await axios.post(`${API}/order/vendor/orders/${id}/assign`,
          { rider_id: assignRider, rider_name: rider?.full_name || rider?.username },
          authHeaders()
        );
        showToast("Rider assigned successfully ✓");
      } else if (type === "out-delivery") {
        await axios.post(`${API}/order/vendor/orders/${id}/out-delivery`, {}, authHeaders());
        showToast("Order shipped & out for delivery ✓");
      } else if (type === "deliver") {
        await axios.post(`${API}/order/vendor/orders/${id}/deliver`, {}, authHeaders());
        showToast("Order marked as delivered ✓");
      } else if (type === "cancel") {
        await axios.post(`${API}/order/vendor/orders/${id}/cancel`, { reason: actionNote }, authHeaders());
        showToast("Delivery cancelled");
      }

      setAction(null);
      setActionNote("");
      setAssignRider("");
      fetchDeliveries();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    }
  };

  /* ── DETAIL MODAL FETCH ── */
  const openDetail = async (order) => {
    try {
      const res = await axios.get(`${API}/order/vendor/orders/${order.id}`, authHeaders());
      setDetail(res.data?.data || order);
    } catch {
      setDetail(order);
    }
  };

  /* ── COUNT PER TAB ── */
  const countForTab = (key) => {
    if (!stats) return 0;
    if (key === "all") {
      return (stats.assigned ?? 0) + (stats.outForDelivery ?? 0) + (stats.delivered ?? 0) + (stats.cancelled ?? 0) + (stats.accepted ?? 0);
    }
    if (key === "accepted") return stats.accepted ?? 0;
    if (key === "assigned") return stats.assigned ?? 0;
    if (key === "out for delivery") return stats.outForDelivery ?? 0;
    if (key === "delivered") return stats.delivered ?? 0;
    if (key === "cancelled") return stats.cancelled ?? 0;
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <AlertCircle size={16}/> : <Check size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {stats ? `Today: ${stats.todayDelivered ?? 0} delivered · ₹${Number(stats.todayRevenue ?? 0).toFixed(0)} revenue` : "Loading dashboard stats…"}
          </p>
        </div>
        <button
          onClick={() => { fetchDeliveries(); fetchStats(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Today's Delivered", value: stats.todayDelivered ?? 0,                     color: "green"  },
            { label: "Today's Revenue",   value: `₹${Number(stats.todayRevenue ?? 0).toFixed(0)}`, color: "emerald"},
            { label: "Out for Delivery",  value: stats.outForDelivery ?? 0,                    color: "orange" },
            { label: "Assigned Shipments", value: stats.assigned ?? 0,                          color: "indigo" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${
                s.color === "green" ? "text-green-600" :
                s.color === "emerald" ? "text-emerald-600" :
                s.color === "orange" ? "text-orange-600" : "text-indigo-600"
              }`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── TABS ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const cnt = countForTab(tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                // navigate to update url state if desired
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all
                ${isActive
                  ? `ring-2 ${COLOR_RING[tab.color]}`
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              <Icon size={13}/>
              {tab.label}
              {cnt > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${isActive ? "bg-white/70" : "bg-gray-100"}`}>
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── FILTERS SECTION ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Search */}
        <div className="relative col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, Customer, Phone..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        {/* Start Date */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
          <CalendarDays size={16} className="text-gray-400"/>
          <span className="text-xs text-gray-500 whitespace-nowrap">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full text-xs text-gray-700 bg-transparent focus:outline-none"
          />
        </div>

        {/* End Date */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
          <CalendarDays size={16} className="text-gray-400"/>
          <span className="text-xs text-gray-500 whitespace-nowrap">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full text-xs text-gray-700 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* ── DELIVERIES TABLE ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <RefreshCw size={18} className="animate-spin"/> Loading shipments…
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <Package size={40} className="opacity-30"/>
            <p className="font-medium">No deliveries found matching criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["S.No","Order ID","Customer","Amount","Rider / Note","Status","Date & Time","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order, idx) => {
                  const status = (order.order_status || "accepted").toLowerCase();
                  const badgeCls = STATUS_BADGE[status] || "bg-gray-100 text-gray-600 border-gray-200";
                  
                  // Display Rider name if assigned, or cancel reason if cancelled
                  let riderInfo = "—";
                  if (status === "cancelled") {
                    riderInfo = order.cancel_reason ? `Reason: ${order.cancel_reason}` : "Cancelled";
                  } else if (order.cancel_reason) {
                    riderInfo = order.cancel_reason; // Contains rider name/ID
                  }

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-violet-600">#{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{order.name || "—"}</p>
                        <p className="text-xs text-gray-400">{order.mobile || order.city || ""}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800">₹{Number(order.total_amount || 0).toFixed(0)}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {status === "cancelled" ? (
                          <span className="text-red-500 font-medium">{riderInfo}</span>
                        ) : order.cancel_reason ? (
                          <span className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                            <Bike size={12}/> {riderInfo}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-normal">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeCls}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {order.created_at ? new Date(order.created_at).toLocaleString("en-IN", {day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <DeliveryActions
                          order={order}
                          onView={() => openDetail(order)}
                          onAction={(type) => { setAction({ type, order }); setActionNote(""); setAssignRider(""); }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {detail && (
        <Modal onClose={() => setDetail(null)} title={`Delivery Info #${detail.id}`}>
          <OrderDetail order={detail} />
        </Modal>
      )}

      {/* ── ACTION MODAL ── */}
      {action && (
        <Modal onClose={() => setAction(null)} title={ACTION_TITLE[action.type]}>
          <ActionForm
            action={action}
            note={actionNote}
            setNote={setActionNote}
            riders={riders}
            assignRider={assignRider}
            setAssignRider={setAssignRider}
            onConfirm={handleActionSubmit}
            onCancel={() => setAction(null)}
          />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DELIVERY ACTION BUTTONS
───────────────────────────────────────────── */
const ACTION_TITLE = {
  assign:       "Assign Rider",
  reassign:     "Reassign Rider",
  "out-delivery": "Dispatch (Out for Delivery)",
  deliver:      "Mark as Delivered",
  cancel:       "Cancel Shipment",
};

function DeliveryActions({ order, onView, onAction }) {
  const status = (order.order_status || "accepted").toLowerCase();

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={onView}
        className="p-1.5 rounded-lg hover:bg-violet-50 text-violet-500 transition"
        title="View Details"
      >
        <Eye size={14}/>
      </button>

      {status === "accepted" && (
        <>
          <Btn color="indigo" label="Assign Rider" onClick={() => onAction("assign")}/>
          <Btn color="red"    label="Cancel"       onClick={() => onAction("cancel")}/>
        </>
      )}
      {status === "assigned" && (
        <>
          <Btn color="orange" label="Dispatch"     onClick={() => onAction("out-delivery")}/>
          <Btn color="indigo" label="Reassign"     onClick={() => onAction("reassign")}/>
          <Btn color="red"    label="Cancel"       onClick={() => onAction("cancel")}/>
        </>
      )}
      {status === "out for delivery" && (
        <>
          <Btn color="green"  label="Delivered"    onClick={() => onAction("deliver")}/>
          <Btn color="red"    label="Cancel"       onClick={() => onAction("cancel")}/>
        </>
      )}
    </div>
  );
}

function Btn({ color, label, onClick }) {
  const map = {
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    red:     "bg-red-50 text-red-700 hover:bg-red-100",
    indigo:  "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
    orange:  "bg-orange-50 text-orange-700 hover:bg-orange-100",
    green:   "bg-green-50 text-green-700 hover:bg-green-100",
  };
  return (
    <button onClick={onClick} className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${map[color]}`}>
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   MODAL WRAPPER
───────────────────────────────────────────── */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition">
            <X size={18}/>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ORDER / DELIVERY DETAIL
───────────────────────────────────────────── */
function OrderDetail({ order }) {
  const status = (order.order_status || "accepted").toLowerCase();
  const badgeCls = STATUS_BADGE[status] || "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-sm">Shipment Status</span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeCls}`}>{order.order_status}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoRow icon={User}        label="Customer Name" value={order.name || "—"}/>
        <InfoRow icon={Phone}       label="Contact Number" value={order.mobile || "—"}/>
        <InfoRow icon={MapPin}      label="Address"  value={`${order.address || ""}${order.city ? ", " + order.city : ""}`}/>
        <InfoRow icon={IndianRupee} label="Order Total"   value={`₹${Number(order.total_amount||0).toFixed(2)}`}/>
        <InfoRow icon={Bike}        label="Rider Info"   value={status !== "cancelled" && order.cancel_reason ? order.cancel_reason : "Not Assigned"}/>
        <InfoRow icon={Calendar}    label="Order Date"   value={order.created_at ? new Date(order.created_at).toLocaleString("en-IN") : "—"}/>
      </div>

      {order.cancel_reason && status === "cancelled" && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
          <span className="font-semibold">Cancellation Note: </span>{order.cancel_reason}
        </div>
      )}

      {order.items && order.items.length > 0 && (
        <div>
          <p className="font-semibold text-gray-700 text-sm mb-2">Items list ({order.items.length})</p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-sm">
                <span className="text-gray-700 font-medium">
                  {item.medicine_name || `Product #${item.medicine_id}`}
                  {item.qty && <span className="text-gray-400 ml-1">x{item.qty}</span>}
                </span>
                <span className="font-bold text-gray-800">₹{Number(item.amount||item.selling_price||0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
      <Icon size={14} className="text-gray-400 mt-0.5 flex-shrink-0"/>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 font-medium uppercase">{label}</p>
        <p className="text-sm text-gray-800 font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ACTION FORM
───────────────────────────────────────────── */
function ActionForm({ action, note, setNote, riders, assignRider, setAssignRider, onConfirm, onCancel }) {
  const { type, order } = action;
  const needsNote   = ["cancel"].includes(type);
  const needsRider  = ["assign", "reassign"].includes(type);
  const isDestructive = type === "cancel";

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
        Order <span className="font-bold text-gray-800">#{order.id}</span> · 
        <span className="font-medium ml-1">{order.name}</span> · 
        <span className="font-bold text-violet-600 ml-1">₹{Number(order.total_amount||0).toFixed(0)}</span>
      </div>

      {needsNote && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for cancellation
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Enter reason here…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            required
          />
        </div>
      )}

      {needsRider && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select approved rider to dispatch</label>
          {riders.length === 0 ? (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-xl p-3">No approved riders registered.</p>
          ) : (
            <select
              value={assignRider}
              onChange={(e) => setAssignRider(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
            >
              <option value="">— Choose Rider —</option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.full_name || r.username} {r.mobileNo ? `· ${r.mobileNo}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onConfirm}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition
            ${isDestructive ? "bg-red-500 hover:bg-red-600" : "bg-violet-600 hover:bg-violet-700"}`}
        >
          Confirm
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
