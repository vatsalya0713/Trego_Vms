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
      className="w-40 h-52 border-white/10 bg-white/5 p-3 rounded-lg shadow-md cursor-pointer"
      onClick={() =>
        navigate(
          isVendor
            ? `/vendor/bucket/${bucket.id}`
            : `/medicine/${bucket.id}`
        )
      }
    >
      <h1 className="text-center text-lg font-semibold mb-1 truncate">
        {bucket.name}
      </h1>

      <img
        src={imgSrc}
        alt={bucket.name}
        className="h-24 w-full object-cover rounded-md mb-2"
      />

      <p className="text-xs">Medicines: {bucket.number_medicines ?? "—"}</p>
      <p className="text-xs">Brands: {bucket.capacity ?? "—"}</p>
      <p className="text-xs">Category: {bucket.category ?? "—"}</p>
    </div>
  );
}
