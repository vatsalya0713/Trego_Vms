import { useEffect, useState } from "react";
import axios from "axios";
import BucketCard from "../../../resuable/BucketCard.jsx";

export default function VendorMedicine() {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const api="http://localhost:5000";

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        console.log(token);
        const res = await axios.get(
          `${api}/medicine/vendor/buckets`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setBuckets(res.data.data || []);
      } catch (err) {
        console.error("Bucket fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuckets();
  }, []);

  if (loading) return <p>Loading buckets...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[#56cfe1]">Available Buckets</h1>

      <div className="flex gap-4 flex-wrap">
        {buckets.length === 0 ? (
          <p>No buckets available</p>
        ) : (
          buckets.map((bucket) => (
            <BucketCard
              key={bucket.id}
              bucket={bucket}
              isVendor={true}
            />
          ))
        )}
      </div>
    </div>
  );
}
