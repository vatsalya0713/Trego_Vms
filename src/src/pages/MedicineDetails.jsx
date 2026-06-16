import { useMemo, useState, useRef, useEffect } from "react";
import { Plus,Edit, X, User, Mail, Search, Eye, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AddMedicineFromDBModal from "./AddMedicineFromDBModal";
import MedicineFormModal from "./MedicineFormModal";

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

const API_BASE = "http://localhost:5000";

const formatDateForInput = (val) => {
  if (!val) return "";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

/* ------------ Batch Search Panel (inside PriceModal) ------------- */
function BatchSearchPanel({ medicineId, batches, loadingBatches, handleAddBatch, creating, onBatchesChange, onUpdated, onSuccess, form }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [quantityInput, setQuantityInput] = useState("");
  const [savingQty, setSavingQty] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    mrp: form?.mrp || "",
    expiry_date: form?.expiry_date || "",
    manufacturer_date: form?.manufacturer_date || "",
    quantity: "",
  });
  const [creatingNew, setCreatingNew] = useState(false);

  const filtered = searchQuery.trim()
    ? batches.filter((b) =>
        String(b.batch_id).toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : batches;

  const noMatch = searchQuery.trim() !== "" && filtered.length === 0;

  const handleBatchTap = (batch) => {
    setSelectedBatch(batch);
    setQuantityInput(batch.quantity != null ? String(batch.quantity) : "");
    setShowCreateForm(false);
  };

  const handleSaveQuantity = async () => {
    if (quantityInput === "" || isNaN(Number(quantityInput)) || Number(quantityInput) < 0) {
      alert("Please enter a valid quantity");
      return;
    }
    try {
      setSavingQty(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE}/medicine/update/batch/${selectedBatch.id}/${selectedBatch.medicine_id}`,
        { quantity: Number(quantityInput) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onBatchesChange((prev) =>
        prev.map((b) =>
          (b.id === selectedBatch.id || b.batch_id === selectedBatch.batch_id)
            ? { ...b, quantity: Number(quantityInput) }
            : b
        )
      );
      onSuccess?.(`Batch ${selectedBatch.batch_id} quantity updated`);
      await onUpdated?.();
      setSelectedBatch(null);
    } catch (err) {
      console.error(err.response);
      alert(err.response?.data?.message || "Failed to update quantity");
    } finally {
      setSavingQty(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (!window.confirm(`Delete batch ${selectedBatch.batch_id}? This cannot be undone.`)) return;
    try {
      setDeletingBatch(true);
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE}/medicine/delete/batch/${selectedBatch.id}/${selectedBatch.medicine_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onBatchesChange((prev) =>
        prev.filter((b) => b.id !== selectedBatch.id && b.batch_id !== selectedBatch.batch_id)
      );
      onSuccess?.(`Batch ${selectedBatch.batch_id} deleted`);
      await onUpdated?.();
      setSelectedBatch(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete batch");
    } finally {
      setDeletingBatch(false);
    }
  };

  const handleCreateFormChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleCreateNewBatch = async (e) => {
    e.preventDefault();
    if (!createForm.mrp || !createForm.expiry_date) {
      alert("MRP and Expiry Date are required");
      return;
    }
    try {
      setCreatingNew(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/medicine/batch`,
        {
          medicine_id: Number(medicineId),
          mrp: Number(createForm.mrp),
          expiry_date: createForm.expiry_date,
          manufacturer_date: createForm.manufacturer_date || null,
          quantity: createForm.quantity ? Number(createForm.quantity) : 0,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const created = res.data?.data;
      if (created) {
        onBatchesChange((prev) => {
          const exists = prev.some(
            (b) => (b.id && b.id === created.id) || (b.batch_id && b.batch_id === created.batch_id)
          );
          return exists ? prev : [created, ...prev];
        });
      }
      onSuccess?.(`Batch ${created?.batch_id || ""} created successfully`);
      await onUpdated?.();
      setShowCreateForm(false);
      setSearchQuery("");
      setCreateForm({ mrp: "", expiry_date: "", manufacturer_date: "", quantity: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create batch");
    } finally {
      setCreatingNew(false);
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-200 bg-white">
        <p className="text-sm font-semibold text-slate-700 mb-2">Batch List</p>
        <div className="relative">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedBatch(null);
              setShowCreateForm(false);
            }}
            placeholder="Search batch number..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-slate-300 outline-none focus:border-indigo-400 bg-white text-slate-800"
          />
        </div>
      </div>

      {selectedBatch && (
        <div className="px-3 py-3 border-b border-slate-200 bg-indigo-50">
          <p className="text-sm font-semibold text-indigo-700 mb-2">
            Batch: <span className="font-bold">{selectedBatch.batch_id}</span> — Update Quantity
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              placeholder="Enter quantity"
              className="flex-1 px-3 py-1.5 text-sm rounded-md border border-indigo-300 outline-none focus:border-indigo-500 bg-white text-slate-800"
            />
            <button
              type="button"
              onClick={handleSaveQuantity}
              disabled={savingQty || deletingBatch}
              className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {savingQty ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleDeleteBatch}
              disabled={savingQty || deletingBatch}
              className="px-3 py-1.5 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            >
              {deletingBatch ? "Deleting..." : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => setSelectedBatch(null)}
              className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {noMatch && !showCreateForm && (
        <div className="px-3 py-3 border-b border-slate-200 bg-amber-50 flex items-center justify-between">
          <p className="text-sm text-amber-700">
            No batch found for "<span className="font-semibold">{searchQuery}</span>"
          </p>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-amber-500 text-white hover:bg-amber-600"
          >
            <Plus size={14} /> Create Batch
          </button>
        </div>
      )}

      {showCreateForm && (
        <div className="px-3 py-3 border-b border-slate-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-700 mb-3">Create New Batch</p>
          <form onSubmit={handleCreateNewBatch} className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 mb-1 block">MRP *</label>
              <input
                type="number"
                name="mrp"
                value={createForm.mrp}
                onChange={handleCreateFormChange}
                placeholder="MRP"
                required
                className="w-full px-2 py-1.5 text-sm rounded-md border border-slate-300 outline-none focus:border-amber-400 bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Quantity</label>
              <input
                type="number"
                name="quantity"
                min="0"
                value={createForm.quantity}
                onChange={handleCreateFormChange}
                placeholder="Quantity"
                className="w-full px-2 py-1.5 text-sm rounded-md border border-slate-300 outline-none focus:border-amber-400 bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Manufacture Date</label>
              <input
                type="date"
                name="manufacturer_date"
                value={createForm.manufacturer_date}
                onChange={handleCreateFormChange}
                className="w-full px-2 py-1.5 text-sm rounded-md border border-slate-300 outline-none focus:border-amber-400 bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Expiry Date *</label>
              <input
                type="date"
                name="expiry_date"
                value={createForm.expiry_date}
                onChange={handleCreateFormChange}
                required
                className="w-full px-2 py-1.5 text-sm rounded-md border border-slate-300 outline-none focus:border-amber-400 bg-white text-slate-800"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => { setShowCreateForm(false); setSearchQuery(""); }}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingNew}
                className="px-3 py-1.5 text-sm rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {creatingNew ? "Creating..." : "Create Batch"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loadingBatches ? (
        <p className="p-4 text-sm text-slate-500 text-center">Loading batches...</p>
      ) : batches.length === 0 && !noMatch ? (
        <div className="p-4 text-center space-y-3">
          <p className="text-sm text-slate-500">
            No batches yet. Fill MRP &amp; Expiry Date below, then click Add Batch.
          </p>
          <button
            type="button"
            onClick={handleAddBatch}
            disabled={creating}
            className="inline-flex items-center gap-1 border border-emerald-600 text-emerald-600 px-3 py-1.5 rounded-md text-sm hover:bg-emerald-50 disabled:opacity-50"
          >
            <Plus size={14} />
            {creating ? "Adding..." : "Add Batch"}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-52 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-violet-500 text-white sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">S.No</th>
                <th className="px-3 py-2 text-left">Batch ID</th>
                <th className="px-3 py-2 text-left">MRP</th>
                <th className="px-3 py-2 text-left">Quantity</th>
                <th className="px-3 py-2 text-left">Expiry Date</th>
                <th className="px-3 py-2 text-left">Manufacture Date</th>
              </tr>
            </thead>
            <tbody>
              {(searchQuery.trim() ? filtered : batches).map((b, idx) => (
                <tr
                  key={b.id || b.batch_id}
                  onClick={() => handleBatchTap(b)}
                  className={`border-t border-slate-200 cursor-pointer transition-colors ${
                    selectedBatch && (selectedBatch.id === b.id || selectedBatch.batch_id === b.batch_id)
                      ? "bg-indigo-100 text-indigo-900"
                      : "text-slate-800 hover:bg-indigo-50"
                  }`}
                >
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium">{b.batch_id}</td>
                  <td className="px-3 py-2">₹{b.mrp}</td>
                  <td className="px-3 py-2">{b.quantity != null ? b.quantity : "—"}</td>
                  <td className="px-3 py-2">{formatDateForInput(b.expiry_date) || "—"}</td>
                  <td className="px-3 py-2">{formatDateForInput(b.manufacturer_date) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------ Add/Edit Medicine Modal ------------- */
function PriceModal({ medicineId, onClose, onUpdated, onSuccess }) {
  const boxRef = useRef(null);
  useOutsideClose(boxRef, onClose);

  const [form, setForm] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showExistingBatches, setShowExistingBatches] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const priceRes = await axios.get(
          `${API_BASE}/medicine/price/detail/${medicineId}`,
          { headers },
        );

        const data = priceRes.data.data;
        if (data) {
          data.manufacturer_date = formatDateForInput(data.manufacturer_date);
          data.expiry_date = formatDateForInput(data.expiry_date);
        }
        setForm(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load price details");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [medicineId, onClose]);

  const fetchExistingBatches = async () => {
    try {
      setLoadingBatches(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/medicine/batch/${medicineId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBatches(res.data?.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load existing batches");
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleExistingBatchClick = async () => {
    if (showExistingBatches) {
      setShowExistingBatches(false);
      return;
    }
    await fetchExistingBatches();
    setShowExistingBatches(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddBatch = async () => {
    if (!form?.mrp || !form?.expiry_date) {
      alert("MRP and Expiry Date are required to add a batch");
      return;
    }
    try {
      setCreating(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/medicine/batch`,
        {
          medicine_id: Number(medicineId),
          mrp: Number(form.mrp),
          expiry_date: form.expiry_date,
          manufacturer_date: form.manufacturer_date || null,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const created = res.data?.data;
      if (created) {
        setShowExistingBatches(true);
        setBatches((prev) => {
          const exists = prev.some(
            (b) =>
              (b.id && b.id === created.id) ||
              (b.batch_id && b.batch_id === created.batch_id),
          );
          return exists ? prev : [created, ...prev];
        });
      }

      onSuccess?.(`Batch ${created?.batch_id || ""} added successfully`);
      await onUpdated?.();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add batch");
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(form.mrp<0 || form.quantity<0 ||  form.cost_price<0 || form.selling_price<0 || form.discount<0 || form.offer_percent<0){
      alert("All the values should be greater than 0");
      return;
    }
    if(form.discount<0||form.discount>100){
      alert("Discount should be between 0 and 100");
      return;
    }
    if(form.offer_percent<0||form.offer_percent>100){
      alert("Offer percentage should be between 0 and 100");
      return;
    }
    if(form.selling_price<0){
      alert("Selling price should be greater than 0");
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE}/medicine/price/${medicineId}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("MRP, Cost Price and Quantity are required");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-black/50">
        <div className="bg-gray-900 p-6 rounded-xl">
          Loading price details...
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center  p-4">
      <div
        ref={boxRef}
        className="w-full max-w-2xl rounded-2xl border border-slate-900 bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl text-[#56cfe1] font-semibold">Edit Price & Batches</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExistingBatchClick}
              disabled={loadingBatches}
              className="border border-indigo-600 text-indigo-600 px-3 py-1.5 rounded-md text-sm hover:bg-indigo-50 disabled:opacity-50"
            >
              {loadingBatches
                ? "Loading..."
                : showExistingBatches
                  ? "Hide Existing Batches"
                  : "Existing Batch"}
            </button>
            <button type="button" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {showExistingBatches && (
          <BatchSearchPanel
            medicineId={medicineId}
            batches={batches}
            loadingBatches={loadingBatches}
            handleAddBatch={handleAddBatch}
            creating={creating}
            onBatchesChange={setBatches}
            onUpdated={onUpdated}
            onSuccess={onSuccess}
            form={form}
          />
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <Input
            label="MRP"
            name="mrp"
            value={form.mrp || ""}
            onChange={handleChange}
          />
          <Input
            label="Cost Price"
            name="cost_price"
            value={form.cost_price || ""}
            onChange={handleChange}
          />
          <Input
            label="Discount"
            name="discount"
            value={form.discount || ""}
            onChange={handleChange}
          />
          <Input
            label="Selling Price"
            name="selling_price"
            value={form.selling_price || ""}
            onChange={handleChange}
          />
          <Input
            label="Offer %"
            name="offer_percent"
            value={form.offer_percent || ""}
            onChange={handleChange}
          />
         
          <Input
            label="Quantity"
            name="quantity"
            value={form.quantity || ""}
            onChange={handleChange}
          />
           <Input
            label="Manufacture Date"
            name="manufacturer_date"
            type="date"
            value={form.manufacturer_date || ""}
            onChange={handleChange}
          />
          <Input
            label="Expiry Date *"
            name="expiry_date"
            type="date"
            value={form.expiry_date || ""}
            onChange={handleChange}
          />

          <p className="col-span-2 text-xs text-slate-500">
            Use <span className="font-medium">Add Batch</span> to save MRP, expiry &amp;
            manufacture date to <span className="font-medium">master_batch_table</span>.
          </p>

          <div className="col-span-2 flex justify-end gap-2 mt-4">
            <button
              type="button"
              disabled={creating || saving}
              onClick={handleAddBatch}
              className="inline-flex items-center gap-1 border text-emerald-600 border-emerald-600 px-4 py-2 rounded-md hover:cursor-pointer disabled:opacity-50"
            >
              <Plus size={16} />
              {creating ? "Adding..." : "Add Batch"}
            </button>

            <button
              type="submit"
              disabled={creating || saving}
              className="border text-violet-600 border-violet-600 px-4 py-2 rounded-md hover:cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
             <button type="button" onClick={onClose} className="border px-4 py-2 rounded-md border-red-500 text-red-500 hover:cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-900">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full text-slate-900 rounded-md border border-slate-900 bg-white/5 px-3 py-2 outline-none"
      />
    </div>
  );
}

/*---- MDECINE VIEW MODEL----*/
function MedicineViewModal({ data, onClose }) {
  console.log("Modal Data:", data);
  if (!data) return null;

  // medicine_master_db_table stores images as a JSON array in the `images` column.
  // Fall back to separate image_1…image_5 columns for rows that use that schema.
  let images = [];
  if (data.images) {
    try {
      const parsed = JSON.parse(data.images);
      images = Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed].filter(Boolean);
    } catch {
      images = [data.images].filter(Boolean);
    }
  }
  if (images.length === 0) {
    images = [data.image_1, data.image_2, data.image_3, data.image_4, data.image_5].filter(Boolean);
  }

  return (
    <div className="fixed inset-0 z-[3000] grid place-items-center bg-black/50 p-4 overflow-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl relative">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Medicine Details</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        {/* Images */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="medicine"
                className="w-28 h-28 rounded-xl border border-white/10 object-cover"
              />
            ))}
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT LABELS */}
          <div className="space-y-3">
            <Info label="Medicine ID" />
            <Info label="Name"/>
            <Info label="Batch Number"/>
            <Info label="MRP" />
            <Info label="Cost Price" />
            <Info label="Selling Price" />
            <Info label="Quantity"/>
            <Info label="Manufacturer" />
            <Info label="Manufacturer Address" />
            <Info label="Manufacturer Date"/>
            <Info label="Expiry Date"/>
            <Info label="Salt Composition" />
            <Info label="Medicine Type" />
            <Info label="Packing Type" />
            <Info label="Alcohol Interaction" />
            <Info label="Driving Interaction" />
            <Info label="Kidney Interaction" />
            <Info label="Liver Interaction" />
            <Info label="Pregnancy Interaction" />
            <Info label="Lactation Interaction" />
            <Info label="Common Side Effects" />
            <Info label="How It Works" />
            <Info label="If Missed Dose" />
            <Info label="Introduction" />
            <Info label="Safety Advice" />
            <Info label="Q & A" />
            <Info label="Bucket ID" />
            <Info label="Created At" />
          </div>

          {/* RIGHT VALUES */}
          <div className="space-y-3">
            <Info value={data.medicine_id} />
           <Info value={data.name?data.name:"Not defined"}/>
           <Info value={data.batchNumber?data.batchNumber:"Not defined"}/>
            <Info value={data.mrp ? data.mrp : "not defined"} />
            <Info value={data.cost_price ? data.cost_price : "not defined"} />
            <Info value={data.selling_price ? data.selling_price : "not defined"} />
            <Info value={data.quantity ? data.quantity : "not defined"} />
            <Info value={data.manufacture?data.manufacture:"Not defined"}/>
            <Info
              value={
                data.manufacturer_address
                  ? data.manufacturer_address
                  : "not defined"
              }
            />
            <Info value={data.manufacturer_date?new Date(data.manufacturer_date).toLocaleDateString("en-GB"):"Not defined"}/>
            <Info value={data.expiry_date?new Date(data.expiry_date).toLocaleDateString("en-GB"):"Not defined"}/>
            <Info value={data.salt_composition ? data.salt_composition   : "not defined"} />
            <Info value={data.medicine_type ? data.medicine_type : "not defined"} />
            <Info
              value={
                data.packing_type
                  ? data.packing_type
                  : "not defined"
              }
            />
            <Info
              value={
                data.alcohol_interaction
                  ? data.alcohol_interaction
                  : "not defined"
              }
            />
            <Info
              value={
                data.driving_interaction
                  ? data.driving_interaction
                  : "not defined"
              }
            />
            <Info
              value={
                data.kidney_interaction
                  ? data.kidney_interaction
                  : "not defined"
              }
            />
            <Info
              value={
                data.liver_interaction ? data.liver_interaction : "not defined"
              }
            />
            <Info
              value={
                data.pregnancy_interaction
                  ? data.pregnancy_interaction
                  : "not defined"
              }
            />
            <Info
              value={
                data.lactation_interaction
                  ? data.lactation_interaction
                  : "not defined"
              }
            />
            <Info
              value={
                data.common_side_effect
                  ? data.common_side_effect
                  : "not defined"
              }
            />
            <Info
              value={data.how_it_works ? data.how_it_works : "not defined"}
            />
            <Info value={data.if_miss ? data.if_miss : "not defined"} />
            <Info
              value={data.introduction ? data.introduction : "not defined"}
            />
            <Info
              value={data.safety_advice ? data.safety_advice : "not defined"}
            />
            <Info
              value={
                data.question_answers ? data.question_answers : "not defined"
              }
            />
            <Info value={data.bucket_id} />
            <Info
              value={
                data.created_at ? data.created_at.split("T")[0] : "not defined"
              }
            />
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
  const [bucket, setBucket] = useState(null);
  const [dbMedicines, setDbMedicines] = useState([]);
  const [loadingDB, setLoadingDB] = useState(false);
  const [form, setForm] = useState({
    mrp: "",
  });
  const api="http://localhost:5000";
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  };

  /*------FETCH MEDICINE DETAIL WITH ID------*/
  const [viewRow, setViewRow] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  const openViewModal = async (medicineId, batchId, bucketId) => {
    try {
      setLoadingView(true);
      const token = localStorage.getItem("token");
      console.log(medicineId);
      const url = `${api}/medicine/medicineDetail/${medicineId}/${batchId}/${bucketId}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setViewRow(res.data.data[0]);
    } catch (err) {
      console.log(err);
      alert("Failed to fetch medicine details");
    } finally {
      setLoadingView(false);
    }
  };
  /*---Adding Medicine to Bucket---*/

  const addMedicineToBucket = async (medicines) => {
    try {
      const token = localStorage.getItem("token");

      const items = Array.isArray(medicines) ? medicines : [medicines];

      await Promise.all(
        items.map((med) =>
          axios.post(
            `${api}/medicine/vendor/bucket/add-medicine`,
            {
              bucket_id: id,
              medicine_id: med.medicine_id, 
              medicine_source: "master",
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ),
      );

      showToast(`${items.length} medicine(s) added`);
      setOpenAddMedicine(false);

      load();
    } catch (err) {
      console.error(err);
      alert("Medicine Already Exist In Bucket");
    }
  };

  /*-----Added Medicine Data ----- */

  const handleCreateMedicine = async (formData, bucketId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${api}/medicine/create/${bucketId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      showToast("Medicine created successfully");
      // Reload full medicine list for this bucket so UI shows newly created item
      await load();
      setOpenAdd(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create medicine");
    }
  };

  //Adding Medicine Through DataBase------
  const openAddMedicineFromDB = async () => {
    try {
      setLoadingDB(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${api}/medicine/db-medicines`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDbMedicines(res.data.data);
      setOpenAddMedicine(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load medicines");
    } finally {
      setLoadingDB(false);
    }
  };
  //openedit modal for prices
  const openEditModal = async (medicineId, batchId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${api}/medicine/price/${medicineId}/${batchId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setEditRow(res.data.data); // must be OBJECT
    } catch (err) {
      console.error(err);
      alert("Failed to load price details");
    }
  };
  // updating master bucket medicine
  const handleUpdateMedicine = async (fd, medicineId, batchId) => {
    const token = localStorage.getItem("token");
    console.log("UPDATING:", medicineId, batchId);

    const url =
      `${api}/medicine/price/${medicineId}/${batchId}`;

    await axios.put(url, fd, {
      headers: { Authorization: `Bearer ${token}` },
    });

    showToast("Medicine Updated Successfully");
  };

  //fetch mrp through price id
  const fetchMrp = async (priceId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${api}/medicine/price/${priceId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setForm(res.data.data);
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  /* ------------ Fetch Medicines ------------- */
  useEffect(() => {
    if (id) load();
  }, [id]);

 async function load() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${api}/medicine/medicine/bucket/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMedicines(res.data.data);
      } catch (err) {
        console.log(err);
        showToast("Failed to Load");
      }
    }

  /* ------------ Fetch Bucket Detail ------------- */
  // useEffect(() => {
  //   async function fetchBucket(id) {
  //     try {
  //       const token = localStorage.getItem("token");
  //       const res = await axios.get(`http://localhost:5000/medicine/bucket/${id}`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       setBucket(res.data);
  //     } catch (err) {
  //       console.error("Fetch Bucket Error:", err);
  //     }
  //   }
  //   fetchBucket(id);
  // }, [id]);

  /* ------------ Search Filter ------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicines;

    return medicines.filter((m) =>
      [m.name, m.salt_composition, m.manufacturer, m.packaging]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [query, medicines]);

  /*-----Delete Medicine---- */
  const handleDelete = async ( medicine_id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${api}/medicine/${medicine_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMedicines((prev) => prev.filter((item) => item.medicine_id !== medicine_id));
      showToast("Medicine Deleted Successfully");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete medicine");
    }
  };

  /*-----Delete Bucket---- */
  const handleDeleteBucket = async () => {
    if (!window.confirm("Are you sure you want to delete this entire bucket? This action will delete the bucket and all its medicine mappings from the database."))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${api}/medicine/admin/bucket/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      showToast("Bucket Deleted Successfully");
      setTimeout(() => {
        navigate("/medicine");
      }, 1000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete bucket");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* <h1 className="text-2xl font-semibold"> {filtered[0]?.name} Bucket</h1> */}
        <h1 className="text-xl font-semibold ml-2 text-sm text-[#f72585]">
          Bucket Name : <span className="text-slate-900">{medicines[0]?.bucket_name}</span>
        </h1>
        <h1 className="text-xl font-semibold ml-2">
          {" "}
          No. Of Medicine : {medicines.length} 
        </h1>

        <div className="flex items-center gap-2">
          {/* Add Medicine */}
          <button
            onClick={openAddMedicineFromDB}
            className="inline-flex items-center gap-2 rounded-md bg-violet-500 px-3 py-2 text-sm text-[#FFC81E] hover:cursor-pointer"
          >
            <Plus size={16} /> Add Medicine
          </button>
          <button
            onClick={() => setOpenAdd(true)}
            className="inline-flex items-center gap-2 rounded-md bg-violet-500 px-3 py-2 text-[#FFC81E] hover:cursor-pointer"
          >
            <Plus size={16} /> Create New Medicine
          </button>
          <button
            onClick={handleDeleteBucket}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-500 hover:cursor-pointer"
          >
            <Trash2 size={16} /> Delete Bucket
          </button>
        </div>
      </div>

      {/* Toast Message */}
      {toast && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {toast}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-black bg-violet-500/5">
        <table className="min-w-full text-sm">
          <thead className="bg-violet-500 text-white">
            <tr>
              <th className="px-3 py-2 text-left">S.No</th>
              <th className="px-3 py-2 text-left">Batch ID</th>
              <th className="px-3 py-2 text-left">Medicine ID</th>
              <th className="px-10 py-2 text-left">Name</th>
              <th className="px-8 py-2 text-left">Salt</th>
              {/* <th className="px-3 py-2 text-left">Medicine Type</th> */}
              <th className="px-3 py-2 text-left">Packing Type</th>
              <th className="px-3 py-2 text-left">Manufacturer </th>
              {/* <th className="px-3 py-2 text-left">Country</th> */}
              <th className="px-3 py-2 text-left">MRP</th>
              <th className="px-3 py-2 text-left">Qty</th>
              <th className="px-3 py-2 text-left">Expiry Date</th>
              <th className="px-3 py-2 text-left">Prescription</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m, idx) => (
              <tr key={m.batch_id || idx} className="border-t text-slate-900 border-white/10">
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{m.batch_id}</td>
                <td className="px-3 py-2">{m.medicine_id}</td>
                <td className="px-3 py-2">{m.name}</td>
                <td className="px-3 py-2">{m.salt_composition}</td>
                {/* <td className="px-3 py-2">{m.medicine_type}</td> */}
                <td className="px-3 py-2">{m.packaging}</td>
                <td className="px-3 py-2">{m.manufacture}</td>
                {/* <td className="px-3 py-2">{m.country_of_origin}</td> */}
                <td className="px-3 py-2 text-center">
                  {m.mrp ? m.mrp : "Not defined"}
                </td>
                <td className="px-3 py-2 text-center">
                  {m.quantity != null ? m.quantity : "—"}
                </td>
                <td className="px-3 py-2 text-sm">{m.expiry_date?new Date(m.expiry_date).toLocaleDateString():"Not defined"}</td>
                <td className="px-3 py-2">{m.prescription_required}</td>

                {/* ACTIONS */}
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openViewModal(m.medicine_id, m.batch_id, id)}
                      className="rounded-md border border-white/10 px-2 py-1 hover:cursor-pointer hover:bg-green-500/10"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="rounded-md border border-white/10 px-2 py-1 hover:cursor-pointer hover:bg-blue-500/10"
                      onClick={() =>
                        setEditRow({
                          medicineId: m.medicine_id,
                        })
                      }
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete( m.medicine_id)}
                      className="rounded-md border cursor-pointer border-white/10 px-2 py-1 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!filtered.length && (
              <tr>
                <td
                  className="px-3 py-4 text-center text-gray-400"
                  colSpan={11}
                >
                  No medicines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modals */}
      {openAdd && (
        <MedicineFormModal
          onClose={() => setOpenAdd(false)}
          onSubmit={(formData) => handleCreateMedicine(formData, id)}
        />
      )}

      {editRow && (
        <PriceModal
          medicineId={editRow.medicineId}
          onClose={() => setEditRow(null)}
          onUpdated={load}
          onSuccess={showToast}
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
          existingIds={medicines.map((m) => m.medicine_id)}
          onClose={() => setOpenAddMedicine(false)}
          onAdd={addMedicineToBucket}
        />
      )}

      {viewRow && (
        <MedicineViewModal data={viewRow} onClose={() => setViewRow(null)} />
      )}
    </div>
  );
}
