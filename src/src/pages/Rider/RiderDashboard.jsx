import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Truck,
  CalendarDays,
  ClipboardList,
  TrendingUp
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

/* -------------------- helpers -------------------- */

const dkey = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
};

const dayLabel = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

function generateRiderDeliveries(rangeDays, riderEmail) {
  const byDay = [];

  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);

    const seed = hashStr(riderEmail + ":" + dkey(d));
    const deliveries = 2 + (seed % 5);
    const pending = seed % 2;
    const earnings = deliveries * 40;

    byDay.push({
      label: dayLabel(d),
      deliveries,
      pending,
      earnings
    });
  }

  return byDay;
}

const sum = (arr, key) =>
  arr.reduce((a, b) => a + (b[key] || 0), 0);

/* -------------------- Component -------------------- */

export default function RiderDashboard() {
  const { user } = useAuth();
  const [range, setRange] = useState(7);

  const riderSeries = useMemo(() => {
    return generateRiderDeliveries(range, user?.email || "demo");
  }, [range, user]);

  const totalDeliveries = sum(riderSeries, "deliveries");
  const totalPending = sum(riderSeries, "pending");
  const totalEarnings = sum(riderSeries, "earnings");
  const todayDeliveries =
    riderSeries[riderSeries.length - 1]?.deliveries || 0;

  const StatCard = ({ icon: Icon, label, value, sub }) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">{label}</div>
        <div className="rounded-lg bg-white/10 p-2">
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {sub && (
        <div className="mt-1 text-xs text-gray-400">{sub}</div>
      )}
    </div>
  );

  const RangeBtn = ({ d, children }) => (
    <button
      onClick={() => setRange(d)}
      className={`rounded-md px-3 py-1.5 text-sm ${
        range === d
          ? "bg-white/10 text-white border border-white/15"
          : "text-gray-300 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-gray-300">
            Welcome {user?.name} <span className="text-gray-500">(Rider)</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Range:</span>
          <RangeBtn d={7}>7d</RangeBtn>
          <RangeBtn d={30}>30d</RangeBtn>
          <RangeBtn d={90}>90d</RangeBtn>
        </div>
      </header>

      {/* KPI Section */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Truck}
          label={`Deliveries (${range}d)`}
          value={totalDeliveries}
          sub="completed deliveries"
        />

        <StatCard
          icon={CalendarDays}
          label="Today Deliveries"
          value={todayDeliveries}
          sub="drops completed"
        />

        <StatCard
          icon={ClipboardList}
          label="Pending Deliveries"
          value={totalPending}
          sub="to be delivered"
        />

        <StatCard
          icon={TrendingUp}
          label="Earnings"
          value={`₹${totalEarnings}`}
          sub="estimated income"
        />
      </section>

      {/* Chart */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-lg font-semibold mb-3">
          Deliveries (last {range} days)
        </h2>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riderSeries}>
              <CartesianGrid strokeOpacity={0.1} vertical={false} />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="deliveries"
                stroke="#34d399"
                fill="#34d399"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}