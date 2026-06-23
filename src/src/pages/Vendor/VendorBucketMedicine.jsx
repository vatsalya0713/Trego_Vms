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
import AddMedicineFromDBModal from "../AddMedicineFromDBModal.jsx";
import BatchModal from "../../../resuable/BatchModal.jsx";
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
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("click", onDoc);
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
    medicine_type: initial.medicine_type || "",
    packing_type: initial.packing_type || "",
    country_of_origin: initial.country_of_origin || "",
    prescription_required: initial.prescription_required || 0,
    storage: initial.storage || "",
    manufacture: initial.manufacture || "",
    batchNumber: initial.batchNumber || "",
    // PRICE TABLE
    mrp: initial.mrp || "",
    cost_price: initial.cost_price || "",
    selling_price: initial.selling_price || "",
    discount: initial.discount || "",
    offer_percent: initial.offer_percent || "",

    // STOCK
    quantity: initial.quantity || "",
    expiry_date: initial.expiry_date || "",
    manufacturer_date: initial.manufacturer_date || "",

    // INFO TABLE
    description: initial.description || "",
    alcohol_interaction: initial.alcohol_interaction || "",
    common_side_effect: initial.common_side_effect || "",
    driving_interaction: initial.driving_interaction || "",
    how_it_works: initial.how_it_works || "",
    if_miss_dose: initial.if_miss_dose || "",
    introduction: initial.introduction || "",
    kidney_interaction: initial.kidney_interaction || "",
    liver_interaction: initial.liver_interaction || "",
    lactation_interaction: initial.lactation_interaction || "",
    pregnancy_interaction: initial.pregnancy_interaction || "",
    question_answers: initial.question_answers || "",
    safety_advice: initial.safety_advice || "",
    use_of: initial.use_of || "",
    packing: initial.packing || "",
  });

  const [imageFiles, setImageFiles] = useState({
    front: null,
    back: null,
    top: null,
    view: null,
    expiry: null,
  });

  const [preview, setPreview] = useState({
    front: null,
    back: null,
    top: null,
    view: null,
    expiry: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSingleImage = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFiles((prev) => ({
      ...prev,
      [type]: file,
    }));

    setPreview((prev) => ({
      ...prev,
      [type]: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.salt_composition || !form.mrp) {
      alert("Name, Salt Composition and MRP are required");
      return;
    }

    if (
      !imageFiles.front ||
      !imageFiles.back ||
      !imageFiles.top ||
      !imageFiles.view ||
      !imageFiles.expiry
    ) {
      alert("All 5 images are required");
      return;
    }

    const fd = new FormData();

    for (const key in form) {
      fd.append(key, form[key]);
    }

    Object.entries(imageFiles).forEach(([key, file]) => {
      if (file) {
        fd.append(key, file);
      }
    });

    await onSubmit(fd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center  p-4 overflow-auto">
      <div
        ref={boxRef}
        className="w-full max-w-2xl rounded-2xl border border-slate-900 bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl  text-[#f72585]">
            {isEdit ? "Edit Medicine" : "Create Medicine"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-white/5 hover:cursor-pointer"
          >
            <X size={22} color="black" />
          </button>
        </div>

        {/* FORM START */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-900"
        >
          {isEdit ? (
            /* EDIT MODE - Only show Price & Stock */
            <>
              <div className="col-span-2 p-3 bg-violet-50 rounded-lg border border-violet-100 mb-2">
                <p className="font-bold text-violet-700">{form.name}</p>
                <p className="text-sm text-slate-600">
                  {form.salt_composition}
                </p>
              </div>

              {/* PRICE */}
              <Input
                type="number"
                label="MRP *"
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
                label="Selling Price"
                name="selling_price"
                value={form.selling_price}
                onChange={handleChange}
              />
              <Input
                type="number"
                label="Discount"
                name="discount"
                value={form.discount}
                onChange={handleChange}
              />
              <Input
                type="number"
                label="Offer Percent"
                name="offer_percent"
                value={form.offer_percent}
                onChange={handleChange}
              />

              {/* STOCK */}
              <Input
                type="number"
                label="Quantity"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
              />
              <Input
                type="date"
                label="Expiry Date *"
                name="expiry_date"
                value={form.expiry_date}
                onChange={handleChange}
              />
              <Input
                type="date"
                label="Manufacturer Date *"
                name="manufacturer_date"
                value={form.manufacturer_date}
                onChange={handleChange}
              />
            </>
          ) : (
            /* ADD MODE - Show All Fields */
            <>
              {/* BASIC INFO */}
              <Input
                label="Name *"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              <Input
                label="Salt Composition *"
                name="salt_composition"
                value={form.salt_composition}
                onChange={handleChange}
              />

              <Input
                label="Medicine Type"
                name="medicine_type"
                value={form.medicine_type}
                onChange={handleChange}
              />
              <Input
                label="Packing Type"
                name="packing_type"
                value={form.packing_type}
                onChange={handleChange}
              />

              <Input
                label="Country of Origin"
                name="country_of_origin"
                value={form.country_of_origin}
                onChange={handleChange}
              />
              <Input
                label="Manufacture"
                name="manufacture"
                value={form.manufacture}
                onChange={handleChange}
              />
              <Input
                label="Batch Number"
                name="batchNumber"
                value={form.batchNumber}
                onChange={handleChange}
              />

              <Input
                label="Storage"
                name="storage"
                value={form.storage}
                onChange={handleChange}
              />

              {/* PRICE */}
              <Input
                type="number"
                label="MRP *"
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
                label="Selling Price"
                name="selling_price"
                value={form.selling_price}
                onChange={handleChange}
              />
              <Input
                type="number"
                label="Discount"
                name="discount"
                value={form.discount}
                onChange={handleChange}
              />

              <Input
                type="number"
                label="Offer Percent"
                name="offer_percent"
                value={form.offer_percent}
                onChange={handleChange}
              />

              {/* STOCK */}
              <Input
                type="number"
                label="Quantity"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
              />
              <Input
                type="date"
                label="Expiry Date *"
                name="expiry_date"
                value={form.expiry_date}
                onChange={handleChange}
              />

              <Input
                type="date"
                label="Manufacturer Date *"
                name="manufacturer_date"
                value={form.manufacturer_date}
                onChange={handleChange}
              />

              {/* DESCRIPTION */}
              <div className="col-span-2">
                <Input
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              {/* INTERACTIONS */}
              <Input
                label="Alcohol Interaction"
                name="alcohol_interaction"
                value={form.alcohol_interaction}
                onChange={handleChange}
              />
              <Input
                label="Driving Interaction"
                name="driving_interaction"
                value={form.driving_interaction}
                onChange={handleChange}
              />

              <Input
                label="Kidney Interaction"
                name="kidney_interaction"
                value={form.kidney_interaction}
                onChange={handleChange}
              />
              <Input
                label="Liver Interaction"
                name="liver_interaction"
                value={form.liver_interaction}
                onChange={handleChange}
              />

              <Input
                label="Lactation Interaction"
                name="lactation_interaction"
                value={form.lactation_interaction}
                onChange={handleChange}
              />
              <Input
                label="Pregnancy Interaction"
                name="pregnancy_interaction"
                value={form.pregnancy_interaction}
                onChange={handleChange}
              />

              {/* LONG TEXT FIELDS */}
              <div className="col-span-2">
                <Input
                  label="Common Side Effects"
                  name="common_side_effect"
                  value={form.common_side_effect}
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-2">
                <Input
                  label="How It Works"
                  name="how_it_works"
                  value={form.how_it_works}
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-2">
                <Input
                  label="Missed Dose Info"
                  name="if_miss_dose"
                  value={form.if_miss_dose}
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-2">
                <Input
                  label="Introduction"
                  name="introduction"
                  value={form.introduction}
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-2">
                <Input
                  label="Question Answers"
                  name="question_answers"
                  value={form.question_answers}
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-2">
                <Input
                  label="Safety Advice"
                  name="safety_advice"
                  value={form.safety_advice}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Use Of"
                name="use_of"
                value={form.use_of}
                onChange={handleChange}
              />
              <Input
                label="Packing"
                name="packing"
                value={form.packing}
                onChange={handleChange}
              />

              {/* PRESCRIPTION */}
              <div className="col-span-2">
                <label className="mb-1 block text-md text-violet-500">
                  Prescription Required
                </label>
                <select
                  name="prescription_required"
                  value={form.prescription_required}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-900 bg-white/5 px-3 py-2"
                >
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>

              {/* IMAGE */}
              <div className="col-span-2">
                <label className=" block text-md text-violet-500">
                  Upload Images
                </label>

                <div className="grid grid-cols-2 md:grid-rows-3 gap-4">
                  {/* FRONT */}
                  <div>
                    <p className="text-sm text-slate-900 mb-1">Front</p>
                    <input
                      type="file"
                      onChange={(e) => handleSingleImage(e, "front")}
                      className="border border-slate-900 rounded-md"
                    />
                    {preview.front && (
                      <img
                        src={preview.front}
                        className="w-24 h-24 mt-2 rounded-md object-cover"
                      />
                    )}
                  </div>

                  {/* BACK */}
                  <div>
                    <p className="text-sm text-slate-900 mb-1">Back</p>
                    <input
                      type="file"
                      onChange={(e) => handleSingleImage(e, "back")}
                      className="border border-slate-900 rounded-md"
                    />
                    {preview.back && (
                      <img
                        src={preview.back}
                        className="w-24 h-24 mt-2 rounded-md object-cover"
                      />
                    )}
                  </div>

                  {/* TOP */}
                  <div>
                    <p className="text-sm text-slate-900 mb-1">Top</p>
                    <input
                      type="file"
                      onChange={(e) => handleSingleImage(e, "top")}
                      className="border border-slate-900 rounded-md"
                    />
                    {preview.top && (
                      <img
                        src={preview.top}
                        className="w-24 h-24 mt-2 rounded-md object-cover"
                      />
                    )}
                  </div>

                  {/* VIEW */}
                  <div>
                    <p className="text-sm text-slate-900 mb-1">View</p>
                    <input
                      type="file"
                      onChange={(e) => handleSingleImage(e, "view")}
                      className="border border-slate-900 rounded-md"
                    />
                    {preview.view && (
                      <img
                        src={preview.view}
                        className="w-24 h-24 mt-2 rounded-md object-cover"
                      />
                    )}
                  </div>

                  {/* EXPIRY */}
                  <div>
                    <p className="text-sm text-slate-900 mb-1">Expiry</p>
                    <input
                      type="file"
                      onChange={(e) => handleSingleImage(e, "expiry")}
                      className="border border-slate-900 rounded-md"
                    />
                    {preview.expiry && (
                      <img
                        src={preview.expiry}
                        className="w-24 h-24 mt-2 rounded-md object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </form>

        {/* BUTTONS */}
        <div className="flex justify-end gap-2 mt-5 ">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm border-2 border-red-500/50 bg-white text-red-500 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-md border-2 border-emerald-600 bg-white text-emerald-600 px-3 py-2 text-sm  hover:text-slate-900 cursor-pointer"
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
      <label className="mb-1 block text-sm font-semibold text-violet-500">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border text-slate-900 border-slate-900/40  px-3 py-2 outline-none"
      />
    </div>
  );
}

/*---- MDECINE VIEW MODEL----*/
function MedicineViewModal({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[3000] grid place-items-center  p-4 overflow-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-900/10 bg-white p-6 shadow-2xl relative">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-violet-500">
            Medicine Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 bg-red-400 hover:bg-red-500 hover:cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* SHOW MULTIPLE IMAGES */}
        {(() => {
          let images = [];
          if (data.images) {
            if (Array.isArray(data.images)) {
              images = data.images;
            } else {
              try {
                images = JSON.parse(data.images);
              } catch (e) {
                images = [data.images];
              }
            }
          }
          if (images.length === 0) {
            if (data.image_1) images.push(data.image_1);
            if (data.image_2) images.push(data.image_2);
            if (data.image_3) images.push(data.image_3);
            if (data.image_4) images.push(data.image_4);
            if (data.image_5) images.push(data.image_5);
          }
          if (images.length === 0) return null;
          return (
            <div className="flex flex-wrap gap-3 mb-6">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  className="w-32 h-32 rounded-xl border border-white/10 object-cover"
                  alt={`medicine-${idx}`}
                />
              ))}
            </div>
          );
        })()}

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT COLUMN → LABELS */}
          <div className="space-y-3">
            <Info label="ID" />
            <Info label="Name" />
            <Info label="Salt Composition" />
            <Info label="Manufacture" />
            <Info label="Medicine Type" />
            <Info label="Packing Type" />
            <Info label="MRP" />
            <Info label="Cost Price" />
            <Info label="Discount" />
            <Info label="Selling Price" />
            <Info label="Offer %" />
            <Info label="Prescription Required" />
            <Info label="Storage" />
            <Info label="Country of Origin" />
            <Info label="Manufacturer Address" />
            <Info label="Batch Number" />
            <Info label="Created At" />
          </div>

          {/* RIGHT COLUMN → VALUES */}
          <div className="space-y-3">
            <Info value={data.vendor_medicine_id} />
            <Info value={data.name} />
            <Info
              value={
                data.salt_composition ? data.salt_composition : "Not Describe"
              }
            />
            <Info
              value={data.manufacture ? data.manufacture : "Not Describe"}
            />
            <Info
              value={data.medicine_type ? data.medicine_type : "Not Describe"}
            />
            <Info
              value={data.packing_type ? data.packing_type : "Not Describe"}
            />
            <Info value={data.mrp ? `₹${data.mrp}` : "Not Describe"} />
            <Info
              value={data.cost_price ? `₹${data.cost_price}` : "Not Describe"}
            />
            <Info value={data.discount ? `${data.discount}` : "Not Describe"} />
            <Info
              value={
                data.selling_price ? `₹${data.selling_price}` : "Not Describe"
              }
            />
            <Info
              value={
                data.offer_percent ? `${data.offer_percent}%` : "Not Describe"
              }
            />
            <Info value={data.prescription_required ? "Yes" : "No"} />
            <Info value={data.storage ? data.storage : "Not Describe"} />
            <Info
              value={
                data.country_of_origin ? data.country_of_origin : "Not Describe"
              }
            />
            <Info
              value={
                data.manufacturer_address
                  ? data.manufacturer_address
                  : "Not Describe"
              }
            />
            <Info
              value={data.batchNumber ? data.batchNumber : "Not Describe"}
            />
            <Info value={new Date(data.created_at).toLocaleString()} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md border border-slate-900 bg-white/5 p-3">
      {label && <p className="text-sm font-semibold text-[#f72585]">{label}</p>}
      {value && <p className="text-sm text-slate-900">{value}</p>}
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
  const api = "http://localhost:5000";
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
        console.error("Error loading admin medicines:", err);
        alert("Failed to load admin medicines: " + err.message);
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
      setSelectedMedicines(new Set(filtered.map((m) => m.medicine_id)));
    }
  };

  const filteredMedicines = useMemo(() => {
    if (!searchQuery.trim()) return adminMedicines;
    const q = searchQuery.toLowerCase();
    return adminMedicines.filter((m) =>
      [m.name, m.salt_composition, m.manufacturer]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [adminMedicines, searchQuery]);

  const handleCopy = async () => {
    if (selectedMedicines.size === 0) {
      alert("Please select at least one medicine");
      return;
    }

    console.log("Selected medicines from modal:", Array.from(selectedMedicines));
    await onCopy(Array.from(selectedMedicines));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/50 p-4 overflow-auto">
      <div
        ref={boxRef}
        className="w-full max-w-4xl rounded-2xl border border-slate-900 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[#56cfe1]">
            Select Medicines From Master Database
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 border border-red-600 text-red-600 hover:bg-red-500 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative border border-slate-900 rounded-lg">
            <Search
              className="absolute  left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Medicines List */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-lg  text-[#f72585] ">
              Admin Medicines ({filteredMedicines.length})
            </label>
            {filteredMedicines.length > 0 && (
              <button
                onClick={toggleAll}
                className="text-sm border py-1 px-2 rounded-2xl border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white cursor-pointer"
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
                const isSelected = selectedMedicines.has(med.medicine_id);
                return (
                  <div
                    key={med.medicine_id}
                    onClick={() => toggleMedicine(med.medicine_id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {isSelected ? (
                        <CheckSquare
                          size={20}
                          className="mt-0.5 text-emerald-600"
                        />
                      ) : (
                        <Square size={20} className="mt-0.5 text-gray-600" />
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
            className="rounded-md px-4 py-2 text-sm border border-red-600 text-red-600 hover:bg-red-500 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={selectedMedicines.size === 0}
            className="rounded-md border border-emerald-600 text-emerald-600 hover:bg-emerald-500 hover:text-white px-4 py-2 text-sm cursor-pointer"
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
  const api = "http://localhost:5000";
  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${api}/medicine/vendor/buckets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      const res = await axios.get(`${api}/medicine/bucket/${bucketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
                  className={`p-3 rounded-lg border-2 transition-all ${selectedBucket === bucket.id
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
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected
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
  const addMedicineCalled = useRef(false);
  const [medicines, setMedicines] = useState([]);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [priceEditRow, setPriceEditRow] = useState(null);
  const [delRow, setDelRow] = useState(null);
  const [openAddMedicine, setOpenAddMedicine] = useState(false);
  const [dbMedicines, setDbMedicines] = useState([]);
  const [loadingDB, setLoadingDB] = useState(false);
  const [openCopyBucket, setOpenCopyBucket] = useState(false);
  const [openCopyAdmin, setOpenCopyAdmin] = useState(false);
  const api = "http://localhost:5000";
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  };


  /*------FETCH MEDICINE DETAIL WITH ID------*/
  const [viewRow, setViewRow] = useState(false);
  const [viewdata, setViewdata] = useState([]);
  const [loadingView, setLoadingView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const openViewModal = async (medicineId) => {
    try {
      setLoadingView(true);
      const token = localStorage.getItem("token");
      console.log(medicineId);
      const url = `${api}/medicine/vendor/medicine/${medicineId}`;

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
  /*Searching*/
  const filteredMedicines = useMemo(() => {
    if (!searchQuery.trim()) return medicines;
    const q = searchQuery.toLowerCase();
    return medicines.filter((m) =>
      [m.name, m.salt_composition, m.manufacture, m.batch_id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [medicines, searchQuery]);

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
            medicine_id: med.medicne_id,
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
      load();
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
        `${api}/medicine/vendor/bucket/${bucketId}/copy-medicines`,
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
          `${api}/medicine/vendor/bucket/${id}/medicines`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMedicines(reload.data);
      }

      // Also reload vendor medicines to show the copied ones
      const vendorMedicinesRes = await axios.get(
        `${api}/medicine/vendor/medicine`,
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
      console.log("Copying medicines:", selectedMedicineIds);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${api}/medicine/copy-master-medicines`,
        { selected_medicine_ids: selectedMedicineIds, bucket_id: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("Copy response:", res.data);
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
      alert("Failed to fetch medicine details for editing");
    }
  };

  /*-----Edit Medicine---- */
  const handleEdit = async (m) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${api}/medicine/vendor/medicine/${m.vendor_medicine_id}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.data;
      setEditRow({
        id: data.vendor_medicine_id,
        name: data.name, // For display
        salt_composition: data.salt_composition, // For display

        // Price fields
        mrp: data.mrp,
        cost_price: data.cost_price,
        selling_price: data.selling_price,
        discount: data.discount,
        offer_percent: data.offer_percent,

        // Stock fields
        quantity: data.quantity,
        expiry_date: data.expiry_date,
        manufacturer_date: data.manufacturer_date,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to fetch medicine details for editing");
    }
  };

  /*-----Update Medicine ----- */
  const handlePriceEdit = async (medicine) => {
    try {
      const token = localStorage.getItem("token");
      // Fetch fresh data for this medicine
      const res = await axios.get(
        `${api}/medicine/vendor/medicine/${medicine.vendor_medicine_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Open modal with fresh data
      setPriceEditRow(res.data.data);
    } catch (err) {
      console.error("Fetch medicine error:", err);
      alert("Failed to load latest medicine details");
    }
  };

  const handleCreateBatch = async (data) => {
    const medicine_id = data.medicine_id || priceEditRow?.medicine_id;
    if (!medicine_id) {
      alert("Master medicine_id is missing — cannot create batch");
      return;
    }
    if (!data.mrp || !data.expiry_date) {
      alert("MRP and Expiry Date are required to create a batch");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${api}/medicine/batch`,
        {
          medicine_id,
          mrp: data.mrp,
          expiry_date: data.expiry_date,
          manufacturer_date: data.manufacturer_date || null,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast(`Batch created: ${res.data?.data?.batch_id}`);
      setPriceEditRow(null);
      load();
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Failed to update medicine");
    }
  };

  
  /* ------------ Fetch Medicines ------------- */
  // useEffect(() => {
  //   load();

  //   if (id) load();
  // }, [id]);
  // async function load() {
  //   try {
  //     const token = localStorage.getItem("token");

  //     const res = await axios.get(
  //       `${api}/medicine/vendor/medicine/bucket/${id}`,
  //       { headers: { Authorization: `Bearer ${token}` } },
  //     );

  //     setMedicines(res.data.data);
  //     showToast("Medicines Loaded");
  //   } catch (err) {
  //     console.log(err);
  //     showToast("Failed to Load");
  //   }
  // }

  useEffect(() => {

    if (!id) return;

    load();

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
      await axios.delete(`${api}/medicine/vendor/medicine/${m}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicines((prev) =>
        prev.filter((item) => item.vendor_medicine_id !== m),
      );
      alert("Medicine Deleted successfully");
      showToast("Medicine removed from bucket");
      load();
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Failed to remove medicine from bucket");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Bucket Medicines</h1>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center   mt-4 mb-4 w-125">
            <Search size={20} />
            <input
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md bg-white/5 border border-violet-500 text-black px-3 py-1 items-center"
            />
          </div>
          {/* Copy Admin Medicines to Vendor Table */}
          <button
            onClick={() => setOpenCopyAdmin(true)}
            className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-3 py-2 text-sm hover:bg-purple-500"
          >
            <Plus size={16} /> Add Medicines
          </button>

          <button
            onClick={() => setOpenAdd(true)}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm hover:bg-emerald-500 cursor-pointer"
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
      <div className="  border border-slate-900 bg-white">
        <table className="min-w-full text-sm">
          {/* HEADER */}
          <thead className="bg-violet-500">
            <tr>
              <th className="px-3 py-2">S.No</th>
              <th className="px-3 py-2">Batch Id</th>
              <th className="px-3 py-2">Medicine Id</th>

              <th className="px-3 py-2">Owner</th>

              <th className="px-3 py-2">Medicine Name</th>

              <th className="px-3 py-2">Salt</th>
              <th className="px-3 py-2">Manufacturer</th>
              <th className="px-3 py-2">MRP</th>
              <th className="px-3 py-2">Selling Price</th>
              <th className="px-3 py-2">Discount</th>
              <th className="px-3 py-2">Quantity</th>
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
                    onClick={() => openViewModal(m.vendor_medicine_id)}
                    className="rounded-md border border-white/10 px-2 py-1 hover:bg-white/5 cursor-pointer"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => handlePriceEdit(m)}
                    className="rounded-md border border-white/10 px-2 py-1 hover:bg-white/5 cursor-pointer"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(m.vendor_medicine_id)}
                    className="rounded-md border border-white/10 px-2 py-1 hover:bg-white/5 cursor-pointer"
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
        <PriceEditModal
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
      {priceEditRow && (
        <PriceEditModal
          initial={priceEditRow}
          onClose={() => setPriceEditRow(null)}
          onSubmit={(data) =>
            handleUpdatePrice(data, priceEditRow.vendor_medicine_id)
          }
          onCreateBatch={handleCreateBatch}
        />
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
