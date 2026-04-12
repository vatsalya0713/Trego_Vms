import { useState, useMemo, useEffect } from "react";
import { X, Search } from "lucide-react";
import axios from "axios";

export default function AddMedicineFromDBModal({ onClose, onAdd, existingIds = [] }) {

  const [medicines, setMedicines] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ------------ Fetch Medicines from API ------------ */
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/medicine/db-medicines",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const allMeds = res.data.data || [];
        // Filter out already existing
        const available = allMeds.filter(m => !existingIds.includes(m.db_medicine_id));
        setMedicines(available);
      } catch (err) {
        console.error(err);
        alert("Failed to load medicines");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  /* ------------ Filter Medicines ------------ */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    return medicines.filter((m) =>
      [m.name, m.salt_composition, m.manufacturer]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [query, medicines]);

  /* ------------ Toggle Select ------------ */
  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /* ------------ Select All ------------ */
  const selectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((m) => m.db_medicine_id));
    }
  };

  /* ------------ Add Selected ------------ */
  const handleAdd = () => {
    const selectedMedicines = medicines.filter((m) =>
      selected.includes(m.db_medicine_id)
    );

    onAdd(selectedMedicines);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-black/50">
        <div className="bg-gray-900 p-6 rounded-xl">
          Loading medicines...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-4xl bg-gray-900 rounded-xl border border-white/10 p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Add Medicines From Database
          </h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 mb-4">
          <Search size={16} />
          <input
            placeholder="Search medicines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
          />
        </div>

        {/* Select All */}
        <div className="mb-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected.length === filtered.length && filtered.length > 0}
            onChange={selectAll}
          />
          <span className="text-sm text-gray-300">Select All</span>
        </div>

        {/* Medicine List */}
        <div className="max-h-[350px] overflow-y-auto border border-white/10 rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-3 py-2"></th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Manufacturer</th>
                <th className="px-3 py-2 text-left">Mrp</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((m) => (
                <tr key={m.medicine_id} className="border-t border-white/10">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(m.db_medicine_id)}
                      onChange={() => toggle(m.db_medicine_id)}
                    />
                  </td>

                  <td className="px-3 py-2">{m.name}</td>
                  <td className="px-3 py-2">{m.manufacturers}</td>
                  <td className="px-3 py-2">{m.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="border border-white/10 px-4 py-2 rounded-md"
          >
            Cancel
          </button>

          <button
            onClick={handleAdd}
            disabled={!selected.length}
            className="bg-emerald-600 px-4 py-2 rounded-md"
          >
            Add {selected.length} Medicine
          </button>
        </div>

      </div>
    </div>
  );
}