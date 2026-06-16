const express = require("express");
const { addAdmin,getAdminVendors,adminVendorAction, getAdmins, deleteAdmin,updateAdmin, updateStatus } = require("../controllers/adminController");
const { protect, isSuperAdmin, isSuperAdminorAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, isSuperAdmin, addAdmin);   // Add admin
router.get("/list",protect,isSuperAdmin, getAdmins);  // View all admins
router.post("/status/:id",protect,isSuperAdmin,updateStatus)
router.patch("/update/:id",protect,isSuperAdmin,updateAdmin); //update admin
router.delete("/:id", protect, isSuperAdmin, deleteAdmin); // Delete admin
router.get("/vendors", protect, isSuperAdminorAdmin, getAdminVendors);
router.post("/vendor/action", protect, isSuperAdminorAdmin, adminVendorAction);

module.exports = router;