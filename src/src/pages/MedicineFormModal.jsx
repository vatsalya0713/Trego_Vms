import { useRef, useState } from "react";
import { X } from "lucide-react";

export default function MedicineFormModal({ onClose, onSubmit }) {
  const boxRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    /* -------- MEDICINE TABLE -------- */
    name: "",
    saltcomposition: "",
    manufacturer: "",
    manufactureaddress: "",
    countryoforigin: "",
    medicinetype: "",
    packingtype: "",
    packing: "",
    prescriptionrequired: "",
    storage: "",
    description: "",

    /* -------- BATCH TABLE -------- */
    batchname: "",
    bucketid: "",
    medicineid: "",

    /* -------- PRICE TABLE -------- */
    mrp: "",
    discount: "",
    sellingprice: "",
    offerpercent: "",
    bought: "",
    costprice: "",
    expirydate: "",
    quantity: "",

    /* -------- DISCOUNT OFFER TABLE -------- */
    discounttoconsumer: "",
    discounttocompany: "",
    companydiscount: "",
    vendordiscount: "",
    companyoffer: "",
    vendoroffer: "",
    validfrom: "",
    validtill: "",

    /* -------- IMAGES -------- */
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
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
            <Field label="Medicine Name" name="name" onChange={handleChange} />
            <Field
              label="Salt Composition"
              name="saltcomposition"
              onChange={handleChange}
            />

            <Field
              label="Manufacturer"
              name="manufacturer"
              onChange={handleChange}
            />
            <Field
              label="Manufacturer Address"
              name="manufactureaddress"
              onChange={handleChange}
            />

            <Field
              label="Country Of Origin"
              name="countryoforigin"
              onChange={handleChange}
            />
            <Field
              label="Medicine Type"
              name="medicinetype"
              onChange={handleChange}
            />

            <Field label="Packing" name="packing" onChange={handleChange} />
            <Field
              label="Packing Type"
              name="packingtype"
              onChange={handleChange}
            />

            <Field
              label="Prescription Required"
              name="prescriptionrequired"
              onChange={handleChange}
            />
            <Field label="Storage" name="storage" onChange={handleChange} />
          </Section>

          {/* ================= BATCH INFORMATION ================= */}
          {/* <Section title="Batch Information">
            <Field
              label="Batch Name"
              name="batchname"
              onChange={handleChange}
            />
            <Field
              label="Bucket ID"
              name="bucketid"
              type="number"
              onChange={handleChange}
            />
          </Section> */}

          {/* ================= PRICE INFORMATION ================= */}
          <Section title="Price Information">
            <Field
              label="MRP"
              name="mrp"
              type="number"
              onChange={handleChange}
            />
            <Field
              label="Cost Price"
              name="costprice"
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
              label="Selling Price"
              name="sellingprice"
              type="number"
              onChange={handleChange}
            />

            <Field
              label="Offer Percent"
              name="offerpercent"
              type="number"
              onChange={handleChange}
            />
            <Field
              label="Bought (0/1)"
              name="bought"
              type="number"
              onChange={handleChange}
            />

            <Field
              label="Expiry Date"
              name="expirydate"
              type="date"
              onChange={handleChange}
            />
            <Field
              label="Quantity"
              name="quantity"
              type="number"
              onChange={handleChange}
            />
          </Section>

          {/* ================= DISCOUNT / OFFER ================= */}
          <Section title="Discount & Offer Information">
            <Field
              label="Discount To Consumer"
              name="discounttoconsumer"
              type="number"
              onChange={handleChange}
            />
            <Field
              label="Discount To Company"
              name="discounttocompany"
              type="number"
              onChange={handleChange}
            />

            <Field
              label="Company Discount"
              name="companydiscount"
              type="number"
              onChange={handleChange}
            />
            <Field
              label="Vendor Discount"
              name="vendordiscount"
              type="number"
              onChange={handleChange}
            />

            <Field
              label="Company Offer"
              name="companyoffer"
              onChange={handleChange}
            />
            <Field
              label="Vendor Offer"
              name="vendoroffer"
              onChange={handleChange}
            />

            <Field
              label="Valid From"
              name="validfrom"
              type="date"
              onChange={handleChange}
            />
            <Field
              label="Valid Till"
              name="validtill"
              type="date"
              onChange={handleChange}
            />
          </Section>

          {/* ================= IMAGES ================= */}
          <Section title="Medicine Images">
            <FileField label="Image 1" name="image1" onChange={handleChange} />
            <FileField label="Image 2" name="image2" onChange={handleChange} />

            <FileField label="Image 3" name="image3" onChange={handleChange} />
            <FileField label="Image 4" name="image4" onChange={handleChange} />

            <FileField label="Image 5" name="image5" onChange={handleChange} />
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

function Field({ label, name, onChange, type = "text", className = "" }) {
  return (
    <div className={className}>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>

      {type === "textarea" ? (
        <textarea
          name={name}
          onChange={onChange}
          className="w-full h-20 bg-white/5 border border-white/10 rounded-md p-2"
        />
      ) : (
        <input
          type={type}
          name={name}
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
