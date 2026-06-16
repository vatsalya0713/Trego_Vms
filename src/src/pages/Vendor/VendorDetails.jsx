import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, MapPin, Globe, Phone, Mail, FileText, BadgeCheck,
  ShieldCheck, Ban, CalendarClock
} from "lucide-react";
import axios from "axios";

export default function VendorDetails() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const savedVendorId = localStorage.getItem("currentVendorId");
  const isNew = id === "add" || id === undefined;
  const api="http://localhost:5000";
  const token = localStorage.getItem("token");
  useEffect(() => {
    async function fetchVendorData() {
      if (isNew) return;

      // If opening detail page without params, load ID from localStorage
      if (!id && savedVendorId) {
        axios.get(`${api}/vendor/list/${savedVendorId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => setVendor(res.data))
          .catch(err => console.log("Load vendor detail failed:", err));
      }

      try {
        const token = localStorage.getItem("token");

        // 1) fetch user (getVendor now returns single object)
        const res = await axios.get(`${api}/vendor/list/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // backend may return either object or array (defensive)
        const rows = res.data;
        const userData = Array.isArray(rows) ? rows[0] : rows;
        if (!userData) throw new Error("Vendor not found");
        setVendor(userData);

        // 2) fetch vendor info (joined)
        const infoRes = await axios.get(`${api}/vendor/info/all`);
        const allInfos = infoRes.data || [];
        const found = allInfos.find((r) => String(r.user_id) === String(id));
        setVendorInfo(found || null);

        // helper to convert safely for local form values
        const safe = (v) => (v === null || v === undefined ? "" : v);

        setForm({
          name: safe(userData.name),
          username: safe(userData.username),
          password: "",
          category: safe(found?.category),
          address: safe(found?.address),
          druglicense: found?.druglicense ?? (userData.druglicense ?? "") ?? "",
          gstin: safe(found?.gstin || userData.gstin),
          mobile: safe(found?.mobile || userData.mobile),
          email: safe(found?.email || userData.email),
          logo: safe(found?.logo),
          website: safe(found?.website),
          delivery_time_minutes: found?.delivery_time_minutes ?? "",
          delivery_range_km: found?.delivery_range_km ?? "",
          lat: found?.lat ?? "",
          lng: found?.lng ?? "",
          user_discount: found?.user_discount ?? 0,
          company_discount: found?.company_discount ?? 0,
          vendor_offer_user: found?.vendor_offer_user ?? 0,
          company_offer_user: found?.company_offer_user ?? 0,
          offer_start_date: found?.offer_start_date || "",
          offer_end_date: found?.offer_end_date || "",
          is_verified: Boolean(found?.is_verified ?? false),
          active: userData.activeStatus !== "Blocked" && userData.activeStatus !== false,
        });
      } catch (err) {
        console.error("Fetch vendor error:", err);
        setMsg("Failed to fetch vendor data");
      }
    }
    fetchVendorData();
  }, [id]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const verifiedChip = form.is_verified ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-sky-500 bg-sky-100 px-2 py-0.5 text-xs text-sky-700">
      <BadgeCheck size={14} /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-400 bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
      Pending
    </span>
  );

  const activeChip = form.active ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500 bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
      <ShieldCheck size={14} /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-500 bg-red-100 px-2 py-0.5 text-xs text-red-700">
      <Ban size={14} /> Blocked
    </span>
  );

  if (!vendor && !isNew) {
    return (
      <div className="space-y-4">
        <Link
          to="/vendors"
          className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
        >
          <ArrowLeft size={16} /> Back to Vendors
        </Link>
        <p className="text-gray-400">Loading vendor details...</p>
      </div>
    );
  }

  const numOrNull = (v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const floatOrNull = (v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };
  const strOrNull = (v) => (v === "" || v === null || v === undefined ? null : String(v));

  async function handleSave(e) {
    e?.preventDefault?.();
    setLoading(true);
    setMsg("");
    try {
      const token = localStorage.getItem("token");
      //create new vendor
      if (isNew) {
        try {
          await axios.post(`${api}/vendor/add`, {
            name: form.name,
            username: form.username,
            password: form.password,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          alert("Vendor created successfully!");
          return navigate("/vendors");

        } catch (err) {
          alert("Failed to add vendor");
          console.log(err);
        } finally {
          setLoading(false);
        }
      }
      // update users table
      const userPayload = { name: form.name, username: form.username };
      if (form.password) userPayload.password = form.password;

      await axios.patch(`${api}/vendor/update/${id}`, userPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // build vendor_info payload with safe conversions
      const infoPayload = {
        category: strOrNull(form.category),
        address: strOrNull(form.address),
        druglicense: strOrNull(form.druglicense),
        gstin: strOrNull(form.gstin),
        mobile: strOrNull(form.mobile),
        email: strOrNull(form.email),
        logo: strOrNull(form.logo),
        website: strOrNull(form.website),
        delivery_time_minutes: numOrNull(form.delivery_time_minutes),
        delivery_range_km: floatOrNull(form.delivery_range_km),
        lat: floatOrNull(form.lat),
        lng: floatOrNull(form.lng),
        user_discount: floatOrNull(form.user_discount) ?? 0,
        company_discount: floatOrNull(form.company_discount) ?? 0,
        vendor_offer_user: floatOrNull(form.vendor_offer_user) ?? 0,
        company_offer_user: floatOrNull(form.company_offer_user) ?? 0,
        offer_start_date: form.offer_start_date || null,
        offer_end_date: form.offer_end_date || null,
        is_verified: Boolean(form.is_verified),
        active: Boolean(form.active),
      };

      // Try update, if 404 then create
      try {
        await axios.put(`${api}/vendor/info/${id}`, infoPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (putErr) {
        if (putErr.response && putErr.response.status === 404) {
          await axios.post(`${api}/vendor/info`, { user_id: id, ...infoPayload }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          throw putErr;
        }
      }

      setMsg("Vendor updated successfully");

      // refetch user (server returns single object for getVendor now)
      const refetchUser = await axios.get(`${api}/vendor/list/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = Array.isArray(refetchUser.data) ? refetchUser.data[0] : refetchUser.data;
      setVendor(updatedUser);

      // refetch info
      const infoRes = await axios.get(`${api}/vendor/info/all`);
      const found = infoRes.data.find((r) => String(r.user_id) === String(id));
      setVendorInfo(found || null);
    } catch (err) {
      console.error("Save error:", err);
      setMsg(err.response?.data?.message || "Failed to save vendor");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${api}/vendor/status/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { newStatus } = res.data;

      setForm((prev) => ({ ...prev, active: newStatus === "Active" }));
      setMsg(`Vendor status changed to ${newStatus}`);
      // refetch users to keep vendor state consistent
      const refetchUser = await axios.get(`${api}/vendor/list/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = Array.isArray(refetchUser.data) ? refetchUser.data[0] : refetchUser.data;
      setVendor(updatedUser);
    } catch (err) {
      console.error("Toggle active error:", err);
      setMsg("Failed to change status");
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/vendors" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft size={16} /> Back to Vendors
          </Link>
          {!isNew && vendor && (
            <div className="text-xs text-slate-500">
              Vendor ID: <span className="text-slate-900 font-medium">{vendor.id}</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-900 bg-white/5 p-5 shadow-lg shadow-violet-200">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{isNew ? "Add new Vendor" : form.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {activeChip}
              {verifiedChip}
            </div>
          </div>

          {msg && (
            <div className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {msg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSave}>
            {/* Business Info */}
            <section>
              <h2 className="mb-4 text-[16px] font-semibold uppercase tracking-wide text-[#f72585]">Business Info</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Name" value={form.name} onChange={(v) => set("name", v)} />
                <Input label="Category" value={form.category} onChange={(v) => set("category", v)} />
                <Input label="Website" value={form.website} onChange={(v) => set("website", v)} leftIcon={<Globe size={14} />} />
                <Input label="Logo URL" value={form.logo} onChange={(v) => set("logo", v)} />
                <div className="sm:col-span-2">
                  <Input label="Address" value={form.address} onChange={(v) => set("address", v)} leftIcon={<MapPin size={14} />} />
                </div>
              </div>
            </section>

            {/* Compliance & Contact */}
            <section>
              <h2 className="mb-4 text-[16px] font-semibold uppercase tracking-wide text-[#f72585]">Compliance & Contact</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Drug License No." value={form.druglicense} onChange={(v) => set("druglicense", v)} leftIcon={<FileText size={14} />} />
                <Input label="GSTIN" value={form.gstin} onChange={(v) => set("gstin", v)} />
                <Input label="Mobile" value={form.mobile} onChange={(v) => set("mobile", v)} leftIcon={<Phone size={14} />} />
                <Input label="Email" value={form.email} onChange={(v) => set("email", v)} leftIcon={<Mail size={14} />} />
              </div>
            </section>

            {/* Delivery */}
            <section>
              <h2 className="mb-4 text-[16px] font-semibold uppercase tracking-wide text-[#f72585]">Delivery SLA</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Delivery Time (minutes)" type="number" value={form.delivery_time_minutes} onChange={(v) => set("delivery_time_minutes", v)} />
                <Input label="Delivery Range (km)" type="number" value={form.delivery_range_km} onChange={(v) => set("delivery_range_km", v)} />
              </div>
            </section>

            {/* Discounts / Offers */}
            <section>
              <h2 className="mb-4 text-[16px] font-semibold uppercase tracking-wide text-[#f72585]">Discounts & Offers (%)</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input label="User Discount" type="number" value={form.user_discount} onChange={(v) => set("user_discount", v)} />
                <Input label="Company Discount" type="number" value={form.company_discount} onChange={(v) => set("company_discount", v)} />
                <Input label="Vendor Offer to Users" type="number" value={form.vendor_offer_user} onChange={(v) => set("vendor_offer_user", v)} />
                <Input label="Company Offer to Users" type="number" value={form.company_offer_user} onChange={(v) => set("company_offer_user", v)} />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Offer Start Date" type="date" value={form.offer_start_date} onChange={(v) => set("offer_start_date", v)} />
                <Input label="Offer End Date" type="date" value={form.offer_end_date} onChange={(v) => set("offer_end_date", v)} />
              </div>
            </section>

            {/* Status */}
            <section>
              <h2 className="mb-4 text-[16px] font-semibold uppercase tracking-wide text-[#f72585]">Status</h2>
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-900">
                  <input type="checkbox" className="h-4 w-4 accent-emerald-500" checked={form.active} onChange={handleToggleActive} />
                  Active
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-900">
                  <input type="checkbox" className="h-4 w-4 accent-sky-500" checked={form.is_verified} onChange={() => set("is_verified", !form.is_verified)} />
                  Verified
                </label>
              </div>
            </section>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm hover:bg-emerald-500">
                <Save size={16} /> {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}

/* small input */
function Input({ label, leftIcon, type = "text", value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-500">{label}</span>
      <div className="flex items-center gap-2 rounded-md border border-slate-900 bg-white/5 px-3">
        {leftIcon && <span className="text-slate-500">{leftIcon}</span>}
        <input
          type={type}
          className="w-full bg-transparent py-2 outline-none text-slate-900 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}
