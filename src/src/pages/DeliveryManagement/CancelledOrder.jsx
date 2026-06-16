export default function CancelledOrder() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-violet-500">
        Cancelled Orders List
      </h1>

      <div className="rounded-xl border border-slate-900 bg-white/5 p-4 text-slate-900">
        <p>No cancelled orders yet.</p>
      </div>
    </div>
  );
}
