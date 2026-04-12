import { useMemo, useState, useRef, useEffect } from "react";
import {
  Plus,
  X,
  User,
  Mail,
  Search,
  Eye,
  Pencil,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
// import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AddMedicineFromDBModal from "../AddMedicineFromDBModal";

/* ------------ Modal Helper ------------- */
function useOutsideClose(ref, onClose) {
  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onClose?.();
    }
    function onEsc(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [ref, onClose]);
}

/* ------------ Add/Edit Medicine Modal ------------- */
function MedicineModal({ mode = "add", initial = {}, onClose, onSubmit }) {
  const boxRef = useRef(null);
  useOutsideClose(boxRef, onClose);
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: initial.name || "",
    salt_composition: initial.salt_composition || "",
    manufacturers: initial.manufacturers || "",
    medicine_type: initial.medicine_type || "",
    packaging: initial.packaging || "",
    packaging_typ: initial.packaging_typ || "",
    mrp: initial.mrp || "",
    cost_price: initial.cost_price || "",
    discount_percent: initial.discount_percent || "",
    selling_price: initial.selling_price || "",
    offers_percent: initial.offers_percent || "",
    prescription_required: initial.prescription_required || 0,
    storage: initial.storage || "",
    country_of_origin: initial.country_of_origin || "",
    manufacture_address: initial.manufacture_address || "",
    best_price: initial.best_price || "",
    brought: initial.brought || "",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [preview, setPreview] = useState(initial.image ? [initial.image] : []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    setPreview(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    for (const key in form) {
      fd.append(key, form[key]);
    }

    imageFiles.forEach((file) => {
      fd.append("images", file);
    });

    await onSubmit(fd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/50 p-4 overflow-auto">
      <div
        ref={boxRef}
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {isEdit ? "Edit Medicine" : "Create Medicine"}
          </h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {/* FORM START */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <Input
            label="Salt Composition"
            name="salt_composition"
            value={form.salt_composition}
            onChange={handleChange}
          />

          <Input
            label="Manufacturer"
            name="manufacturers"
            value={form.manufacturers}
            onChange={handleChange}
          />
          <Input
            label="Medicine Type"
            name="medicine_type"
            value={form.medicine_type}
            onChange={handleChange}
          />

          <Input
            label="Packaging"
            name="packaging"
            value={form.packaging}
            onChange={handleChange}
          />
          <Input
            label="Packaging Type"
            name="packaging_typ"
            value={form.packaging_typ}
            onChange={handleChange}
          />

          <Input
            type="number"
            label="MRP"
            name="mrp"
            value={form.mrp}
            onChange={handleChange}
          />
          <Input
            type="number"
            label="Cost Price"
            name="cost_price"
            value={form.cost_price}
            onChange={handleChange}
          />

          <Input
            type="number"
            label="Discount %"
            name="discount_percent"
            value={form.discount_percent}
            onChange={handleChange}
          />
          <Input
            type="number"
            label="Selling Price"
            name="selling_price"
            value={form.selling_price}
            onChange={handleChange}
          />

          <Input
            type="number"
            label="Offers %"
            name="offers_percent"
            value={form.offers_percent}
            onChange={handleChange}
          />
          <Input
            type="number"
            label="Best Price"
            name="best_price"
            value={form.best_price}
            onChange={handleChange}
          />

          <Input
            label="Bought"
            name="brought"
            value={form.brought}
            onChange={handleChange}
          />
          <Input
            label="Country of Origin"
            name="country_of_origin"
            value={form.country_of_origin}
            onChange={handleChange}
          />

          <Input
            label="Storage"
            name="storage"
            value={form.storage}
            onChange={handleChange}
          />
          <Input
            label="Manufacture Address"
            name="manufacture_address"
            value={form.manufacture_address}
            onChange={handleChange}
          />

          {/* Prescription dropdown */}
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-gray-400">
              Prescription Required
            </label>
            <select
              name="prescription_required"
              value={form.prescription_required}
              onChange={handleChange}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none"
            >
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </div>

          {/* Multiple Image Upload */}
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-gray-400">
              Upload Images (max 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImage}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2"
            />

            {/* Preview */}
            {preview.length > 0 && (
              <div className="flex gap-3 mt-3 flex-wrap">
                {preview.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    className="w-24 h-24 rounded-md object-cover border border-white/10"
                  />
                ))}
              </div>
            )}
          </div>
        </form>

        {/* BUTTONS */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm hover:bg-emerald-500"
          >
            {isEdit ? "Save Changes" : "Add Medicine"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-400">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none"
      />
    </div>
  );
}

/*---- MDECINE VIEW MODEL----*/
function MedicineViewModal({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[3000] grid place-items-center bg-black/50 p-4 overflow-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl relative">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Medicine Details</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        {/* SHOW MULTIPLE IMAGES */}
        {data.images && data.images.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {data.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                className="w-32 h-32 rounded-xl border border-white/10 object-cover"
              />
            ))}
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT COLUMN → LABELS */}
          <div className="space-y-3">
            <Info label="ID" />
            {/* <Info label="Bucket ID" /> */}
            <Info label="Name" />
            <Info label="Salt Composition" />
            <Info label="Manufacturer" />
            <Info label="Medicine Type" />
            <Info label="Packaging" />
            <Info label="Packaging Type" />
            <Info label="MRP" />
            <Info label="Cost Price" />
            <Info label="Discount %" />
            <Info label="Selling Price" />
            <Info label="Offers %" />
            <Info label="Prescription Required" />
            <Info label="Storage" />
            <Info label="Country of Origin" />
            <Info label="Manufacture Address" />
            <Info label="Best Price" />
            <Info label="Bought From" />
            <Info label="Created At" />
          </div>

          {/* RIGHT COLUMN → VALUES */}
          <div className="space-y-3">
            <Info value={data.id} />
            {/* <Info value={data.bucket_id} /> */}
            <Info value={data.name} />
            <Info value={data.salt_composition?data.salt_composition:"Not Describe"} />
            <Info value={data.manufacturers?data.manufacturers:"Not Describe"} />
            <Info value={data.medicine_type?data.medicine_type:"Not Describe"} />
            <Info value={data.packaging?data.packaging:"Not Describe"} />
            <Info value={data.packaging_typ?data.packaging_typ:"Not Describe"} />
            <Info value={data.mrp?`₹${data.mrp}`:"Not Describe"} />
            <Info value={data.cost_price?`₹${data.cost_price}`:"Not Describe"} />
            <Info value={data.discount_percent?`${data.discount_percent}%`:"Not Describe"} />
            <Info value={data.selling_price?`₹${data.selling_price}`:"Not Describe"} />
            <Info value={data.offers_percent?`${data.offers_percent}%`:"Not Describe"} />
            <Info value={data.prescription_required ? "Yes" : "No"} />
            <Info value={data.storage?data.storage:"Not Describe"} />
            <Info value={data.country_of_origin?data.country_of_origin:"Not Describe"} />
            <Info value={data.manufacture_address?data.manufacture_address:"Not Describe"} />
            <Info value={data.best_price?`₹${data.best_price}`:"Not Describe"} />
            <Info value={data.brought?data.brought:"Not Describe"} />
            <Info value={new Date(data.created_at).toLocaleString()} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      {label && <p className="text-sm font-semibold text-gray-300">{label}</p>}
      {value && <p className="text-sm text-gray-100">{value}</p>}
    </div>
  );
}

/* ------------ Copy Admin Medicines Modal ------------- */
function CopyAdminMedicinesModal({ onClose, onCopy }) {
  const boxRef = useRef(null);
  useOutsideClose(boxRef, onClose);

  const [adminMedicines, setAdminMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAdminMedicines = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/medicine/db-medicines",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setAdminMedicines(res.data.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load admin medicines");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminMedicines();
  }, []);

  const toggleMedicine = (medicineId) => {
    const newSelected = new Set(selectedMedicines);
    if (newSelected.has(medicineId)) {
      newSelected.delete(medicineId);
    } else {
      newSelected.add(medicineId);
    }
    setSelectedMedicines(newSelected);
  };

  const toggleAll = () => {
    const filtered = filteredMedicines;
    if (selectedMedicines.size === filtered.length) {
      setSelectedMedicines(new Set());
    } else {
      setSelectedMedicines(new Set(filtered.map((m) => m.id)));
    }
  };

  const filteredMedicines = useMemo(() => {
    if (!searchQuery.trim()) return adminMedicines;
    const q = searchQuery.toLowerCase();
    return adminMedicines.filter((m) =>
      [m.name, m.salt_composition, m.manufacturers, m.packaging]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [adminMedicines, searchQuery]);

  const handleCopy = async () => {
    if (selectedMedicines.size === 0) {
      alert("Please select at least one medicine");
      return;
    }

    await onCopy(Array.from(selectedMedicines));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/50 p-4 overflow-auto">
      <div
        ref={boxRef}
        className="w-full max-w-4xl rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Copy Admin Medicines</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Medicines List */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold">
              Admin Medicines ({filteredMedicines.length})
            </label>
            {filteredMedicines.length > 0 && (
              <button
                onClick={toggleAll}
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                {selectedMedicines.size === filteredMedicines.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-gray-400">Loading medicines...</p>
          ) : filteredMedicines.length === 0 ? (
            <p className="text-gray-400">No medicines found</p>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredMedicines.map((med) => {
                const isSelected = selectedMedicines.has(med.db_medicine_id);
                return (
                  <div
                    key={med.db_medicine_id}
                    onClick={() => toggleMedicine(med.db_medicine_id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isSelected ? (
                        <CheckSquare
                          size={20}
                          className="mt-0.5 text-emerald-400"
                        />
                      ) : (
                        <Square size={20} className="mt-0.5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{med.name}</p>
                        <p className="text-xs text-gray-400">
                          {med.category &&
                            `category: ${med.category} • `}
                          MRP: ₹{med.price}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={selectedMedicines.size === 0}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Copy Selected ({selectedMedicines.size})
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------ Copy Bucket Medicines Modal ------------- */
function CopyBucketModal({ onClose, onCopy }) {
  const boxRef = useRef(null);
  useOutsideClose(boxRef, onClose);

  const [buckets, setBuckets] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [bucketMedicines, setBucketMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingMedicines, setLoadingMedicines] = useState(false);

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/medicine/vendor/buckets",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setBuckets(res.data.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load buckets");
      } finally {
        setLoading(false);
      }
    };
    fetchBuckets();
  }, []);

  const handleBucketSelect = async (bucketId) => {
    setSelectedBucket(bucketId);
    setSelectedMedicines(new Set());

    try {
      setLoadingMedicines(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/medicine/bucket/${bucketId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBucketMedicines(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load medicines");
      setBucketMedicines([]);
    } finally {
      setLoadingMedicines(false);
    }
  };

  const toggleMedicine = (medicineId) => {
    const newSelected = new Set(selectedMedicines);
    if (newSelected.has(medicineId)) {
      newSelected.delete(medicineId);
    } else {
      newSelected.add(medicineId);
    }
    setSelectedMedicines(newSelected);
  };

  const toggleAll = () => {
    if (selectedMedicines.size === bucketMedicines.length) {
      setSelectedMedicines(new Set());
    } else {
      setSelectedMedicines(new Set(bucketMedicines.map((m) => m.id)));
    }
  };

  const handleCopy = async () => {
    if (!selectedBucket) {
      alert("Please select a bucket");
      return;
    }

    if (selectedMedicines.size === 0) {
      alert("Please select at least one medicine");
      return;
    }

    await onCopy(selectedBucket, Array.from(selectedMedicines));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/50 p-4 overflow-auto">
      <div
        ref={boxRef}
        className="w-full max-w-4xl rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Copy Bucket Medicines</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {/* Bucket Selection */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold">
            Select Bucket
          </label>
          {loading ? (
            <p className="text-gray-400">Loading buckets...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {buckets.map((bucket) => (
                <button
                  key={bucket.id}
                  onClick={() => handleBucketSelect(bucket.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedBucket === bucket.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold">{bucket.name}</p>
                  <p className="text-xs text-gray-400">
                    Medicines: {bucket.number_medicines || 0}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Medicines List */}
        {selectedBucket && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold">
                Medicines in Bucket ({bucketMedicines.length})
              </label>
              {bucketMedicines.length > 0 && (
                <button
                  onClick={toggleAll}
                  className="text-sm text-emerald-400 hover:text-emerald-300"
                >
                  {selectedMedicines.size === bucketMedicines.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              )}
            </div>

            {loadingMedicines ? (
              <p className="text-gray-400">Loading medicines...</p>
            ) : bucketMedicines.length === 0 ? (
              <p className="text-gray-400">No medicines in this bucket</p>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {bucketMedicines.map((med) => {
                  const isSelected = selectedMedicines.has(med.id);
                  return (
                    <div
                      key={med.id}
                      onClick={() => toggleMedicine(med.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isSelected ? (
                          <CheckSquare
                            size={20}
                            className="mt-0.5 text-emerald-400"
                          />
                        ) : (
                          <Square size={20} className="mt-0.5 text-gray-400" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{med.name}</p>
                          <p className="text-xs text-gray-400">
                            {med.salt_composition &&
                              `Salt: ${med.salt_composition} • `}
                            MRP: ₹{med.mrp}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={!selectedBucket || selectedMedicines.size === 0}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Copy Selected ({selectedMedicines.size})
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------ MAIN PAGE ------------- */
export default function MedicineDetails() {
  const { id } = useParams(); // bucket id
  // const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [delRow, setDelRow] = useState(null);
  const [openAddMedicine, setOpenAddMedicine] = useState(false);
  const [dbMedicines, setDbMedicines] = useState([]);
  const [loadingDB, setLoadingDB] = useState(false);
  const [openCopyBucket, setOpenCopyBucket] = useState(false);
  const [openCopyAdmin, setOpenCopyAdmin] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  };

  /*------FETCH MEDICINE DETAIL WITH ID------*/
  const [viewRow, setViewRow] = useState(false);
  const[viewdata,setViewdata]=useState([])
  const [loadingView, setLoadingView] = useState(false);

  const openViewModal = async (medicineId) => {
    try {
      setLoadingView(true);
      const token = localStorage.getItem("token");

      const url =`http://localhost:5000/medicine/vendor/medicine/${medicineId}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setViewRow(true);
      setViewdata(res.data.data);
      console.log(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch medicine details");
    } finally {
      setLoadingView(false);
    }
  };

  /*---Adding Medicine to Bucket---*/

  const addMedicineToBucket = async (medicines) => {
    if (!id) {
      alert("Bucket ID missing");
      return;
    }

    const items = Array.isArray(medicines) ? medicines : [medicines];

    try {
      const token = localStorage.getItem("token");

      for (const med of items) {
        await axios.post(
          "http://localhost:5000/medicine/vendor/bucket/add-medicine",
          {
            medicine_id: med.id,
            medicine_source: med.medicine_source,
            bucket_id: id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }

      showToast("Medicine added to bucket");
      setOpenAddMedicine(false);

      // reload bucket medicines
      // const reload = await axios.get(
      //   `http://localhost:5000/medicine/vendor/bucket/${id}/medicines`,
      //   { headers: { Authorization: `Bearer ${token}` } },
      // );

      // setMedicines(reload.data);
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to add medicine");
    }
  };

  /*-----Added Medicine Data ----- */

  const handleAddMedicine = async (fd) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/medicine/vendor/medicine/${id}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      showToast("Medicine Added Successfully");
      setOpenAdd(false);
    } catch (err) {
      console.log(err.response?.data || err);
      alert("Failed to add medicine");
    }
  };

  /*-----Copy Bucket Medicines to Vendor Table ----- */
  const handleCopyBucketMedicines = async (bucketId, selectedMedicineIds) => {
    try {
      const token = localStorage.getItem("token");

      // Copy all medicines from bucket (backend will handle filtering)
      const res = await axios.post(
        `http://localhost:5000/medicine/vendor/bucket/${bucketId}/copy-medicines`,
        { selected_medicine_ids: selectedMedicineIds },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      showToast(
        res.data.message ||
          `Successfully copied ${selectedMedicineIds.length} medicines`,
      );

      // Reload medicines if we're on a bucket page
      if (id) {
        const reload = await axios.get(
          `http://localhost:5000/medicine/vendor/bucket/${id}/medicines`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMedicines(reload.data);
      }

      // Also reload vendor medicines to show the copied ones
      const vendorMedicinesRes = await axios.get(
        `http://localhost:5000/medicine/vendor/medicine`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // You can use this data to show in a separate view if needed
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to copy bucket medicines");
    }
  };

  /*-----Copy Admin Medicines to Vendor Table ----- */
  const handleCopyAdminMedicines = async (selectedMedicineIds) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `http://localhost:5000/medicine/copy-master-medicines`,
        { selected_medicine_ids: selectedMedicineIds, bucket_id: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      showToast(
        res.data.message ||
          `Successfully copied ${selectedMedicineIds.length} medicines`,
      );
      load();
      // Reload medicines if we're on a bucket page
      // if (id) {
      //   const reload = await axios.get(
      //     `http://localhost:5000/medicine/vendor/bucket/${id}/medicines`,
      //     { headers: { Authorization: `Bearer ${token}` } },
      //   );
      //   setMedicines(reload.data);
      // }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to copy admin medicines");
    }
  };

  /*-----Update Medicine ----- */
  const handleUpdateMedicine = async (fd, medicineId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/medicine/vendor/medicine/${medicineId}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      showToast("Medicine Updated Successfully");
      setEditRow(null);

      // Reload medicines
      const reload = await axios.get(
        `http://localhost:5000/medicine/vendor/bucket/${id}/medicines`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMedicines(reload.data);
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Failed to update medicine");
    }
  };

  
  /* ------------ Fetch Medicines ------------- */
  useEffect(() => {
    load();

    if (id) load();
  }, [id]);
   async function load() {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:5000/medicine/vendor/medicine/bucket/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setMedicines(res.data.data);
        showToast("Medicines Loaded");
      } catch (err) {
        console.log(err);
        showToast("Failed to Load");
      }
    }
  /* ------------ Search Filter ------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicines;

    return medicines.filter((m) =>
      [m.name, m.salt_composition, m.manufacturers, m.packaging]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [query, medicines]);

  /*-----Delete Medicine---- */
  const handleDelete = async (m) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/medicine/vendor/medicine/${m}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMedicines((prev) => prev.filter((item) => item.id !== m.id));

      showToast("Medicine removed from bucket");
      load();
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to remove medicine from bucket");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Bucket Medicines</h1>

        <div className="flex items-center gap-2">
          {/* Copy Admin Medicines to Vendor Table */}
          <button
            onClick={() => setOpenCopyAdmin(true)}
            className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-3 py-2 text-sm hover:bg-purple-500"
          >
            <Plus size={16} /> Add Medicines
          </button>

          {/* Copy Bucket Medicines to Vendor Table */}
          <button
            onClick={() => setOpenCopyBucket(true)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm hover:bg-blue-500"
          >
            <Plus size={16} /> Copy Bucket Medicines
          </button>

          {/* Create New Medicine */}
          <button
            onClick={() => setOpenAdd(true)}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm hover:bg-emerald-500"
          >
            <Plus size={16} /> Create New Medicine
          </button>
        </div>
      </div>

      {/* Toast Message */}
      {toast && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {toast}
        </div>
      )}
    {loadingView && (
      <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
        Loading...
      </div>
    )}
      {/* Table */}
      <div className=" rounded-xl border border-white/10 bg-white/5">
        <table className="min-w-full text-sm">
          {/* HEADER */}
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2">S.No</th>
                <th className="px-3 py-2">Owner</th>

              <th className="px-3 py-2">Medicine Name</th>
              
              <th className="px-3 py-2">Salt</th>
              <th className="px-3 py-2">Manufacturer</th>
              <th className="px-3 py-2">MRP</th>
              <th className="px-3 py-2">Selling Price</th>
              <th className="px-3 py-2">Discount</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {medicines.map((m, index) => (
              <tr key={m.id} className="border-t border-white/10">
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2">{m.medicine_owner}</td>
                <td className="px-3 py-2">{m.name}</td>
                <td className="px-3 py-2">{m.salt_composition?m.salt_composition:"Not Describe"}</td>
                <td className="px-3 py-2">{m.manufacturers}</td>
                <td className="px-3 py-2">₹{m.mrp?m.mrp:m.best_price}</td>
                <td className="px-3 py-2">₹{m.best_price?m.best_price:"Not Available"}</td>
                <td className="px-3 py-2">₹{m.discount_percent?m.discount_percent:"0"}%</td>
                <td className="px-3 py-2">{m.brought?m.brought:"0"}</td>

                {/* ACTION BUTTONS */}
                <td className="px-2 py-2 flex gap-2">
                  <button
                    onClick={() => openViewModal(m.id)}
                      className="rounded-md border border-white/10 px-2 py-1 hover:bg-white/5"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => handleEdit(m)}
                      className="rounded-md border border-white/10 px-2 py-1 hover:bg-white/5"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(m.id)}
                      className="rounded-md border border-white/10 px-2 py-1 hover:bg-white/5"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {!medicines.length && (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-400">
                  No medicines found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modals */}
      {openAdd && (
        <MedicineModal
          mode="add"
          onClose={() => setOpenAdd(false)}
          onSubmit={handleAddMedicine}
        />
      )}

      {editRow && (
        <MedicineModal
          mode="edit"
          initial={editRow}
          onClose={() => setEditRow(null)}
          onSubmit={(fd) => handleUpdateMedicine(fd, editRow.id)}
        />
      )}

      {delRow && (
        <DeleteConfirm
          name={delRow.name}
          onClose={() => setDelRow(null)}
          onConfirm={handleDelete}
        />
      )}

      {/*Adding Medicine Through DataBase*/}
      {openAddMedicine && (
        <AddMedicineFromDBModal
          medicines={dbMedicines}
          onClose={() => setOpenAddMedicine(false)}
          onAdd={addMedicineToBucket}
        />
      )}

      {viewRow && (
        <MedicineViewModal data={viewdata} onClose={() => setViewRow(false)} />
      )}

      {/* Copy Bucket Modal */}
      {openCopyBucket && (
        <CopyBucketModal
          onClose={() => setOpenCopyBucket(false)}
          onCopy={handleCopyBucketMedicines}
        />
      )}

      {/* Copy Admin Medicines Modal */}
      {openCopyAdmin && (
        <CopyAdminMedicinesModal
          onClose={() => setOpenCopyAdmin(false)}
          onCopy={handleCopyAdminMedicines}
        />
      )}
    </div>
  );
}
