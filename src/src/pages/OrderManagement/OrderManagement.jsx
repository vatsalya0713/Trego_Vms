import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Package, CheckCircle, Clock, Truck, XCircle, ShoppingBag,
  RefreshCw, Search, Eye, ChevronDown, X, User, MapPin,
  Phone, IndianRupee, Calendar, AlertCircle, Check, Bike
} from "lucide-react";

const API = "http://localhost:5000";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

/* ── STATUS CONFIG ── */
const STATUS_TABS = [
  { key: "all",              label: "All",             icon: Package,     color: "violet"  },
  { key: "new",              label: "New",             icon: ShoppingBag, color: "blue"    },
  { key: "accepted",         label: "Accepted",        icon: CheckCircle, color: "emerald" },
  { key: "pending",          label: "Pending",         icon: Clock,       color: "amber"   },
  { key: "assigned",         label: "Assigned",        icon: Bike,        color: "indigo"  },
  { key: "out for delivery", label: "Out for Delivery",icon: Truck,       color: "orange"  },
  { key: "delivered",        label: "Delivered",       icon: Check,       color: "green"   },
  { key: "cancelled",        label: "Cancelled",       icon: XCircle,     color: "red"     },
];

const STATUS_BADGE = {
  new:              "bg-blue-100 text-blue-700 border-blue-200",
  accepted:         "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending:          "bg-amber-100 text-amber-700 border-amber-200",
  assigned:         "bg-indigo-100 text-indigo-700 border-indigo-200",
  "out for delivery":"bg-orange-100 text-orange-700 border-orange-200",
  delivered:        "bg-green-100 text-green-700 border-green-200",
  cancelled:        "bg-red-100 text-red-700 border-red-200",
};

