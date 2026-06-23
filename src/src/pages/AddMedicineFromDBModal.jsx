// import { useState, useMemo, useEffect } from "react";
// import { X, Search } from "lucide-react";
// import axios from "axios";

// export default function AddMedicineFromDBModal({ onClose, onAdd, existingIds = [] }) {

//   const [medicines, setMedicines] = useState([]);
//   const [query, setQuery] = useState("");
//   const [selected, setSelected] = useState([]);
//   const [loading, setLoading] = useState(true);
// const api="http://localhost:5000";

//   /* ------------ Fetch Medicines from API ------------ */
//   useEffect(() => {
//     const fetchMedicines = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         const res = await axios.get(
//           `${api}/medicine/db-medicines`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         const allMeds = res.data.data || [];
//         // Filter out already existing
//         const available = allMeds.filter(m => !existingIds.includes(m.db_medicine_id));
//         setMedicines(available);
//       } catch (err) {
//         console.error(err);
//         alert("Failed to load medicines");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMedicines();
//   }, []);

//   /* ------------ Filter Medicines ------------ */
//   const filtered = useMemo(() => {
//     const q = query.toLowerCase();

//     return medicines.filter((m) =>
//       [m.name, m.salt_composition, m.manufacturer]
//         .filter(Boolean)
//         .some((v) => v.toLowerCase().includes(q))
//     );
//   }, [query, medicines]);

//   /* ------------ Toggle Select ------------ */
//   const toggle = (id) => {
//     setSelected((prev) =>
//       prev.includes(id)
//         ? prev.filter((x) => x !== id)
//         : [...prev, id]
//     );
//   };

//   /* ------------ Select All ------------ */
//   const selectAll = () => {
//     if (selected.length === filtered.length) {
//       setSelected([]);
//     } else {
//       setSelected(filtered.map((m) => m.db_medicine_id));
//     }
//   };

//   /* ------------ Add Selected ------------ */
//   const handleAdd = () => {
//     const selectedMedicines = medicines.filter((m) =>
//       selected.includes(m.db_medicine_id)
//     );

//     onAdd(selectedMedicines);
//   };

//   if (loading) {
//     return (
//       <div className="fixed inset-0 grid place-items-center bg-black/50">
//         <div className="bg-gray-900 p-6 rounded-xl">
//           Loading medicines...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 z-[2000] grid place-items-center bg-black/50 p-4">
//       <div className="w-full max-w-4xl bg-gray-900 rounded-xl border border-white/10 p-6">

//         {/* Header */}
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold">
//             Add Medicines From Database
//           </h2>
//           <button onClick={onClose}>
//             <X size={18} />
//           </button>
//         </div>

//         {/* Search */}
//         <div className="flex items-center gap-2 mb-4">
//           <Search size={16} />
//           <input
//             placeholder="Search medicines..."
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
//           />
//         </div>

//         {/* Select All */}
//         <div className="mb-3 flex items-center gap-2">
//           <input
//             type="checkbox"
//             className="accent-blue-500 h-4 w-4 cursor-pointer"
//             checked={selected.length === filtered.length && filtered.length > 0}
//             onChange={selectAll}
//           />
//           <span className="text-sm text-gray-300">Select All</span>
//         </div>

//         {/* Medicine List */}
//         <div className="max-h-[350px] overflow-y-auto border border-white/10 rounded-md">
//           <table className="min-w-full text-sm">
//             <thead className="bg-white/5">
//               <tr>
//                 <th className="px-3 py-2"></th>
//                 <th className="px-3 py-2 text-left">Name</th>
//                 <th className="px-3 py-2 text-left">Manufacturer</th>
//                 <th className="px-3 py-2 text-left">Mrp</th>
//               </tr>
//             </thead>

