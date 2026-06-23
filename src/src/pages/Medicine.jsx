import { useMemo, useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  X,
  User,
  Mail,
  CalendarClock,
  Search,
  Eye,
  Pencil,
  Ban,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import axios from "axios";

/* ------------ helpers ------------- */
const fmt = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d)) return "—";
  return d.toLocaleString();
};
const api = "http://localhost:5000";

// ---------------- API ----------------
async function addBucketAPI(fd) {
  const token = localStorage.getItem("token");

  return axios.post(`${api}/medicine/admin/bucket`, fd, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
}

// ---------------- Add Bucket Modal ----------------
function MedicineModel({ onClose, onSubmit }) {
  const [capacity, setCapacity] = useState("");
  const [medicines, setMedicines] = useState("");
  const [brand, setBrand] = useState("");
  const [updatedOn, setUpdatedOn] = useState("");
  const [photo, setPhoto] = useState(null);
  const [msg, setMsg] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [category, setCategory] = useState("pharmacy");
  const [categoryType, setCategoryType] = useState("");

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-5 shadow-2xl">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Add Bucket</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {msg && (
          <p className="mb-3 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-2 text-sm text-[#ffe863]">
            {msg}
          </p>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();

            const fd = new FormData();
            fd.append("bucket_name", bucketName);
            fd.append("capacity", capacity);
            fd.append("number_medicines", medicines);
            fd.append("created_by", brand);
            fd.append("createdAt", updatedOn);
            fd.append("category", category);
            fd.append("category_type", categoryType);

            if (photo) fd.append("images", photo);

            try {
              await onSubmit(fd);
              onClose();
            } catch (error) {
              setMsg("Error saving bucket");
            }
          }}
          className="space-y-3"
        >
          {/* Bucket Name */}
          <div>
            <label className="mb-1 block text-sm text-violet-500">
              Bucket Name
            </label>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3">
              <User size={20} className="text-[#56cfe1]" />
              <input
                className="w-full py-1 text-slate-900 px-5  border-1 border-slate-900 rounded-lg"
                placeholder="Small EP, Medium EP, Large EP"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="mb-1 block text-sm text-violet-500">Size</label>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3">
              <User size={20} className="text-[#56cfe1]" />
              <select
                className="w-full py-1 text-slate-900 px-5 border-1 border-slate-900 rounded-lg hover:cursor-pointer"
                value={capacity}
                onChange={(e) => {
                  const capacity=e.target.value;
                  setCapacity(capacity);
                  if (capacity == "small") {
                    setMedicines(500);
                  } else if (capacity == "medium") {
                    setMedicines(1000);
                  } else if (capacity == "large") {
                    setMedicines(100000);
                  }
                }}
                required
              >
                <option value="">Select Type</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Medicines */}
          <div>
            <label className="mb-1 block text-sm text-violet-500">
              Capacity
            </label>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3">
              <User size={20} className="text-[#56cfe1]" />
              <input
                className="w-full py-1 text-slate-900 px-5  border-1 border-slate-900 rounded-lg"
                placeholder="500, 1000, 1500..."
                value={medicines}
              />
            </div>
          </div>

          {/* Brand */}
          <div>
            <label className="mb-1 block text-sm text-violet-500">
              Brand Name
            </label>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3">
              <Mail size={20} className="text-[#56cfe1]" />
              <input
                className="w-full py-1 text-slate-900 px-5  border-1 border-slate-900 rounded-lg"
                placeholder="Brand Name"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-violet-500">Category</label>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3">
              <User size={20} className="text-[#56cfe1]" />
              <select
                className="w-full py-1 text-slate-900 px-5  border-1 border-slate-900 rounded-lg"
                value={category}
                disabled
              >
                <option value="pharmacy">Pharmacy</option>
              </select>
            </div>
          </div>

          {/* Category Type */}
          <div>
            <label className="mb-1 block text-sm text-violet-500">Type</label>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3">
              <User size={20} className="text-[#56cfe1]" />
              <select
                className="w-full py-1 text-slate-900 px-5 border-1 border-slate-900 rounded-lg"
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                required
              >
                <option value="">Select Type</option>
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="super_stockist">Super Stockist</option>
              </select>
            </div>
          </div>

          {/* Updated On */}
          <div>
            <label className="block text-sm text-violet-500">Updated On</label>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3">
              <User size={20} className="text-[#56cfe1]" />
              <input
                type="date"
                className="w-full py-1 text-slate-900 px-5 rounded-lg"
                value={updatedOn}
                onChange={(e) => setUpdatedOn(e.target.value)}
              />
            </div>
          </div>

          {/* Upload Photo */}
          <div>
            <label className="mb-1 block text-sm text-violet-500">
              Upload Photo
            </label>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3">
              <User size={20} className="text-[#56cfe1]" />
              <input
                type="file"
                accept="image/*"
                className="w-full text-slate-900 "
                onChange={(e) => setPhoto(e.target.files[0])}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-1 ">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-red-500 hover:cursor-pointer text-red-500 px-3 py-2 text-sm hover:bg-red-500 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-md border border-emerald-500 hover:cursor-pointer text-emerald-500 px-3 py-2 text-sm hover:bg-emerald-600 hover:text-white"
            >
              Add Bucket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------ Page ------------- */
