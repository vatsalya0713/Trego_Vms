import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu as MenuIcon,
  Activity,
  Users,
  Pill,
  Settings as SettingsIcon,
  ChevronDown,
  Truck,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";

/* ---------- Logo ---------- */
function Logo({ collapsed }) {
  return (
    <Link to="/" className="flex items-center gap-2 select-none">
      <svg width="28" height="28" viewBox="0 0 48 48">
        <defs>
          <linearGradient id="medLogoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6366f1" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="36" height="36" rx="10" fill="url(#medLogoGrad)" />
        <path d="M16 24h16M24 16v16" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>

      {!collapsed && (
        <span className="font-semibold tracking-wide">
          Traco
          <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Medical
          </span>
        </span>
      )}
    </Link>
  );
}

/* ---------- Avatar ---------- */
function AvatarMini({ name = "" }) {
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-xs font-semibold">
      {initials}
    </div>
  );
}

/* ---------- Nav Item ---------- */
function NavItem({ to, label, Icon, active, collapsed }) {
  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 rounded-md px-3 py-2 mb-1 transition-all duration-200
        ${
          active
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 font-medium"
            : "hover:bg-white/5 text-gray-300 hover:text-white"
        }
      `}
    >
      <Icon size={18} />
      {!collapsed && <span className="text-sm">{label}</span>}
    </Link>
  );
}

/* ---------- Sidebar ---------- */
export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const [openMenu, setOpenMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const isActive = (to) => pathname === to;

  /* ---------- Role Based Items ---------- */
  let items = [
    { to: "/dashboard", label: "Dashboard", icon: Activity },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  if (user?.role === "SUPER_ADMIN") {
    items = [
      { to: "/dashboard", label: "Dashboard", icon: Activity },
      { to: "/users", label: "Users", icon: Users },
      { to: "/medicine", label: "Medicine", icon: Pill },
      { to: "/basket", label: "Basket", icon: Pill },
      { to: "/admins", label: "Admins", icon: Users },
      { to: "/vendors", label: "Vendors", icon: Pill },
      { to: "/settings", label: "Settings", icon: SettingsIcon },
    ];
  }

  if (user?.role === "ADMIN") {
    items = [
      { to: "/dashboard", label: "Dashboard", icon: Activity },
      { to: "/vendors", label: "Vendors", icon: Pill },
      { to: "/settings", label: "Settings", icon: SettingsIcon },
    ];
  }

  if (user?.role === "VENDOR") {
    items = [
      { to: "/dashboard", label: "Dashboard", icon: Activity },
      { to: "/vendor/profile", label: "Profile", icon: Users },
      { to: "/vendor/medicine", label: "Medicine", icon: Pill },
      {
        label: "Order Management",
        icon: ClipboardList,
        children: [
          { to: "/vendor/order/management", label: "Orders" },
          { to: "/vendor/order/new", label: "New Orders" },
          { to: "/vendor/order/pending", label: "Pending Orders" },
          { to: "/vendor/order/billing", label: "Billing" },
                    { to: "/vendor/order/assign", label: "Assign" },

          {
            label: "Rider Profile",
           children: [ 
            // { to: "/vendor/order/rider/create", label: "Create Rider" }, 
            { to: "/vendor/order/rider/list", label: "Rider List" },
             { to: "/vendor/order/rider/routes", label: "Routes" }
             ],
          },
        ],
      },
      {
        label: "Delivery Management",
        icon: Truck,
        children: [ { to: "/vendor/delivery/list", label: "Delivery List" },
           { to: "/vendor/order/outfordelivery", label: "Out For Delivery" },
            { to: "/vendor/delivery/delivered", label: "Delivered Orders" }, 
            { to: "/vendor/delivery/cancelled", label: "Cancelled Orders" },
           ]
      },
      { to: "/settings", label: "Settings", icon: SettingsIcon },
    ];
  }

  if (user?.role === "RIDER") {
    items = [
      { to: "/dashboard", label: "Dashboard", icon: Activity },
      { to: "/rider/deliveries", label: "My Deliveries", icon: Truck },
      { to: "/rider/pending", label: "Pending Orders", icon: ClipboardList },
      { to: "/rider/profile", label: "Profile", icon: Users },
      { to: "/settings", label: "Settings", icon: SettingsIcon },
    ];
  }

  return (
    <aside
      className={`hidden md:flex flex-col bg-gray-900 text-gray-200 border-r border-white/10 transition-all
        ${collapsed ? "w-16" : "w-64"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
        <Logo collapsed={collapsed} />
        <button onClick={onToggle} className="p-2 rounded-md hover:bg-white/5">
          <MenuIcon size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {items.map((item) => {
          if (!item.children) {
            return (
              <NavItem
                key={item.label}
                {...item}
                Icon={item.icon}
                active={isActive(item.to)}
                collapsed={collapsed}
              />
            );
          }

          const isOpen = openMenu === item.label;

          return (
            <div key={item.label}>
              <button
                onClick={() => setOpenMenu(isOpen ? null : item.label)}
                className="flex w-full items-center justify-between px-3 py-2 rounded-md hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && (
                  <ChevronDown
                    size={16}
                    className={`transition ${isOpen ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {!collapsed && isOpen && (
                <div className="ml-9 mt-1 space-y-1">
                  {item.children.map((c) =>
                    !c.children ? (
                      <Link
                        key={c.to}
                        to={c.to}
                        className={`block px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                          isActive(c.to)
                            ? "bg-indigo-600/80 text-white shadow-md shadow-indigo-900/50 font-medium"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        }`}
                      >
                        {c.label}
                      </Link>
                    ) : (
                      <div key={c.label}>
                        <button
                          onClick={() =>
                            setOpenSubMenu(
                              openSubMenu === c.label ? null : c.label
                            )
                          }
                          className="flex w-full justify-between px-3 py-1.5 text-sm text-gray-400 hover:bg-white/5 rounded-md"
                        >
                          {c.label}
                          <ChevronDown size={14} />
                        </button>

                        {openSubMenu === c.label && (
                          <div className="ml-4 space-y-1">
                            {c.children.map((s) => (
                              <Link
                                key={s.to}
                                to={s.to}
                                className={`block px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                                  isActive(s.to)
                                    ? "bg-indigo-600/80 text-white shadow-md shadow-indigo-900/50 font-medium"
                                    : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                                }`}
                              >
                                {s.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-3">
        <div className="flex items-center gap-3">
          <AvatarMini name={user?.name} />
          {!collapsed && (
            <div>
              <div className="text-sm">{user?.name}</div>
              <div className="text-xs text-gray-400">{user?.role}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}