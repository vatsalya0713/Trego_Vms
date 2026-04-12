const express = require("express");
const { addVendor,resendOtp,getAdminVendors,getMyVendorProfile,adminVendorAction,getVendorApplication,submitVendorApplication,updateVendorBusinessDetails,updateVendorPersonalDetails,getVendorInfo,saveVendorPersonalDetails,saveVendorBusinessDetails,updateVendorInfo,getVendors, vendorlogin,getVendor ,updateVendor,updateStatus,deleteVendorInfo, vendorSign,verifyOTP,forgotPassword,resetPassword} = require("../controllers/vendorController");
const { protect, isSuperAdminorAdmin } = require("../middleware/authMiddleware");
const authVendor = require("../middleware/authVendor");
const router = express.Router();
const uploadVendorDocs = require("../middleware/vendorDocumentUpload");

// vendor login
router.post('/vendorlogin',vendorlogin);

// vendor signUp
router.post("/sign",vendorSign);
router.post("/verify",verifyOTP);

// resend otp again
router.post("/resend-otp", resendOtp);

//forget and reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

//vendor business detail
router.post(
  "/vendor/business/details",
  authVendor,
  uploadVendorDocs.fields([
    { name: "pan_card", maxCount: 1 },
    { name: "bank_passbook", maxCount: 1 },
    { name: "cancelled_cheque", maxCount: 1 }
  ]),
  saveVendorBusinessDetails
);

//vendor personal detail
router.post(
  "/vendor/personal-detail",
  authVendor,
  uploadVendorDocs.fields([
    { name: "profile_image", maxCount: 1 }, 
    { name: "aadhaar_card", maxCount: 1 },
    { name: "pan_card", maxCount: 1 }
  ]),
  saveVendorPersonalDetails
);

//update vendor persoanl and business profile
router.put("/vendor/business/update",protect, updateVendorBusinessDetails);
router.put("/vendor/personal/update", updateVendorPersonalDetails);

//get application id
router.get(
  "/vendor/application/:applicant_id",
  getVendorApplication
);

//application submit
router.post(
  "/vendor/application/submit",
  submitVendorApplication
);

//vendor Add
router.post("/add", protect, isSuperAdminorAdmin, addVendor);
router.get("/list", protect, isSuperAdminorAdmin, getVendors);  // View all vendors
router.post("/status/:id",protect,isSuperAdminorAdmin,updateStatus);

router.get("/list/:id", protect, isSuperAdminorAdmin, getVendor);  // View one vendor
router.patch("/update/:id",protect,isSuperAdminorAdmin,updateVendor);


// router.post("/info", addVendorInfo);
router.get("/info/all", getVendorInfo);
router.put("/info/:id", updateVendorInfo);
router.delete("/info/:id",deleteVendorInfo);

// get pending / approved vendors
router.get(
  "/admin/vendors",
  protect,
  isSuperAdminorAdmin,
  getAdminVendors
);

// admin actions: reject / verify / send to super admin / toggle active
router.post(
  "/admin/vendor/action",
  protect,
  isSuperAdminorAdmin,
  adminVendorAction
);
router.get(
  "/vendor/profile",
  protect,
  getMyVendorProfile
);

module.exports = router;