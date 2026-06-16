const db = require("../db");

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/** Get vendor_signup.id from JWT user id (same thing for vendors) */
const getVendorId = (req) => req.user?.id ?? null;

const orderFields = `
  o.id,
  o.name,
  o.mobile,
  o.email,
  o.address,
  o.city,
  o.pincode,
  o.lanmark,
  o.total_amount,
  o.discount,
  o.order_status,
  o.payment_method,
  o.payment_status,
  o.cancel_reason,
  o.prescription_url,
  o.created_at,
  o.updated_at,
  o.vendor_id,
  o.pre_order_id,
  COUNT(oi.id) AS items_count
`;

/* ─────────────────────────────────────────────
   GET ALL ORDERS (by status filter)
   GET /order/vendor/orders?status=new
───────────────────────────────────────────── */
const getVendorOrders = async (req, res) => {
  try {
    const vendor_id = getVendorId(req);
    const { status } = req.query;

    let statusFilter = "";
    const params = [vendor_id];

    if (status) {
      statusFilter = "AND LOWER(o.order_status) = LOWER(?)";
      params.push(status);
    }

    const [rows] = await db.query(
      `SELECT ${orderFields}
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.vendor_id = ? ${statusFilter}
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      params
    );

    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    console.error("getVendorOrders error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ─────────────────────────────────────────────
   GET ORDER STATS
   GET /order/vendor/stats
───────────────────────────────────────────── */
const getOrderStats = async (req, res) => {
  try {
    const vendor_id = getVendorId(req);

    const [[today]] = await db.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total_amount),0) AS revenue
       FROM orders
       WHERE vendor_id = ? AND DATE(created_at) = CURDATE()`,
      [vendor_id]
    );

    const [[total]] = await db.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total_amount),0) AS revenue
       FROM orders WHERE vendor_id = ?`,
      [vendor_id]
    );

    const [byStatus] = await db.query(
      `SELECT order_status, COUNT(*) AS count
       FROM orders WHERE vendor_id = ?
       GROUP BY order_status`,
      [vendor_id]
    );

    res.json({ success: true, today, total, byStatus });
  } catch (err) {
    console.error("getOrderStats error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ─────────────────────────────────────────────
   GET SINGLE ORDER WITH ITEMS
   GET /order/vendor/orders/:id
───────────────────────────────────────────── */
const getOrderById = async (req, res) => {
  try {
    const vendor_id = getVendorId(req);
    const { id } = req.params;

    const [[order]] = await db.query(
      `SELECT o.* FROM orders o
       WHERE o.id = ? AND o.vendor_id = ?`,
      [id, vendor_id]
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    const [items] = await db.query(
      `SELECT oi.*, vm.medicine_name, vm.medicine_id as vm_med_id
       FROM order_items oi
       LEFT JOIN vendor_medicine vm ON vm.vendor_medicine_id = oi.vendor_medicine_id
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({ success: true, data: { ...order, items } });
  } catch (err) {
    console.error("getOrderById error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ─────────────────────────────────────────────
   ACCEPT ORDER
   POST /order/vendor/orders/:id/accept
───────────────────────────────────────────── */
const acceptOrder = async (req, res) => {
  try {
    const vendor_id = getVendorId(req);
    const { id } = req.params;

    const [result] = await db.query(
      `UPDATE orders SET order_status='accepted', updated_at=NOW()
       WHERE id=? AND vendor_id=?`,
      [id, vendor_id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Order not found" });

    res.json({ success: true, message: "Order accepted" });
  } catch (err) {
    console.error("acceptOrder error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ─────────────────────────────────────────────
   CANCEL ORDER
   POST /order/vendor/orders/:id/cancel
───────────────────────────────────────────── */
const cancelOrder = async (req, res) => {
  try {
    const vendor_id = getVendorId(req);
    const { id } = req.params;
    const { reason } = req.body;

    const [result] = await db.query(
      `UPDATE orders
       SET order_status='cancelled', cancel_reason=?, updated_at=NOW()
       WHERE id=? AND vendor_id=?`,
      [reason || null, id, vendor_id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Order not found" });

    res.json({ success: true, message: "Order cancelled" });
  } catch (err) {
    console.error("cancelOrder error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ─────────────────────────────────────────────
   MOVE TO PENDING
   POST /order/vendor/orders/:id/pending
───────────────────────────────────────────── */
const moveToPending = async (req, res) => {
  try {
    const vendor_id = getVendorId(req);
    const { id } = req.params;
    const { reason } = req.body;

    const [result] = await db.query(
      `UPDATE orders
       SET order_status='pending', cancel_reason=?, updated_at=NOW()
       WHERE id=? AND vendor_id=?`,
      [reason || null, id, vendor_id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Order not found" });

    res.json({ success: true, message: "Order moved to pending" });
  } catch (err) {
    console.error("moveToPending error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ─────────────────────────────────────────────
   ASSIGN ORDER TO RIDER
   POST /order/vendor/orders/:id/assign
───────────────────────────────────────────── */
const assignOrder = async (req, res) => {
  try {
    const vendor_id = getVendorId(req);
    const { id } = req.params;
    const { rider_id, rider_name } = req.body;

    if (!rider_id) return res.status(400).json({ message: "rider_id required" });

    const [result] = await db.query(
      `UPDATE orders
       SET order_status='assigned', cancel_reason=?, updated_at=NOW()
       WHERE id=? AND vendor_id=?`,
      [rider_name || `Rider#${rider_id}`, id, vendor_id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Order not found" });

    res.json({ success: true, message: "Order assigned to rider" });
  } catch (err) {
    console.error("assignOrder error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ─────────────────────────────────────────────
   OUT FOR DELIVERY
   POST /order/vendor/orders/:id/out-delivery
───────────────────────────────────────────── */
const outForDelivery = async (req, res) => {
  try {
    const vendor_id = getVendorId(req);
    const { id } = req.params;

    const [result] = await db.query(
      `UPDATE orders
       SET order_status='out for delivery', updated_at=NOW()
       WHERE id=? AND vendor_id=?`,
      [id, vendor_id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Order not found" });

    res.json({ success: true, message: "Order out for delivery" });
  } catch (err) {
    console.error("outForDelivery error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ─────────────────────────────────────────────
   DELIVER ORDER
   POST /order/vendor/orders/:id/deliver
───────────────────────────────────────────── */
const deliverOrder = async (req, res) => {
  try {
    const vendor_id = getVendorId(req);
    const { id } = req.params;

    const [result] = await db.query(
      `UPDATE orders
       SET order_status='delivered', payment_status='paid', updated_at=NOW()
       WHERE id=? AND vendor_id=?`,
      [id, vendor_id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Order not found" });

    res.json({ success: true, message: "Order delivered" });
  } catch (err) {
    console.error("deliverOrder error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ─────────────────────────────────────────────
   GET APPROVED RIDERS FOR ASSIGNMENT
   GET /order/vendor/riders
───────────────────────────────────────────── */
const getApprovedRiders = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT rs.user_id as id, rs.username, rs.mobileNo,
              rd.full_name, rd.location, rd.photo
       FROM rider_signup rs
       LEFT JOIN rider_details rd ON rd.rider_applicant_id = rs.user_id
       LEFT JOIN rider_application_status ras ON ras.applicant_id = rs.user_id
       WHERE ras.status = 'APPROVED' OR rs.verified = 1
       LIMIT 50`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("getApprovedRiders error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ─────────────────────────────────────────────
   GET DELIVERY ORDERS (Assigned / Out / Delivered / Cancelled)
   GET /order/vendor/deliveries?status=
───────────────────────────────────────────── */
const getDeliveryOrders = async (req, res) => {
  try {
    const vendor_id = getVendorId(req);
    const { status, search, startDate, endDate } = req.query;

    const deliveryStatuses = ['accepted','assigned','out for delivery','delivered','cancelled'];

    let sql = `
      SELECT
        o.id, o.name, o.mobile, o.email,
        o.address, o.city, o.pincode, o.lanmark,
        o.total_amount, o.discount,
        o.order_status, o.payment_method, o.payment_status,
        o.cancel_reason, o.prescription_url,
        o.created_at, o.updated_at, o.vendor_id,
        COUNT(oi.id) AS items_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.vendor_id = ?
    `;
    const params = [vendor_id];

    if (status && status !== 'all') {
      sql += ' AND LOWER(o.order_status) = LOWER(?)';
      params.push(status);
    } else {
      // default: show all delivery-pipeline statuses
      sql += ` AND LOWER(o.order_status) IN (${deliveryStatuses.map(() => '?').join(',')})` ;
      params.push(...deliveryStatuses);
    }

    if (startDate) { sql += ' AND DATE(o.created_at) >= ?'; params.push(startDate); }
    if (endDate)   { sql += ' AND DATE(o.created_at) <= ?'; params.push(endDate); }

    if (search) {
      const t = `%${search}%`;
      sql += ' AND (o.name LIKE ? OR CAST(o.mobile AS CHAR) LIKE ? OR CAST(o.id AS CHAR) LIKE ? OR o.address LIKE ?)';
      params.push(t, t, t, t);
    }

    sql += ' GROUP BY o.id ORDER BY o.created_at DESC';

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    console.error('getDeliveryOrders error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

/* ─────────────────────────────────────────────
   DELIVERY STATS
   GET /order/vendor/delivery-stats
───────────────────────────────────────────── */
const getDeliveryStats = async (req, res) => {
  try {
    const vendor_id = getVendorId(req);

    const [[todayDelivered]] = await db.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total_amount),0) AS revenue
       FROM orders WHERE vendor_id=? AND order_status='delivered' AND DATE(updated_at)=CURDATE()`,
      [vendor_id]
    );

    const [byStatus] = await db.query(
      `SELECT order_status, COUNT(*) AS count
       FROM orders
       WHERE vendor_id=? AND LOWER(order_status) IN ('accepted','assigned','out for delivery','delivered','cancelled')
       GROUP BY order_status`,
      [vendor_id]
    );

    const getCount = (s) => (byStatus.find(r => r.order_status?.toLowerCase() === s)?.count ?? 0);

    res.json({
      success: true,
      todayDelivered: todayDelivered.count,
      todayRevenue: todayDelivered.revenue,
      assigned:       getCount('assigned'),
      outForDelivery: getCount('out for delivery'),
      delivered:      getCount('delivered'),
      cancelled:      getCount('cancelled'),
      accepted:       getCount('accepted'),
    });
  } catch (err) {
    console.error('getDeliveryStats error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

module.exports = {
  getVendorOrders,
  getOrderStats,
  getOrderById,
  acceptOrder,
  cancelOrder,
  moveToPending,
  assignOrder,
  outForDelivery,
  deliverOrder,
  getApprovedRiders,
  getDeliveryOrders,
  getDeliveryStats,
};