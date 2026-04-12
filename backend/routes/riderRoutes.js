const express = require("express");
const router = express.Router();
const {
  riderSignup,
  verifyRiderOTP,
  resendRiderOTP,
  riderLogin,
  forgotRiderPassword,
  resetRiderPassword,
  getRiderApplicationStatus,
  submitRiderForApproval,
  approveRider,
  rejectRider,
  getRidersByStatus,
  saveRiderDetails,
  getRiderDetails,
  updateRiderDetails,
} = require("../controllers/riderController");
const upload = require("../Services/cloudinary.js");
const protectRider = require("../middleware/protectRiderMiddleware.js");

router.post("/signup", riderSignup);
router.post("/verify", verifyRiderOTP);
router.post("/resend-otp", resendRiderOTP);
router.post("/login", riderLogin);
router.post("/forgot-password", forgotRiderPassword);
router.post("/reset-password", resetRiderPassword);

//render application status routes
router.get("/status/:applicant_id", getRiderApplicationStatus);
router.post("/submit", submitRiderForApproval);
router.post("/approve", approveRider);
router.post("/reject", rejectRider);
router.get("/list", getRidersByStatus);

//rider details saving
router.post(
  "/application/submit",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "vehicle_photo", maxCount: 1 },
    { name: "driving_license_photo", maxCount: 1 },
    { name: "aadhar_card", maxCount: 1 },
    { name: "pancard", maxCount: 1 },
  ]),
  saveRiderDetails,
);
router.patch(
  "/application/update",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "vehicle_photo", maxCount: 1 },
    { name: "driving_license_photo", maxCount: 1 },
    { name: "aadhar_card", maxCount: 1 },
    { name: "pancard", maxCount: 1 },
  ]),
  updateRiderDetails,
);
router.get("/application/:applicant_id", getRiderDetails);
router.post("/application/submit-status", submitRiderForApproval);
router.get("/admin/list", getRidersByStatus);
module.exports = router;
