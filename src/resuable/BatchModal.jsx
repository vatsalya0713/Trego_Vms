import { useEffect, useRef, useState } from "react";
import { X, Plus,Check } from "lucide-react";
import axios from "axios";
const API_BASE = "http://localhost:5000";

function useOutsideClose(ref, onClose) {
  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;

      // if clicked inside modal do nothing
      if (ref.current.contains(e.target)) return;

      onClose?.();
    }

    document.addEventListener("click", onDoc);

    return () => {
      document.removeEventListener("click", onDoc);
    };
  }, [ref, onClose]);
}
export default function BatchModal({
  medicineId,
  bucketId,
  onClose,
  onSuccess,
}) {
  const boxRef = useRef(null);
  useOutsideClose(boxRef, onClose);

  // const [showExistingBatch, setShowExistingBatch] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const [existingBatches, setExistingBatches] = useState([]);
  // const [batches, setBatches] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
const [copyingBatchId, setCopyingBatchId] = useState(null);
  const [form, setForm] = useState({
    expiry_date: "",
    mrp: "",
    quantity: "",
    manufacturer_date: "",
    discount: ""
  });

  const filtered = searchQuery.trim()
    ? existingBatches.filter((b) =>
      String(b.batch_id)
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase())
    )
    : existingBatches;

  useEffect(() => {
    if (medicineId) {
      loadExistingBatches();
    }
  }, [medicineId]);

  const loadExistingBatches = async () => {
    try {
      setLoadingBatches(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_BASE}/medicine/batch/${medicineId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Batch API Response:", res.data.data);

      setExistingBatches(res.data.data || []);

    } catch (err) {
      console.log(err);

    } finally {
      setLoadingBatches(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
const handleSelectBatch = async (batch) => {
    // if (
    //   !window.confirm(
    //     `Copy medicine with Batch ID "${batch.batch_id}" to your inventory?`
    //   )
    // )
    //   return;

    try {
      setCopyingBatchId(batch.id); // batch.id = mb.id (INT)
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_BASE}/medicine/copy/${medicineId}/${batch.id}/${bucketId}`,
        {}, // no body needed, all data from DB
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message || "Medicine copied to your inventory!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Copy medicine error:", err);

      // Handle duplicate copy gracefully
      if (err.response?.status === 409) {
        alert(err.response.data.message || "Already in your inventory");
      } else {
        alert(err.response?.data?.message || "Failed to copy medicine");
      }
    } finally {
      setCopyingBatchId(null);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/medicine/vendor/batch`,
        {
          medicine_id: medicineId,
          ...form,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Batch Created");

      onSuccess?.();
      onClose();
      loadExistingBatches()

    } catch (err) {
      console.log(err);
      alert("Created Batch Id");
            loadExistingBatches()

    }
  };

  const handleDeleteBatch = async (id,batchId,medicineId) => {
    if (!window.confirm(`Delete batch ${batchId}? This can be delete Permanent.`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE}/medicine/vendor/delete/batch/${id}/${medicineId}`,
            );
      alert("Batch Deleted Successfully");
            loadExistingBatches()
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete batch");
    } 
  };

  return (
    <div className="fixed inset-0 z-[3000] grid place-items-center bg-black/50 p-4"
      onClick={(e) => e.stopPropagation()}
>

      <div
        ref={boxRef}
          onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold text-violet-600">
            Existing Batches
          </h2>
  
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        {/* SEARCH */}
        <div className="flex items-center gap-3 p-4 border-b bg-slate-50">

          <input
            type="text"
            placeholder="Search by Batch ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-violet-500 text-slate-900"
          />

          {/* <button
    type="button"
    className="rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
  >
    Search
  </button> */}

        </div>
        {/* TABLE */}
        <div className="rounded-xl border border-slate-300 bg-white">

          {loadingBatches ? (

            <p className="p-4 text-center text-sm text-slate-500">
              Loading batches...
            </p>

          ) : filtered.length === 0 ? (
            <p className="p-4 text-center text-sm text-slate-500">
              No Existing Batch Found
            </p>

          ) : (

            <div className="max-h-[400px] overflow-auto">

              <table className="w-full border-collapse text-sm">

                <thead className="sticky top-0 bg-violet-600 text-white">
                  <tr>
                    <th className="border px-3 py-2">
                      S.No
                    </th>

                    <th className="border px-3 py-2">
                      Batch ID
                    </th>

                    <th className="border px-3 py-2">
                      MRP
                    </th>

                    <th className="border px-3 py-2">
                      Quantity
                    </th>

                    <th className="border px-3 py-2">
                      Expiry Date
                    </th>

                    <th className="border px-3 py-2">
                      Manufacture Date
                    </th>
                    <th className="border px-3 py-2">
                      Save
                    </th>
                    <th className="border px-3 py-2">
                      Delete
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filtered.map((b, idx) => (
                    <tr
                      key={`${b.batch_id}-${idx}`}
                      className="text-center hover:bg-slate-100 text-slate-900"
                    >

                      <td className="border px-3 py-2 text-slate-900">
                        {idx + 1}
                      </td>

                      <td className="border px-3 py-2 font-medium text-slate-900">
                        {b.batch_id}
                      </td>

                      <td className="border px-3 py-2 text-slate-900">
                        ₹{b.mrp}
                      </td>

                      <td className="border px-3 py-2 text-slate-900">
                        {b.quantity}
                      </td>

                      <td className="border px-3 py-2 text-slate-900">
                        {new Date(
                          b.expiry_date
                        ).toLocaleDateString()}
                      </td>

                      <td className="border px-3 py-2 text-slate-900">
                        {new Date(
                          b.manufacturer_date
                        ).toLocaleDateString()}
                      </td>
                      <td className="border px-3 py-2">
                        <button
                          type="button"
                          className="rounded bg-emerald-600 px-3 py-1 text-white cursor-pointer" 
                          onClick={()=>handleSelectBatch(b)}
                        >
                          <Check size={18}/>
                        </button>
                      </td>

                      <td className="border px-3 py-2">
                        {b.created_by=="vendor" ?(   
                        <button
                          type="button"
                          className="rounded bg-red-600 px-3 py-1 text-white cursor-alias"
                          onClick={() => handleDeleteBatch(b.id,b.batch_id,b.medicine_id)}
                        >
                          Delete
                        </button>) : (
                          <p className="text-sm text-slate-500">"Super Admin Created"</p>
                        )}
                      </td>
                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
         

          <Input
            type="date"
            label="Expiry Date"
            name="expiry_date"
            value={form.expiry_date || ""}
            onChange={handleChange}
          />
 <Input
            type="number"
            label="Discount %"
            name="discount"
            value={form.discount || ""}
            onChange={handleChange}
          />
          <Input
            type="number"
            label="MRP"
            name="mrp"
            value={form.mrp || ""}
            onChange={handleChange}
          />

          <Input
            type="date"
            label="Manufacture Date"
            name="manufacturer_date"
            value={form.manufacturer_date || ""}
            onChange={handleChange}
          />

          <Input
            type="number"
            label="Quantity"
            name="quantity"
            value={form.quantity || ""}
            onChange={handleChange}
          />

          {/* <Input
            type="number"
            label="GST %"
            name="gst"
            value={form.gst}
            onChange={handleChange}
          /> */}

          <div className="col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-red-500 text-red-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
            >
              Create Batch
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-violet-600">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none text-slate-900"
      />
    </div>
  );
}