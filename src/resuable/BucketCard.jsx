import { useNavigate } from "react-router-dom";

export default function BucketCard({ bucket, isVendor }) {
  const navigate = useNavigate();

  let images = [];
  try {
    if (Array.isArray(bucket.image)) images = bucket.image;
    else if (typeof bucket.image === "string" && bucket.image.trim())
      images = JSON.parse(bucket.image);
  } catch {
    if (bucket.image) images = [bucket.image];
  }

  const imgSrc = images.length ? images[0] : "/medic.jpg";

  return (
    <div
      className="w-44 h-56 border-white/10 bg-white/5 p-3 rounded-lg shadow-md cursor-pointer"
      onClick={() =>
        navigate(
          isVendor
            ? `/vendor/bucket/${bucket.id}`
            : `/medicine/${bucket.id}`
        )
      }
    >
      <h1 className="text-center text-violet-500 text-lg font-semibold mb-1 truncate">
        {bucket.name}
      </h1>

      <img
        src={imgSrc}
        alt={bucket.name}
        className="h-24 w-full object-cover rounded-md mb-2"
      />

      <p className="text-xs text-[#f72585]">Bucket Capacity: <span className="text-slate-900">{bucket.number_medicines ?? "—"}</span></p>
      <p className="text-xs text-[#f72585]">Bucket Size: <span className="text-slate-900">{bucket.capacity ?? "—"}</span></p>
      <p className="text-xs text-[#f72585]">Category: <span className="text-slate-900">{bucket.category ?? "—"}</span></p>
      <p className="text-xs text-[#f72585]">Category Type: <span className="text-slate-900">{bucket.category_type ?? "—"}</span></p>
    </div>
  );
}
