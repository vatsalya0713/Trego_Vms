const API_BASE = "http://localhost:5000";

export const ORDER_URLS = {
  // List & stats
  list: `${API_BASE}/order`,
  listVendor: `${API_BASE}/vendor/orders`,
  stats: `${API_BASE}/order/stats`,

  // By status (query on list endpoints)
  placed: `${API_BASE}/order?status=placed`,
  new: `${API_BASE}/order?status=new`,
  pending: `${API_BASE}/order?status=pending`,
  assigned: `${API_BASE}/order?status=assigned`,
  outForDelivery: `${API_BASE}/order?status=out%20for%20delivery`,
  cancelled: `${API_BASE}/order?status=cancelled`,

  // Vendor alias (same handlers)
  vendorPlaced: `${API_BASE}/vendor/orders?status=placed`,
  vendorNew: `${API_BASE}/vendor/orders?status=new`,
  vendorPending: `${API_BASE}/vendor/orders?status=pending`,
  vendorAssigned: `${API_BASE}/vendor/orders?status=assigned`,
  vendorOutForDelivery: `${API_BASE}/vendor/orders?status=out%20for%20delivery`,
  vendorCancelled: `${API_BASE}/vendor/orders?status=cancelled`,

  // Single order
  byId: (id) => `${API_BASE}/order/${id}`,

  // Create
  create: `${API_BASE}/order`,

  // Update
  update: (id) => `${API_BASE}/order/${id}`,
  updateStatus: (id) => `${API_BASE}/order/${id}/status`,
  approve: (id) => `${API_BASE}/order/${id}/approve`,
  reject: (id) => `${API_BASE}/order/${id}/reject`,
  cancel: (id) => `${API_BASE}/order/${id}/cancel`,
  assign: (id) => `${API_BASE}/order/${id}/assign`,

  // Delete (admin)
  delete: (id) => `${API_BASE}/order/${id}`,
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const buildOrderListUrl = ({
  status,
  startDate,
  endDate,
  search,
  useVendorAlias = false,
} = {}) => {
  const base = useVendorAlias ? ORDER_URLS.listVendor : ORDER_URLS.list;
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (search) params.set("search", search);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
};

export default ORDER_URLS;
