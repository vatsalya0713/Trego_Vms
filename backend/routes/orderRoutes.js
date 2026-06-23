const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

/* ── STATS ── */
router.get("/vendor/stats", protect, orderController.getOrderStats);

/* ── LIST (with optional ?status=) ── */
router.get("/vendor/orders", protect, orderController.getVendorOrders);

/* ── SINGLE ORDER ── */
router.get("/vendor/orders/:id", protect, orderController.getOrderById);

/* ── ACTIONS ── */
router.post("/vendor/orders/:id/accept",       protect, orderController.acceptOrder);
router.post("/vendor/orders/:id/cancel",       protect, orderController.cancelOrder);
router.post("/vendor/orders/:id/pending",      protect, orderController.moveToPending);
router.post("/vendor/orders/:id/assign",       protect, orderController.assignOrder);
router.post("/vendor/orders/:id/out-delivery", protect, orderController.outForDelivery);
router.post("/vendor/orders/:id/deliver",      protect, orderController.deliverOrder);

/* ── DELIVERY DASHBOARD ── */
router.get("/vendor/delivery-stats",  protect, orderController.getDeliveryStats);
router.get("/vendor/deliveries",      protect, orderController.getDeliveryOrders);

/* ── RIDERS ── */
router.get("/vendor/riders", protect, orderController.getApprovedRiders);

module.exports = router;