const express = require("express");
const router = express.Router();

const medicineController = require("../controllers/newMedicineController.js");
const upload = require("../Services/cloudinary.js");
const { protect } = require("../middleware/authMiddleware.js");
console.log('--- newMedicinesRoutes.js --- protect is:', typeof protect);

/* ======================================================
   DEBUG ENDPOINT
   ====================================================== */
router.get("/ping", (req, res) => res.send("pong - newMedicinesRoutes is loading"));

// get vendor bucket medicine
router.get(
  "/vendor/medicine/bucket/:bucket_id",
  protect,
  medicineController.getVendorMedicinesByBucket
);

/* ======================================================
   BUCKET ENDPOINTS (VENDOR)
   ====================================================== */
//get all bucket
router.get(
  "/admin/bucket",
  // protect,
  // isSuperAdmin,
  medicineController.getAllBucket,
);
router.get("/bucket/:id", medicineController.getBucketDetail);
// create bucket (universal)
router.post(
  "/admin/bucket",
  protect,
  upload.single("images"),
  medicineController.addbucket,
);

// list buckets available to vendor
router.get("/vendor/buckets", protect, medicineController.getVendorBuckets);

/* ======================================================
   MEDICINE ENDPOINTS (VENDOR)
   ====================================================== */

// create medicine (This seems like a master/admin-like creation)
router.post(
  "/create/:bucket_id",
  protect,
  upload.array("images", 5),
  medicineController.createMedicine,
);

router.post(
  "/copy-master-medicines",
  protect,
  medicineController.copyMasterMedicinesToVendor,
);
//getvendorMedicineById
router.get(
  "/vendor/medicine/:id",
  protect,
  medicineController.getVendorMedicineById,
);
// get medicines inside vendor bucket (mapping based)
router.get(
  "/vendor/bucket/:id/medicines",
  protect,
  medicineController.getBucketMedicines,
);
// get vendor medicines
router.get("/vendor/medicine", protect, medicineController.getVendorMedicines);

//for vendor medicine creation
router.post(
  "/vendor/medicine/:bucket_id",
  protect,
  upload.array("images", 5),
  medicineController.addVendorMedicine
);

// update vendor medicine
router.put(
  "/vendor/medicine/:id",
  protect,
  upload.array("images", 5),
  medicineController.updateVendorMedicine,
);

// delete vendor medicine
router.delete(
  "/vendor/medicine/:id",
  protect,
  medicineController.deleteVendorMedicine,
);
router.get("/batches/:bucket_id", medicineController.getBatches);

//medicine through batch id
router.get(
  "/batches/medicine/:bucket_id",
  medicineController.getMedicinesThroughBatchId,
);

//medicine price using body
router.get("/medicine/price", medicineController.getMedicinePrice);
//price through price id
router.get("/price/:price_id", medicineController.getPriceThroughPriceId);
//getting medicine price detail
router.get("/price/:medicine_id/:batch_id", medicineController.getPriceDetail);

//update each medicine price through medicine id and batch id
router.put(
  "/price/:medicine_id/:batch_id",
  protect,
  medicineController.updateMedicinePrice,
);
//all medicine price
router.get("/price/all", medicineController.getAllMedicinePrice);

//medicine through batch
router.get("/batch_medicine", medicineController.getMedicineThroughBatch);
//medicine detail through medicine id
router.get(
  "/medicineDetail/:medicine_id",
  medicineController.getMedicineDetails,
);
//medicine price detail through medicine and batch id
router.get(
  "/medicinePriceDetail/:medicine_id/:batch_id",
  medicineController.getMedicinePriceDetail,
);

// add medicine to vendor bucket (mapping only)
router.post(
  "/vendor/bucket/add-medicine",
  protect,
  medicineController.addMedicineToBucket,
);

// add medicine through global list
router.post(
  "/vendor/bucket/add-global-medicine",
  protect,
  medicineController.addGlobalMedicineToBucket,
);

//count medicine inside bucket through batch id
router.get(
  "/bucket/:id/count",
  protect,
  medicineController.getBucketMedicineCount,
);
//get all db medicine
router.get("/db-medicines", medicineController.getAllDbMedicines);
//GetAllMedicines
router.get("/all", medicineController.getAllMedicineThroughBatch);

// Delete medicine
// router.delete("/:medicineId", protect, medicineController.deleteMedicine);

router.delete("/:batch_id/:medicine_id", medicineController.deleteMedicine);
module.exports = router;
