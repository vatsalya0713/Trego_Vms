import { useRef, useState } from "react";
import { X } from "lucide-react";

export default function MedicineFormModal({ onClose, onSubmit }) {
  const boxRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const api = "http://localhost:5000";
  const [form, setForm] = useState({
    batch_id: "",
    batchNumber: "",
    name: "",
    salt_composition: "",
    medicine_type: "",
    packing: "",
    packing_type: "",
    country_of_origin: "",
    prescription_required: "",
    storage: "",

    mrp: "",
    quantity: "",
    discount: "",
    cost_price: "",
    selling_price: "",
    offer_percent: "",

    manufacture: "",
    manufacturer_date: "",
    manufacturer_address: "",
    expiry_date: "",

    description: "",
    introduction: "",
    how_it_works: "",
    if_miss: "",
    common_side_effect: "",
    use_of: "",
    safety_advice: "",

    alcohol_interaction: "",
    driving_interaction: "",
    kidney_interaction: "",
    lactation_interaction: "",
    liver_interaction: "",
    pregnancy_interaction: "",
    question_answers: "",
  });
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), files[0]],
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      fd.append(key, val);
    });

    form.images?.forEach((file) => {
      fd.append("images", file);
    });

    await onSubmit(fd);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] p-4 grid place-items-center">
      <div
        ref={boxRef}
        className="w-full max-w-5xl bg-gray-900 rounded-2xl border border-white/10 p-6 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Create New Medicine</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ================= MEDICINE INFORMATION ================= */}
          <Section title="Medicine Information">
            <Field
              label="Medicine Name"
              name="name"
              onChange={handleChange}
              required
            />
            <Field 
            label="Batch Number"
            name="batchNumber"
            onChange={handleChange}
              required
            />
            <Field
              label="Salt Composition"
              name="salt_composition"
              onChange={handleChange}
              required
            />
            <Field
              label="Medicine Type"
              name="medicine_type"
              onChange={handleChange}
              required
            />

            <Field
              label="Packing"
              name="packing"
              onChange={handleChange}
              required
            />
            <Field
              label="Packing Type"
              name="packing_type"
              onChange={handleChange}
              required
            />

            <Field
              label="Country Of Origin"
              name="country_of_origin"
              onChange={handleChange}
              required
            />
            <Field
              label="Prescription Required"
              name="prescription_required"
              onChange={handleChange}
              required
            />
            <Field label="Storage" name="storage" onChange={handleChange}  required/>

            <Field
              label="Manufacturer"
              name="manufacture"
              onChange={handleChange}
              required
            />
            <Field
              label="Manufacturer Address"
              name="manufacturer_address"
              onChange={handleChange}
              required
            />
            <Field
              label="Manufacturer Date"
              name="manufacturer_date"
              type="date"
              onChange={handleChange}
              required
            />

            <Field
              label="Expiry Date"
              name="expiry_date"
              type="date"
              onChange={handleChange}
              required
            />
          </Section>

          {/* ================= PRICE INFORMATION ================= */}
          <Section title="Price Information">
            <Field
              label="MRP"
              name="mrp"
              type="decimal"
              onChange={handleChange}
              required
            />
            <Field
              label="Selling Price"
              name="selling_price"
              type="number"
              onChange={handleChange}
              required
            />

            <Field
              label="Cost Price"
              name="cost_price"
              type="number"
              onChange={handleChange}
            />
            <Field
              label="Discount"
              name="discount"
              type="number"
              onChange={handleChange}
            />
            <Field
              label="Offer Percent"
              name="offer_percent"
              type="number"
              onChange={handleChange}
            />
            <Field
              label="Quantity"
              name="quantity"
              type="number"
              onChange={handleChange}
            />
          </Section>

          {/* ================= Medical Details ================= */}
          <Section title="Medical Details">
            <Field
              label="Description"
              name="description"
              type="textarea"
              onChange={handleChange}
            />
            <Field
              label="Introduction"
              name="introduction"
              type="textarea"
              onChange={handleChange}
            />
            <Field
              label="How It Works"
              name="how_it_works"
              type="textarea"
              onChange={handleChange}
            />
            <Field
              label="Miss Dose Info"
              name="if_miss"
              type="textarea"
              onChange={handleChange}
            />
            <Field
              label="Side Effects"
              name="common_side_effect"
              type="textarea"
              onChange={handleChange}
            />
            <Field label="Use Of" name="use_of" onChange={handleChange} />
            <Field
              label="Safety Advice"
              name="safety_advice"
              type="textarea"
              onChange={handleChange}
            />
          </Section>

          {/* ========Interaction======= */}
          <Section title="Interactions">
            <Field
              label="Alcohol Interaction"
              name="alcohol_interaction"
              onChange={handleChange}
            />
            <Field
              label="Driving Interaction"
              name="driving_interaction"
              onChange={handleChange}
            />
            <Field
              label="Kidney Interaction"
              name="kidney_interaction"
              onChange={handleChange}
            />
            <Field
              label="Liver Interaction"
              name="liver_interaction"
              onChange={handleChange}
            />
            <Field
              label="Pregnancy Interaction"
              name="pregnancy_interaction"
              onChange={handleChange}
            />
            <Field
              label="Lactation Interaction"
              name="lactation_interaction"
              onChange={handleChange}
            />
            <Field
              label="Q&A"
              name="question_answers"
              type="textarea"
              onChange={handleChange}
            />
          </Section>

          {/* ================= BUTTONS ================= */}
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose}>
              Cancel
            </button>

            <button
              className="bg-emerald-600 px-4 py-2 rounded-md"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Create Medicine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, onChange, type = "text", required = false }) {
  return (
    <div>
      <label
        className={`text-xs mb-1 block ${required ? "font-bold text-white" : "text-gray-400"}`}
      >
        {label} {required && "*"}
      </label>

      {type === "textarea" ? (
        <textarea
          name={name}
          required={required}
          onChange={onChange}
          className="w-full h-20 bg-white/5 border border-white/10 rounded-md p-2"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          onChange={onChange}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2"
        />
      )}
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div className="border border-white/10 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-emerald-400 mb-3">{title}</h3>

      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}
function FileField({ label, name, onChange }) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input
        type="file"
        name={name}
        onChange={onChange}
        className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2"
      />
    </div>
  );
}