const COLOR_RING = {
  violet: "ring-violet-500 bg-violet-50 text-violet-700",
  blue:   "ring-blue-500 bg-blue-50 text-blue-700",
  emerald:"ring-emerald-500 bg-emerald-50 text-emerald-700",
  amber:  "ring-amber-500 bg-amber-50 text-amber-700",
  indigo: "ring-indigo-500 bg-indigo-50 text-indigo-700",
  orange: "ring-orange-500 bg-orange-50 text-orange-700",
  green:  "ring-green-500 bg-green-50 text-green-700",
  red:    "ring-red-500 bg-red-50 text-red-700",
};

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function OrderManagement() {
  const [activeTab, setActiveTab]     = useState("all");
  const [orders,    setOrders]        = useState([]);
  const [stats,     setStats]         = useState(null);
  const [riders,    setRiders]        = useState([]);
  const [loading,   setLoading]       = useState(true);
  const [search,    setSearch]        = useState("");
  const [detail,    setDetail]        = useState(null);   // selected order for detail modal
  const [action,    setAction]        = useState(null);   // { type, order }
  const [actionNote,setActionNote]    = useState("");
  const [assignRider,setAssignRider]  = useState("");
  const [toast,     setToast]         = useState(null);

  /* ── FETCH ── */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab !== "all" ? `?status=${encodeURIComponent(activeTab)}` : "";
      const res = await axios.get(`${API}/order/vendor/orders${params}`, authHeaders());
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/order/vendor/stats`, authHeaders());
      setStats(res.data);
    } catch (err) {
      console.error("stats error", err);
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
    fetchOrders();
    fetchStats();
    fetchRiders();
  }, [activeTab]);

  /* ── TOAST ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── ACTION SUBMIT ── */
  const handleAction = async () => {
    if (!action) return;
    const { type, order } = action;
    const id = order.id;

    try {
      if (type === "accept") {
        await axios.post(`${API}/order/vendor/orders/${id}/accept`, {}, authHeaders());
        showToast("Order accepted ✓");
      } else if (type === "cancel") {
        await axios.post(`${API}/order/vendor/orders/${id}/cancel`, { reason: actionNote }, authHeaders());
        showToast("Order cancelled");
      } else if (type === "pending") {
        await axios.post(`${API}/order/vendor/orders/${id}/pending`, { reason: actionNote }, authHeaders());
        showToast("Moved to pending");
      } else if (type === "assign") {
        if (!assignRider) return showToast("Select a rider", "error");
        const rider = riders.find((r) => String(r.id) === String(assignRider));
        await axios.post(`${API}/order/vendor/orders/${id}/assign`,
          { rider_id: assignRider, rider_name: rider?.full_name || rider?.username },
          authHeaders()
        );
        showToast("Rider assigned ✓");
      } else if (type === "out-delivery") {
        await axios.post(`${API}/order/vendor/orders/${id}/out-delivery`, {}, authHeaders());
        showToast("Out for delivery ✓");
      } else if (type === "deliver") {
        await axios.post(`${API}/order/vendor/orders/${id}/deliver`, {}, authHeaders());
        showToast("Order delivered ✓");
      }

      setAction(null);
      setActionNote("");
      setAssignRider("");
      fetchOrders();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed", "error");
    }
  };

  /* ── DETAIL FETCH ── */
  const openDetail = async (order) => {
    try {
      const res = await axios.get(`${API}/order/vendor/orders/${order.id}`, authHeaders());
      setDetail(res.data?.data || order);
    } catch {
      setDetail(order);
    }
  };

  /* ── FILTER ── */
  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      !q ||
      String(o.id).includes(q) ||
      (o.name || "").toLowerCase().includes(q) ||
      (o.mobile || "").toString().includes(q) ||
      (o.email || "").toLowerCase().includes(q)
    );
  });

  /* ── COUNT PER TAB ── */
  const byStatus = stats?.byStatus || [];
  const countForTab = (key) => {
    if (key === "all") return stats?.total?.count ?? 0;
    const found = byStatus.find((b) => b.order_status?.toLowerCase() === key.toLowerCase());
    return found?.count ?? 0;
  };

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
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
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {stats ? `${stats.today?.count ?? 0} orders today · ₹${(stats.today?.revenue ?? 0).toFixed(0)} revenue` : "Loading…"}
          </p>
        </div>
        <button
          onClick={() => { fetchOrders(); fetchStats(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Today's Orders",  value: stats.today?.count ?? 0,              color: "blue"   },
            { label: "Today's Revenue", value: `₹${(stats.today?.revenue??0).toFixed(0)}`, color: "emerald"},
            { label: "Total Orders",    value: stats.total?.count ?? 0,              color: "violet" },
            { label: "Total Revenue",   value: `₹${(stats.total?.revenue??0).toFixed(0)}`, color: "amber"  },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${
                s.color === "blue" ? "text-blue-600" :
                s.color === "emerald" ? "text-emerald-600" :
                s.color === "violet" ? "text-violet-600" : "text-amber-600"
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
              onClick={() => setActiveTab(tab.key)}
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

      {/* ── SEARCH ── */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, name, mobile…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      {/* ── ORDER TABLE ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <RefreshCw size={18} className="animate-spin"/> Loading orders…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <Package size={40} className="opacity-30"/>
            <p className="font-medium">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Order ID","Customer","Amount","Items","Status","Payment","Date","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => {
                  const status = (order.order_status || "new").toLowerCase();
                  const badgeCls = STATUS_BADGE[status] || "bg-gray-100 text-gray-600 border-gray-200";
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-violet-600">#{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{order.name || "—"}</p>
                        <p className="text-xs text-gray-400">{order.mobile || order.email || ""}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800">₹{Number(order.total_amount || 0).toFixed(0)}</td>
                      <td className="px-4 py-3 text-gray-600">{order.items_count ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeCls}`}>
                          {order.order_status || "new"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${order.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                          {order.payment_status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN", {day:"2-digit",month:"short"}) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <ActionButtons
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
        <Modal onClose={() => setDetail(null)} title={`Order #${detail.id}`}>
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
            onConfirm={handleAction}
            onCancel={() => setAction(null)}
          />
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ACTION BUTTONS per order status
───────────────────────────────────────────── */
const ACTION_TITLE = {
  accept:       "Accept Order",
  cancel:       "Cancel Order",
  pending:      "Move to Pending",
  assign:       "Assign Rider",
  "out-delivery": "Mark Out for Delivery",
  deliver:      "Mark as Delivered",
};

function ActionButtons({ order, onView, onAction }) {
  const status = (order.order_status || "new").toLowerCase();

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button
        onClick={onView}
        className="p-1.5 rounded-lg hover:bg-violet-50 text-violet-500 transition"
        title="View Details"
      >
        <Eye size={14}/>
      </button>

      {status === "new" && (
        <>
          <Btn color="emerald" label="Accept"  onClick={() => onAction("accept")}/>
          <Btn color="red"     label="Cancel"  onClick={() => onAction("cancel")}/>
        </>
      )}
      {status === "accepted" && (
        <>
          <Btn color="amber"  label="Pending"  onClick={() => onAction("pending")}/>
          <Btn color="indigo" label="Assign"   onClick={() => onAction("assign")}/>
          <Btn color="red"    label="Cancel"   onClick={() => onAction("cancel")}/>
        </>
      )}
      {status === "pending" && (
        <Btn color="indigo" label="Assign" onClick={() => onAction("assign")}/>
      )}
      {status === "assigned" && (
        <Btn color="orange" label="Out for Delivery" onClick={() => onAction("out-delivery")}/>
      )}
      {status === "out for delivery" && (
        <Btn color="green" label="Delivered" onClick={() => onAction("deliver")}/>
      )}
    </div>
  );
}

function Btn({ color, label, onClick }) {
  const map = {
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    red:     "bg-red-50 text-red-700 hover:bg-red-100",
    amber:   "bg-amber-50 text-amber-700 hover:bg-amber-100",
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
   ORDER DETAIL
───────────────────────────────────────────── */
function OrderDetail({ order }) {
  const status = (order.order_status || "new").toLowerCase();
  const badgeCls = STATUS_BADGE[status] || "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-sm">Order Status</span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeCls}`}>{order.order_status}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoRow icon={User}        label="Customer" value={order.name || "—"}/>
        <InfoRow icon={Phone}       label="Mobile"   value={order.mobile || "—"}/>
        <InfoRow icon={MapPin}      label="Address"  value={`${order.address || ""}${order.city ? ", " + order.city : ""}`}/>
        <InfoRow icon={IndianRupee} label="Amount"   value={`₹${Number(order.total_amount||0).toFixed(2)}`}/>
        <InfoRow icon={IndianRupee} label="Discount" value={`₹${Number(order.discount||0).toFixed(2)}`}/>
        <InfoRow icon={Calendar}    label="Date"     value={order.created_at ? new Date(order.created_at).toLocaleString("en-IN") : "—"}/>
      </div>

      {order.cancel_reason && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
          <span className="font-semibold">Note: </span>{order.cancel_reason}
        </div>
      )}

      {order.items && order.items.length > 0 && (
        <div>
          <p className="font-semibold text-gray-700 text-sm mb-2">Items ({order.items.length})</p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-sm">
                <span className="text-gray-700 font-medium">
                  {item.medicine_name || `Medicine #${item.medicine_id}`}
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
   ACTION FORM (inside modal)
───────────────────────────────────────────── */
function ActionForm({ action, note, setNote, riders, assignRider, setAssignRider, onConfirm, onCancel }) {
  const { type, order } = action;
  const needsNote   = ["cancel", "pending"].includes(type);
  const needsRider  = type === "assign";
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
            {type === "cancel" ? "Cancellation Reason" : "Pending Reason"} (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Enter reason…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
          />
        </div>
      )}

      {needsRider && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Rider</label>
          {riders.length === 0 ? (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-xl p-3">No approved riders available.</p>
          ) : (
            <select
              value={assignRider}
              onChange={(e) => setAssignRider(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
            >
              <option value="">— Select a rider —</option>
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
