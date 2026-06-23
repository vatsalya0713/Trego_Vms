const express = require("express");
const router = express.Router();

// const {medicineControllerss} = require("../controllers/newMedicineController.js");
const upload = require("../Services/cloudinary.js");
const { protect, isSuperAdmin } = require("../middleware/authMiddleware.js");
const { medicineControllers } = require("../controllers/newMedicineController.js");
console.log("--- newMedicinesRoutes.js --- protect is:", typeof protect);

/* ======================================================
   DEBUG ENDPOINT
   ====================================================== */
router.get("/ping", (req, res) =>
  res.send("pong - newMedicinesRoutes is loading"),
);

// get vendor bucket medicine
router.get(
  "/vendor/medicine/bucket/:bucket_id",
  protect,
  medicineControllers.getVendorMedicinesByBucket,
);

// router.post(
//   "/vendor/bucket/add-medicine/:bucket_id",
//   protect,
//   medicineControllers.addBucketMedicineToVendorBucket,
// );

router.post(
  "/vendor/bucket/add-vendor-medicine",
  protect,
  medicineControllers.addBucketMedicineToVendorBucket,
);

/* ======================================================
   BUCKET ENDPOINTS (VENDOR)
   ====================================================== */
//get all bucket
router.get(
  "/admin/bucket",
  // protect,
  // isSuperAdmin,
  medicineControllers.getAllBucket,
);
router.get("/bucket/:id", medicineControllers.getBucketDetail);
// create bucket (universal)
router.post(
  "/admin/bucket",
  protect,
  upload.single("images"),
  medicineControllers.addbucket,
);

// delete bucket
router.delete(
  "/admin/bucket/:id",
  protect,
  medicineControllers.deleteBucket,
);

// list buckets available to vendor
router.get("/vendor/buckets", protect, medicineControllers.getVendorBuckets);

/* ======================================================
   MEDICINE ENDPOINTS (VENDOR)
   ====================================================== */

// create medicine (This seems like a master/admin-like creation)
router.post(
  "/create/:bucket_id",
  protect,
  upload.array("images", 5),
  medicineControllers.createMedicine,
);

router.post(
  "/copy-master-medicines",
  protect,
  medicineControllers.copyMasterMedicinesToVendor,
);
//getvendorMedicineById
router.get(
  "/vendor/medicine/:id",
  protect,
  medicineControllers.getVendorMedicineById,
);
// get medicines inside vendor bucket (mapping based)
router.get(
  "/vendor/bucket/:id/medicines",
  protect,
  medicineControllers.getBucketMedicines,
);
// get vendor medicines
router.get("/vendor/medicine", protect, medicineControllers.getVendorMedicines);

//for vendor medicine creation
router.post(
  "/vendor/medicine/:bucket_id",
  protect,
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
    { name: "top", maxCount: 1 },
    { name: "view", maxCount: 1 },
    { name: "expiry", maxCount: 1 },
  ]),
  medicineControllers.addVendorMedicine,
);

// update vendor medicine
router.put(
  "/vendor/medicine/:id",
  protect,
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
    { name: "top", maxCount: 1 },
    { name: "view", maxCount: 1 },
    { name: "expiry", maxCount: 1 },
  ]),
  medicineControllers.updateVendorMedicine,
);

// delete vendor medicine
router.delete(
  "/vendor/medicine/:id",
  protect,
  medicineControllers.deleteVendorMedicine,
);
router.patch("/update/batch/:batch_id/:medicine_id",protect,medicineControllers.updateQuantityInSpecificBatchId);

router.get("/batches/:bucket_id", medicineControllers.getBatches);

// master_batch_table — create / list batches for a medicine
router.post("/batch", protect, medicineControllers.createNewBatchId);
router.get(
  "/batch/:medicine_id",
  protect,
  medicineControllers.getMasterBatchesByMedicine,
);

// update a batch in master_batch_table
router.put("/batch/:id", protect, medicineControllers.updateMasterBatch);
// delete a batch from master_batch_table
router.delete("/batch/:id", protect, medicineControllers.deleteMasterBatch);
//medicine through bucket
router.get(
  "/medicine/bucket/:bucket_id",
  medicineControllers.getMedicineThroughBucketId,
);
//medicine through batch id
router.get(
  "/batches/medicine/:bucket_id",
  medicineControllers.getMedicinesThroughBatchId,
);

//medicine price using body
router.get("/medicine/price", medicineControllers.getMedicinePrice);
//price through price id
router.get("/price/:price_id", medicineControllers.getPriceThroughPriceId);
//getting medicine price detail
router.get("/price/detail/:medicine_id", medicineControllers.getPriceDetail);

//update each medicine price through medicine id and batch id
router.put(
  "/price/:medicine_id",
  protect,
  medicineControllers.updateMedicinePrice,
);
//all medicine price
router.get("/price/all", medicineControllers.getAllMedicinePrice);

//medicine through batch
router.get("/batch_medicine", medicineControllers.getMedicineThroughBatch);
//medicine detail through medicine id
router.get(
  "/medicineDetail/:medicine_id/:batch_id/:bucket_id",
  medicineControllers.getMedicineDetails,
);

//medicine price detail through medicine and batch id
router.get(
  "/medicinePriceDetail/:medicine_id/:batch_id",
  medicineControllers.getMedicinePriceDetail,
);
router.post("/copy/:medicine_id/:batch_id/:bucket_id", protect, medicineControllers.copyMasterMedicineToVendor);

// add medicine to vendor bucket (mapping only)
router.post(
  "/vendor/bucket/add-medicine",
  protect,
  medicineControllers.addMedicineToBucket,
);
router.post(
  "/vendor/bucket/:bucket_id",
  protect,
  medicineControllers.getVendorBucketMedicine,
);
// add medicine through global list
router.post(
  "/vendor/bucket/add-global-medicine",
  protect,
  medicineControllers.addGlobalMedicineToBucket,
);

//count medicine inside bucket through batch id
router.get(
  "/bucket/:id/count",
  protect,
  medicineControllers.getBucketMedicineCount,
);
//get all db medicine
router.get("/db-medicines", medicineControllers.getAllDbMedicines);
//GetAllMedicines
router.get("/all", medicineControllers.getAllMedicineThroughBatch);


//vendor created batch

router.post("/vendor/batch",protect,medicineControllers.createNewBatchByVendor);

// Delete medicine
// router.delete("/:medicineId", protect, medicineControllers.deleteMedicine);
// router.delete("/vendor/delete/batch/:batch_id/:medicine_id",medicineControllers.deleteInSpecificBatchIdByVendor);
router.delete("/delete/batch/:batch_id/:medicine_id",medicineControllers.deleteInSpecificBatchId);
router.delete("/:medicine_id", medicineControllers.deleteMedicine);
module.exports = router;
router.delete("/vendor/delete/batch/:batch_id/:medicine_id",medicineControllers.deleteInSpecificBatchIdByVendor);
router.delete("/delete/batch/:batch_id/:medicine_id",medicineControllers.deleteInSpecificBatchId);
router.delete("/:medicine_id", medicineControllers.deleteMedicine);
module.exports = router;