//             <tbody>
//               {filtered.map((m) => (
//                 <tr
//                   key={m.db_medicine_id}
//                   className="border-t border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
//                   onClick={() => toggle(m.db_medicine_id)}
//                 >
//                   <td className="px-3 py-2">
//                     <input
//                       type="checkbox"
//                       className="accent-blue-500 h-4 w-4 cursor-pointer"
//                       checked={selected.includes(m.db_medicine_id)}
//                       onChange={() => toggle(m.db_medicine_id)}
//                       onClick={(e) => e.stopPropagation()}

//                     />
//                   </td>

//                   <td className="px-3 py-2">{m.name}</td>
//                   <td className="px-3 py-2">{m.manufacturers}</td>
//                   <td className="px-3 py-2">{m.price}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer Buttons */}
//         <div className="flex justify-end gap-3 mt-4">
//           <button
//             onClick={onClose}
//             className="border border-white/10 px-4 py-2 rounded-md"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleAdd}
//             disabled={!selected.length}
//             className="bg-emerald-600 px-4 py-2 rounded-md"
//           >
//             Add {selected.length} Medicine
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }
import { useState, useMemo, useEffect } from "react";
import { X, Search } from "lucide-react";
import axios from "axios";

export default function AddMedicineFromDBModal({ onClose, onAdd, existingIds = [] }) {

  const [medicines, setMedicines] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
const api="http://localhost:5000";

  /* ------------ Fetch Medicines from API ------------ */
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${api}/medicine/db-medicines`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const allMeds = res.data.data || [];
        // Filter out already existing
        const available = allMeds.filter(m => !existingIds.includes(m.medicine_id));
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
      setSelected(filtered.map((m) => m.medicine_id));
    }
  };

  /* ------------ Add Selected ------------ */
  const handleAdd = () => {
    const selectedMedicines = medicines.filter((m) =>
      selected.includes(m.medicine_id)
    );

    onAdd(selectedMedicines);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 grid place-items-center ">
        <div className="bg-gray-900 p-6 rounded-xl">
          Loading medicines...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl border border-white/10 p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#56cfe1]">
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
            className="w-full rounded-md bg-white/5 border border-slate-900 text-black px-3 py-2"
          />
        </div>

        {/* Select All */}
        <div className="mb-3 flex items-center gap-2">
          <input
            type="checkbox"
            className="border border-slate-900 h-4 w-4 cursor-pointer"
            checked={selected.length === filtered.length && filtered.length > 0}
            onChange={selectAll}
          />
          <span className="text-sm text-gray-600">Select All</span>
        </div>

        {/* Medicine List */}
        <div className="max-h-[350px] overflow-y-auto border border-slate-900 rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-violet-500">
              <tr>
                <th className="px-3 py-2"></th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-1 py-2 text-left">Compositon</th>
                <th className="px-5 py-2 text-left">Batch Number</th>
                <th className="px-3 py-2 text-left">Mrp</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((m) => (
                <tr 
                  key={m.medicine_id} 
                  className="border-t border-white/10 hover:bg-white/5 cursor-pointer text-black"
                  onClick={() => toggle(m.medicine_id)}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      className="accent-blue-500 h-4 w-4 cursor-pointer"
                      checked={selected.includes(m.medicine_id)}
                      onChange={() => toggle(m.medicine_id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>

                  <td className="px-3 py-2">{m.name}</td>

                  <td className="px-3 py-2">{m.salt_composition?m.salt_composition:m.salt_syonyms}</td>
                  <td className="px-3 py-2">{m.batchNumber?m.batchNumber:"NA"}</td>
                  <td className="px-3 py-2">{m.mrp?m.mrp:m.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="border border-red-500 text-red-500 hover:cursor-pointer px-4 py-2 rounded-md"
          >
            Cancel
          </button>

          <button
            onClick={handleAdd}
            disabled={!selected.length}
            className="border-emerald-600 border text-emerald-600 hover:cursor-pointer px-4 py-2 rounded-md"
          >
            Add {selected.length} Medicine
          </button>
        </div>

      </div>
    </div>
  );
}
