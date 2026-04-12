import { useMemo, useState, useRef, useEffect } from "react";
import { Plus, X, User, Mail, Search, Eye, Pencil, Trash2 } from "lucide-react";
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

/* ------------ Add/Edit Medicine Modal ------------- */
function PriceModal({ medicineId, batchId, onClose, onUpdated }) {
  const boxRef = useRef(null);
  useOutsideClose(boxRef, onClose);

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:5000/medicine/price/${medicineId}/${batchId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const data = res.data.data;
        if (data.expiry_date) {
          data.expiry_date = data.expiry_date.split("T")[0];
        }
        setForm(data); // backend must return OBJECT
      } catch (err) {
        console.error(err);
        alert("Failed to load price details");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [medicineId, batchId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/medicine/price/${medicineId}/${batchId}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Update failed");
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
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/50 p-4">
      <div
        ref={boxRef}
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Edit Price</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

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
            label="Expiry Date"
            name="expiry_date"
            value={form.expiry_date || ""}
            onChange={handleChange}
          />

          <div className="col-span-2">
            <label className="text-xs text-gray-400">Bought</label>
            <select
              name="bought"
              value={form.bought}
              onChange={handleChange}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2"
            >
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </div>

          <div className="col-span-2 flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 px-4 py-2 rounded-md"
            >
              {saving ? "Saving..." : "Save Changes"}
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
  console.log("Modal Data:", data);
  if (!data) return null;

  // Collect images dynamically
  const images = [
    data.image_1,
    data.image_2,
    data.image_3,
    data.image_4,
    data.image_5,
  ].filter(Boolean);

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
            <Info label="Manufacturer" />
            <Info label="Manufacturer Address" />
            <Info label="Use Of" />
            <Info label="Packing" />
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
            <Info
              value={data.manufacturer ? data.manufacturer : "not defined"}
            />
            <Info
              value={
                data.manufacturer_address
                  ? data.manufacturer_address
                  : "not defined"
              }
            />
            <Info value={data.use_of ? data.use_of : "not defined"} />
            <Info value={data.packing ? data.packing : "not defined"} />
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
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  };

  /*------FETCH MEDICINE DETAIL WITH ID------*/
  const [viewRow, setViewRow] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  const openViewModal = async (medicineId) => {
    try {
      setLoadingView(true);
      const token = localStorage.getItem("token");
      console.log(medicineId);
      const url = `http://localhost:5000/medicine/medicineDetail/${medicineId}`;

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
            "http://localhost:5000/medicine/vendor/bucket/add-medicine",
            {
              bucket_id: id,
              medicine_id: med.db_medicine_id, // ✅ fixed field
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

      // 🔄 reload medicines in bucket
      const reload = await axios.get(
        `http://localhost:5000/medicine/batches/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMedicines(reload.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to add medicines");
    }
  };

  /*-----Added Medicine Data ----- */

  const handleCreateMedicine = async (formData, bucketId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `http://localhost:5000/medicine/create/${bucketId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log(res.data);
      alert("Medicine created successfully");
      setMedicines(res.data.data);
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
        "http://localhost:5000/medicine/db-medicines",
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
        `http://localhost:5000/medicine/price/${medicineId}/${batchId}`,
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
      // medicineSource === "master"
      //   ? `http://localhost:5000/medicine/admin/medicine/${medicineId}`
      //   : `http://localhost:5000/medicine/vendor/medicine/${medicineId}`;
      `http://localhost:5000/medicine/price/${medicineId}/${batchId}`;

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
        `http://localhost:5000/medicine/price/${priceId}`,
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
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/medicine/batches/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMedicines(res.data.data);
      } catch (err) {
        console.log(err);
        showToast("Failed to Load");
      }
    }
    if (id) load();
  }, [id]);

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
      [m.name, m.salt_composition, m.manufacturers, m.packaging]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [query, medicines]);

  /*-----Delete Medicine---- */
  const handleDelete = async (batch_id, medicine_id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/medicine/${batch_id}/${medicine_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMedicines((prev) => prev.filter((item) => item.batch_id !== batch_id));
      showToast("Medicine Deleted Successfully");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete medicine");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold"> {filtered[0]?.name} Bucket</h1>
        <h1 className="text-xl font-semibold ml-65">
          {" "}
          No. Of Medicine : {medicines.length} 
        </h1>

        <div className="flex items-center gap-2">
          {/* Add Medicine */}
          <button
            onClick={openAddMedicineFromDB}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm hover:bg-emerald-500"
          >
            <Plus size={16} /> Add Medicine
          </button>
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

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">S.No</th>
              <th className="px-3 py-2 text-left">Batch ID</th>
              <th className="px-3 py-2 text-left">Medicine ID</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Salt</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Packing Type</th>
              <th className="px-3 py-2 text-left">Manufacturer</th>
              <th className="px-3 py-2 text-left">Country</th>
              <th className="px-3 py-2 text-left">MRP</th>
              <th className="px-3 py-2 text-left">Prescription</th>
              {/* <th className="px-3 py-2 text-left">Storage</th> */}
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((m, idx) => (
              <tr key={m.batch_id || idx} className="border-t border-white/10">
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{m.batch_id}</td>
                <td className="px-3 py-2">{m.medicine_id}</td>
                <td className="px-3 py-2 font-medium">{m.name}</td>
                <td className="px-3 py-2">{m.salt_composition}</td>
                <td className="px-3 py-2">{m.medicine_type}</td>
                <td className="px-3 py-2">{m.packing_type}</td>
                <td className="px-3 py-2">{m.manufacture}</td>
                <td className="px-3 py-2">{m.country_of_origin}</td>
                <td className="px-3 py-2 text-center">
                  {m.mrp ? m.mrp : "Not defined"}
                </td>
                <td className="px-3 py-2">{m.prescription_required}</td>
                {/* <td className="px-3 py-2 text-sm text-gray-300">{m.storage}</td> */}

                {/* ACTIONS */}
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openViewModal(m.medicine_id)}
                      className="rounded-md border border-white/10 px-2 py-1 hover:bg-white/5"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="rounded-md border border-white/10 px-2 py-1 hover:bg-white/5"
                      onClick={() =>
                        setEditRow({
                          medicineId: m.medicine_id,
                          batchId: m.batch_id,
                        })
                      }
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(m.batch_id, m.medicine_id)}
                      className="rounded-md border border-white/10 px-2 py-1 hover:bg-red-500/10"
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
          batchId={editRow.batchId}
          onClose={() => setEditRow(null)}
          onUpdated={() => window.location.reload()}
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