export default function Medicine() {
  const [toast, setToast] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [editRow, setEditRow] = useState(null);
  // const [delRow, setDelRow] = useState(null);

  const [buckets, setBuckets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const api = "http://localhost:5000";

  const filteredBuckets = useMemo(() => {
    const q = query.toLowerCase().trim();
    return buckets.filter(
      (b) =>
        !q ||
        (b.name || "").toLowerCase().includes(q) ||
        (b.category || "").toLowerCase().includes(q) ||
        (b.category_type || "").toLowerCase().includes(q) ||
        (b.created_by || "").toLowerCase().includes(q),
    );
  }, [buckets, query]);

  const fetchBuckets = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${api}/medicine/admin/bucket`);
      setBuckets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching buckets:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to load buckets",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  const handleCreate = async (fd) => {
    try {
      await addBucketAPI(fd);
      setOpenAdd(false);
      setToast("Bucket created successfully");
      await fetchBuckets();
    } catch (err) {
      console.error(err);
      setError("Failed to create bucket");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Medicine Cart</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center min-w-xl gap-2 rounded-md border border-slate-900 px-2">
            <Search size={16} className="text-gray-400" />
            <input
              className="bg-transparent py-1.5 text-sm outline-none text-slate-900 placeholder:text-slate-400"
              placeholder="Search buckets…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setOpenAdd(true)}
            className="inline-flex items-center gap-2 rounded-md bg-violet-500 px-3 py-2 text-[#ffe863] font-medium hover:cursor-pointer"
          >
            <Plus size={16} /> Create New Bucket
          </button>
        </div>
      </div>

      {toast && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {toast}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-400">Loading buckets...</div>
      ) : error ? (
        <div className="text-sm text-red-400">Error: {error}</div>
      ) : (
        <div className="flex gap-4 flex-wrap">
          {filteredBuckets.map((b) => {
            let images = [];
            try {
              if (Array.isArray(b.image)) images = b.image;
              else if (typeof b.image === "string" && b.image.trim())
                images = JSON.parse(b.image);
            } catch (e) {
              if (b.image) images = [b.image];
            }
            const imgSrc = images && images.length ? images[0] : "./medic.jpg";

            return (
              <div
                key={b.id ?? b.name}
                className="w-46 h-58 border-black cursor-pointer bg-violet-500/5 p-3 rounded-lg shadow-lg"
                onClick={() =>
                  navigate(
                    user?.role === "VENDOR"
                      ? `/vendor/medicine/${b.id}`
                      : `/medicine/${b.id}`,
                  )
                }
              >
                <h1 className="text-center text-violet-500 text-lg font-semibold mb-1 truncate">
                  {b.name}
                </h1>

                <img
                  src={imgSrc}
                  alt={b.name}
                  className="h-24 w-full object-cover rounded-md mb-2"
                />

                <p className="text-xs text-[#f72585]">
                  Bucket Capacity: <span className="text-slate-900">{b.number_medicines ?? "—"}</span>
                </p>
                <p className="text-xs text-[#f72585]">
                 Bucket Size: <span className="text-slate-900">{b.capacity ?? "—"}</span>
                </p>
                <p className="text-xs text-[#f72585]">
                  Category: <span className="text-slate-900">{b.category ?? "—"}</span>
                </p>
                <p className="text-xs text-[#f72585]">
                  Category Type: <span className="text-slate-900">{b.category_type ?? "—"}</span>
                </p>
                <p className="text-xs text-[#f72585]">
                  Available Medicines: <span className="text-slate-900">{b.total_medicines || "0"}</span>
                </p>
              </div>
            );
          })}
          <div className="w-35 h-35 p-12 mt-9 border-white/10 bg-white/5 flex items-center justify-center rounded-md">
            <button onClick={() => setOpenAdd(true)}>
              <Plus size={120} />
            </button>
          </div>{" "}
        </div>
      )}

      {/* Modals */}
      {openAdd && (
        <MedicineModel
          mode="add"
          onClose={() => setOpenAdd(false)}
          onSubmit={handleCreate}
        />
      )}
      {/* Edit Modal */}
      {editRow && (
        <MedicineModel
          mode="edit"
          initial={editRow}
          onClose={() => setEditRow(null)}
          onSubmit={async (id, payload) => {
            await fetchBuckets();
            setEditRow(null);
          }}
        />
      )}
    </div>
  );
}
