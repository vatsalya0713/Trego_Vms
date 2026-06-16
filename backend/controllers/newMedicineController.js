const db = require("../db");
const generateBatchNumber = require("../utils/batchNumberGenerator");

/** Next batch_id from master_batch_table only (medicine_master_db_table stays null). */
const generateNextBatchId = async (dbConn, medicineName) => {
  const namePrefix =
    medicineName?.trim().substring(0, 2).toUpperCase() || "XX";
  const pattern = `${namePrefix}%`;

  const [rows] = await dbConn.query(
    `SELECT batch_id FROM master_batch_table
     WHERE batch_id LIKE ? ORDER BY batch_id DESC LIMIT 1`,
    [pattern],
  );

  let maxNumber = 0;
  if (rows.length > 0) {
    const num = parseInt(String(rows[0].batch_id).replace(namePrefix, ""), 10);
    if (!Number.isNaN(num)) maxNumber = num;
  }

  return `${namePrefix}${String(maxNumber + 1).padStart(2, "0")}`;
};

const insertMasterBatchRow = async (
  dbConn,
  { medicine_id, batch_id, mrp, expiry_date, manufacturer_date, quantity },
) => {
  const expDate = expiry_date
    ? new Date(expiry_date).toISOString().slice(0, 10)
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

  const mfgDate = manufacturer_date
    ? new Date(manufacturer_date).toISOString().slice(0, 10)
    : null;

  const [result] = await dbConn.query(
    `INSERT INTO master_batch_table
      (medicine_id, batch_id, mrp, expiry_date, manufacturer_date, quantity)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [medicine_id, batch_id, mrp ?? 0, expDate, mfgDate, quantity ?? 0],
  );

  return {
    id: result.insertId,
    medicine_id,
    batch_id,
    mrp: mrp ?? 0,
    expiry_date: expDate,
    manufacturer_date: mfgDate,
    quantity: quantity ?? 0,
  };
};

const medicineControllers = {
  /* ---------------------- ADD BUCKET ---------------------- */
  addbucket: async (req, res) => {
    try {
      const {
        bucket_name,
        capacity,
        number_medicines,
        created_by,
        createdAt,
        category,
        category_type,
      } = req.body;

      // Basic validation
      if (!bucket_name || !capacity) {
        return res.status(400).json({
          message: "bucket_name and capacity are required",
        });
      }

      // Handle image upload (single or multiple)
      let imageUrls = [];
      if (req.files && Array.isArray(req.files)) {
        imageUrls = req.files.map((file) => file.path);
      } else if (req.file) {
        imageUrls = [req.file.path];
      }

      const sql = `
      INSERT INTO bucket
      (
        name,
        image,
        created_by,
        created_at,
        capacity,
        number_medicines,
        category,
        category_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const values = [
        bucket_name,
        JSON.stringify(imageUrls),
        created_by || null,
        createdAt || new Date(),
        capacity,
        number_medicines || 0,
        category || null,
        category_type || null,
      ];

      const [result] = await db.query(sql, values);

      return res.status(201).json({
        message: "Bucket added successfully",
        bucketId: result.insertId,
        images: imageUrls,
      });
    } catch (err) {
      console.error("Add Bucket Error:", err);
      res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  },

  /* ---------------------- DELETE BUCKET ---------------------- */
  deleteBucket: async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const { id } = req.params;

      // 1. Delete from bucket_medicine_map
      await conn.query("DELETE FROM bucket_medicine_map WHERE bucket_id = ?", [id]);

      // 2. Delete or update medicines table if it exists and has references
      try {
        await conn.query("DELETE FROM medicines WHERE bucket_id = ?", [id]);
      } catch (err) {
        console.log("medicines table delete warning:", err.message);
      }

      // 3. Update any vendor_medicine referencing this bucket to set bucket_id = 0
      try {
        await conn.query("UPDATE vendor_medicine SET bucket_id = 0 WHERE bucket_id = ?", [id]);
      } catch (err) {
        console.log("vendor_medicine update warning:", err.message);
      }

      // 4. Finally, delete the bucket
      const [result] = await conn.query("DELETE FROM bucket WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ message: "Bucket not found" });
      }

      await conn.commit();
      res.json({ success: true, message: "Bucket deleted successfully" });
    } catch (err) {
      await conn.rollback();
      console.error("deleteBucket error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    } finally {
      conn.release();
    }
  },

  /* ---------------------- GET ALL BUCKETS ---------------------- */
  getAllBucket: async (req, res) => {
    // const {bucket_id}=req.body;
    try {
      const [rows] = await db.query(
        "SELECT bucket.*, COUNT(medicine_id) AS total_medicines FROM bucket LEFT JOIN bucket_medicine_map ON bucket.id =bucket_medicine_map.bucket_id GROUP BY bucket.id",
      );

      res.json(rows);
    } catch (err) {
      console.error("Get Buckets Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  getBucketDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await db.query("SELECT * FROM bucket WHERE id = ?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Bucket not found" });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error("Get Bucket Detail Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ---------------------- ADD MEDICINE ---------------------- */
  addMedicine: async (req, res) => {
    try {
      // const { bucket_id } = req.params.id;

      const {
        bucket_id,
        name,
        salt_composition,
        manufacturers,
        medicine_type,
        packaging,
        packaging_typ,
        mrp,
        cost_price,
        discount_percent,
        selling_price,
        offers_percent,
        prescription_required,
        storage,
        country_of_origin,
        manufacture_address,
        best_price,
        brought,
      } = req.body;

      if (!bucket_id) {
        return res.status(400).json({
          message: "Bucket ID  are required",
        });
      }

      const filesArray = Array.isArray(req.files) ? req.files : [];
      const imageUrls = filesArray.map((f) => f.path);

      const prescriptionValue =
        prescription_required == "1" ||
          prescription_required === 1 ||
          prescription_required === true ||
          prescription_required === "true"
          ? 1
          : 0;

      const sql = `
                INSERT INTO MEDICINE (
                    bucket_id, name, salt_composition, manufacturers, medicine_type,
                    packaging, packaging_typ, mrp, cost_price, discount_percent,
                    selling_price, offers_percent, prescription_required,
                    storage, country_of_origin, manufacture_address,
                    best_price, brought, image
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

      const values = [
        bucket_id,
        name,
        salt_composition,
        manufacturers,
        medicine_type,
        packaging,
        packaging_typ,
        mrp,
        cost_price,
        discount_percent,
        selling_price,
        offers_percent,
        prescriptionValue,
        storage,
        country_of_origin,
        manufacture_address,
        best_price,
        brought,
        JSON.stringify(imageUrls),
      ];

      const [result] = await db.query(sql, values);

      return res.status(201).json({
        msg: "Medicine added successfully",
        images: imageUrls,
        medicineId: result.insertId,
      });
    } catch (err) {
      console.error("Add Medicine Error:", err);
      res.status(500).json({ msg: err.message });
    }
  },

  /* ---------------------- GET MEDICINES BY BUCKET ---------------------- */
  getRelavantDtaMedicine: async (req, res) => {
    try {
      const { id } = req.params;

      const sql = `
                SELECT id, bucket_id, name, salt_composition, manufacturers,
                packaging, mrp, discount_percent, selling_price
                FROM medicine
                WHERE bucket_id = ?
            `;

      const [rows] = await db.query(sql, [id]);

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  },

  /* ---------------------- GET SINGLE MEDICINE ---------------------- */
  getMedicine: async (req, res) => {
    try {
      const { id } = req.params;

      const sql = "SELECT * FROM MEDICINE WHERE id = ?";

      const [rows] = await db.query(sql, [id]);

      if (!rows.length) {
        return res.status(404).json({ msg: "Medicine not found" });
      }

      const item = rows[0];

      let images = [];
      try {
        images = item.image ? JSON.parse(item.image) : [];
      } catch {
        images = [item.image];
      }

      return res.json({ ...item, images });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  },
  /* ----------------------GET All MEDICINE ---------------------- */
  getAllMedicine: async (req, res) => {
    try {
      const [rows] = await db.query("select * FROM MEDICINE");
      res.json(rows);
    } catch (err) {
      console.error("Get Buckets Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
  /* ---------------------- ADD EXISTING MEDICINE TO BUCKET ---------------------- */
  // addMedicineToBucket: async (req, res) => {
  //   try {
  //     const vendor_user_id = req.user.id;
  //     const { bucket_id, medicine_id, medicine_source } = req.body;

  //     if (!bucket_id || !medicine_id || !medicine_source) {
  //       return res.status(400).json({
  //         message: "bucket_id, medicine_id, medicine_source required",
  //       });
  //     }
  //     const [[existingMedicine]] = await db.query(
  //       `SELECT * FROM bucket_medicine_map
  //      WHERE medicine_id = ? and bucket_id =?`,
  //       [medicine_id, bucket_id],
  //     );
  //     if (existingMedicine) {
  //       return res.status(409).json({
  //         message: "Medicine already exists in this bucket",
  //       });
  //     }
  //     const [[data]] = await db.query(
  //       `select name from medicine_master_db_table where medicine_id=?`,
  //       [medicine_id],
  //     );
  /* ---------------- BATCH ID GENERATION ---------------- */
  // const generateBatchId = async (conn, name) => {
  // 1. Check if ANY vendor already has this medicine with a batch_id
  //   const [existingBatch] = await conn.query(
  //     `SELECT batch_id FROM medicine_master_db_table WHERE name = ? LIMIT 1`,
  //     [name],
  //   );
  //   if (existingBatch.length > 0) {
  //     return existingBatch[0].batch_id;
  //   }

  //   const namePrefix = name?.trim().substring(0, 2).toUpperCase() || "XX";
  //   const prefix = `${namePrefix}`;
  //   const [rows] = await conn.query(
  //     `SELECT batch_id FROM medicine_master_db_table WHERE batch_id LIKE ? ORDER BY batch_id DESC LIMIT 1`,
  //     [`${prefix}%`],
  //   );
  //   let number = 1;
  //   if (rows.length > 0) {
  //     const lastBatch = rows[0].batch_id;
  //     const lastNumber = parseInt(lastBatch.replace(prefix, ""), 10);
  //     if (!isNaN(lastNumber)) {
  //       number = lastNumber + 1;
  //     }
  //   }
  //   const sequence = String(number).padStart(2, "0");
  //   return `${prefix}${sequence}`;
  // };
  // const batch_id = await generateBatchId(db, data.name);
  // const [[existingBatch]] = await db.query(
  //   `SELECT batch_id FROM medicine_master_db_table WHERE batch_id = ?`,
  //   [batch_id],
  // );
  // if (existingBatch) {
  //   batch_id = existingBatch.batch_id;
  // }

  // const [[exists]] = await db.query(
  //   `SELECT id FROM bucket_medicine_map
  //  WHERE bucket_id = ?
  //    AND medicine_id = ?
  //    AND medicine_source = ?
  //    AND vendor_user_id = ?`,
  //   [bucket_id, medicine_id, medicine_source, vendor_user_id],
  // );

  // if (exists) {
  //   return res.status(409).json({
  //     message: "Medicine already exists in this bucket",
  //   });
  // }

  // await db.query(
  //   `INSERT INTO bucket_medicine_map
  //  (bucket_id, medicine_id, medicine_source, vendor_user_id)
  //  VALUES (?, ?, ?, ?)`,
  //   [bucket_id, medicine_id, medicine_source, vendor_user_id],
  // );

  /* =========================
   FETCH FROM MASTER DB
========================== */
  // const [[dbMed]] = await db.query(
  //   `SELECT * FROM medicine_master_db_table WHERE medicine_id = ?`,
  //   [medicine_id],
  // );

  // if (!dbMed) {
  //   return res.status(404).json({ message: "Medicine not found in DB" });
  // }

  /* =========================
   INSERT INTO medicine_table
========================== */
  //     await db.query(
  //       `Update bucket_medicine_map   bucket_id=? where medicine_id=?;`,
  //       [batch_id, bucket_id, medicine_id],
  //     );

  //     res.json({
  //       success: true,
  //       message: "Medicine added to medicine_table successfully",
  //     });
  //   } catch (err) {
  //     console.error("addMedicineToBucket error:", err);
  //     res.status(500).json({ message: "Server error" });
  //   }
  // },

  //   addMedicineToBucket: async (req, res) => {
  //   try {
  //     const vendor_user_id = req.user.id;
  //     const { bucket_id, medicine_id, medicine_source } = req.body;

  //     if (!bucket_id || !medicine_id || !medicine_source) {
  //       return res.status(400).json({
  //         message: "bucket_id, medicine_id, medicine_source required",
  //       });
  //     }

  //     /* ── 1. Duplicate check ── */
  //     const [[existingMedicine]] = await db.query(
  //       `SELECT id FROM bucket_medicine_map
  //        WHERE medicine_id = ? AND bucket_id = ?`,
  //       [medicine_id, bucket_id],
  //     );

  //     if (existingMedicine) {
  //       return res.status(409).json({
  //         message: "Medicine already exists in this bucket",
  //       });
  //     }

  //     /* ── 2. Fetch medicine from master table ── */
  //     const [[dbMed]] = await db.query(
  //       `SELECT * FROM medicine_master_db_table WHERE medicine_id = ?`,
  //       [medicine_id],
  //     );

  //     if (!dbMed) {
  //       return res.status(404).json({ message: "Medicine not found in DB" });
  //     }

  //     /* ── 3. Generate batch & store in master_batch_table (not medicine_master_db_table) ── */
  //     const batch_id = await generateNextBatchId(db, dbMed.name);

  //     const batchRow = await insertMasterBatchRow(db, {
  //       medicine_id,
  //       batch_id,
  //       mrp: dbMed.mrp ?? 0,
  //       expiry_date: dbMed.expiry_date,
  //       manufacturer_date: dbMed.manufacturer_date,
  //     });

  //     /* ── 4. Insert into bucket_medicine_map ── */
  //     await db.query(
  //       `INSERT INTO bucket_medicine_map
  //         (bucket_id, medicine_id, medicine_source, medicine_owner, name, vendor_user_id)
  //        VALUES (?, ?, ?, 'super_admin', ?, 0)`,
  //       [bucket_id, medicine_id, medicine_source, dbMed.name],
  //     );

  //     return res.status(201).json({
  //       success: true,
  //       message: "Medicine added to bucket successfully",
  //       batch_id,
  //       batch: batchRow,
  //     });

  //   } catch (err) {
  //     console.error("addMedicineToBucket error:", err);
  //     return res.status(500).json({ message: "Server error", error: err.message });
  //   }
  // },
  addMedicineToBucket: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;
      const { bucket_id, medicine_id, medicine_source } = req.body;

  //     if (!bucket_id || !medicine_id || !medicine_source) {
  //       return res.status(400).json({
  //         message: "bucket_id, medicine_id, medicine_source required",
  //       });
  //     }
  //     const [[existingMedicine]] = await db.query(
  //       `SELECT * FROM bucket_medicine_map
  //      WHERE medicine_id = ? and bucket_id =?`,
  //       [medicine_id, bucket_id],
  //     );
  //     if (existingMedicine) {
  //       return res.status(409).json({
  //         message: "Medicine already exists in this bucket",
  //       });
  //     }
  //     const [[data]] = await db.query(
  //       `select name from medicine_master_db_table where medicine_id=?`,
  //       [medicine_id],
  //     );
      /* ---------------- BATCH ID GENERATION ---------------- */
      // const generateBatchId = async (conn, name) => {
        // 1. Check if ANY vendor already has this medicine with a batch_id
      //   const [existingBatch] = await conn.query(
      //     `SELECT batch_id FROM medicine_master_db_table WHERE name = ? LIMIT 1`,
      //     [name],
      //   );
      //   if (existingBatch.length > 0) {
      //     return existingBatch[0].batch_id;
      //   }

      /* ───────── 1. Check duplicate medicine in same bucket ───────── */
      const [[existingMedicine]] = await db.query(
        `SELECT id 
       FROM bucket_medicine_map
       WHERE bucket_id = ? AND medicine_id = ?`,
        [bucket_id, medicine_id]
      );

      if (existingMedicine) {
        return res.status(409).json({
          message: "Medicine already exists in this bucket",
        });
      }

      /* ───────── 2. Get medicine from master DB ───────── */
      const [[dbMed]] = await db.query(
        `SELECT * 
       FROM medicine_master_db_table
       WHERE medicine_id = ?`,
        [medicine_id]
      );

      if (!dbMed) {
        return res.status(404).json({
          message: "Medicine not found",
        });
      }

      let selectedBatch = null;

      /* ───────── 3. Check existing batch first ───────── */
      const [[existingBatch]] = await db.query(
        `SELECT *
       FROM master_batch_table
       WHERE medicine_id = ?
       ORDER BY id ASC
       LIMIT 1`,
        [medicine_id]
      );

      if (existingBatch) {
        // Use first existing batch
        selectedBatch = existingBatch;
      } else {

        /* ───────── 4. Create new batch if none exists ───────── */

        const batch_id = await generateNextBatchId(db, dbMed.name);

        const batchRow = await insertMasterBatchRow(db, {
          medicine_id,
          batch_id,
          mrp: dbMed.mrp ?? 0,
          expiry_date: dbMed.expiry_date,
          manufacturer_date: dbMed.manufacturer_date,
        });

        selectedBatch = batchRow;
      }

      /* ───────── 5. Insert into bucket_medicine_map ───────── */
      await db.query(
        `INSERT INTO bucket_medicine_map
      (
        bucket_id,
        medicine_id,
        medicine_source,
        medicine_owner,
        name,
        vendor_user_id,
        batch_id
      )
      VALUES (?, ?, ?, 'super_admin', ?, ?, ?)`,
        [
          bucket_id,
          medicine_id,
          medicine_source,
          dbMed.name,
          vendor_user_id,
          selectedBatch.id, // master_batch_table.id
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Medicine added to bucket successfully",
        batch: selectedBatch,
      });

    } catch (err) {
      console.error("addMedicineToBucket error:", err);

      return res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  },
  /*adding medicine through golabal medicine list  */
  addGlobalMedicineToBucket: async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const { bucket_id, medicine_id } = req.body;
      const vendor_user_id = req.user.id;

      if (!bucket_id || !medicine_id) {
        return res.status(400).json({
          message: "bucket_id and medicine_id are required",
        });
      }

      /* 1️⃣ Fetch data from MASTER tables */

      // 1.1 Basic Medicine Info
      const [[masterMed]] = await conn.query(
        `SELECT * FROM medicines WHERE id = ?`,
        [medicine_id],
      );

      if (!masterMed) {
        await conn.rollback();
        return res.status(404).json({
          message: "Global medicine info not found",
        });
      }

      // 1.2 Latest Batch
      const [[masterBatch]] = await conn.query(
        `SELECT * FROM batches WHERE medicine_id = ? ORDER BY batch_id DESC LIMIT 1`,
        [medicine_id],
      );

      // 1.3 Latest Price (linked to batch)
      let masterPrice = null;
      if (masterBatch) {
        const [[price]] = await conn.query(
          `SELECT * FROM prices WHERE batch_id = ? AND medicine_id = ? ORDER BY price_id DESC LIMIT 1`,
          [masterBatch.batch_id, medicine_id],
        );
        masterPrice = price;
      }

      // 1.4 Latest Offer (linked to price/batch)
      let masterOffer = null;
      if (masterPrice) {
        const [[offer]] = await conn.query(
          `SELECT * FROM discounts_offers WHERE price_id = ? AND batch_id = ? AND medicine_id = ? LIMIT 1`,
          [masterPrice.price_id, masterBatch.batch_id, medicine_id],
        );
        masterOffer = offer;
      }

      /* 2️⃣ Insert medicine into VENDOR medicine table (Snapshot) */
      const [vendorInsert] = await conn.query(
        `
      INSERT INTO vendor_medicine_table 
      (
        user_id,
        medicine_owner,
        name,
        salt_composition,
        manufacturers,
        medicine_type,
        packaging,
        packaging_typ,
        mrp,
        cost_price,
        discount_percent,
        selling_price,
        offers_percent,
        prescription_required,
        storage,
        country_of_origin,
        manufacture_address,
        best_price,
        brought,
        image,
        added_from,
        bucket_id
      )
      VALUES (?, 'super_admin', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'global_list', ?)
      `,
        [
          vendor_user_id,
          masterBatch?.name || masterMed.description || "not defined",
          masterBatch?.salt_composition || "not defined",
          masterMed.manufacturer || masterBatch?.manufacture || "not defined",
          masterBatch?.medicine_type || "not defined",
          masterBatch?.packing_type || "not defined",
          masterBatch?.packing_type || "not defined",
          masterPrice?.mrp || 0,
          masterPrice?.cost_price || 0,
          masterPrice?.discount || 0,
          masterPrice?.selling_price || 0,
          masterPrice?.offer_percent || 0,
          masterBatch?.prescription_required === "Yes" ||
            masterBatch?.prescription_required === 1
            ? 1
            : 0,
          masterBatch?.storage || "Cool & Dry",
          masterBatch?.country_of_origin || "not defined",
          masterMed.manufacturer_address || "not defined",
          masterPrice?.selling_price || 0,
          masterPrice?.bought || 0,
          masterMed.image_1 || null,
          bucket_id,
        ],
      );

      const vendor_medicine_id = vendorInsert.insertId;

      /* 3️⃣ Map vendor medicine to bucket */
      await conn.query(
        `
      INSERT INTO bucket_medicine_map
      (bucket_id, medicine_id, medicine_source, vendor_user_id)
      VALUES (?, ?, 'vendor', ?)
      `,
        [bucket_id, vendor_medicine_id, vendor_user_id],
      );

      await conn.commit();

      return res.status(201).json({
        success: true,
        message: "Medicine copied and added to bucket successfully",
        vendor_medicine_id,
      });
    } catch (err) {
      if (conn) await conn.rollback();
      console.error("Add Global Medicine Error:", err);
      return res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    } finally {
      if (conn) conn.release();
    }
  },

  /* ---------------------- DELETE MEDICINE ---------------------- */
  deleteMedicine: async (req, res) => {
    try {
      const { id, medicineId, medicine_id } = req.params;
      const targetId = id || medicineId || medicine_id;

      if (!targetId) {
        return res.status(400).json({ message: "Medicine ID is required" });
      }

      const [result] = await db.query("DELETE FROM MEDICINES WHERE id = ?", [
        targetId,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Medicine not found" });
      }

      res.json({ message: "Medicine deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ---------------------- GET BUCKETS FOR LOGGED-IN VENDOR ---------------------- */
  getVendorBuckets: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;

      const [[vendor]] = await db.query(
        `
      SELECT category, category_type
      FROM vendor_informations
      WHERE vendor_user_id = ?
      ORDER BY applicant_id DESC
      LIMIT 1
      `,
        [vendor_user_id],
      );

      if (!vendor) {
        return res.status(404).json({
          message: "Vendor business details not found",
        });
      }

      const [buckets] = await db.query(
        `
      SELECT *
      FROM bucket
      WHERE category = ?
        AND category_type = ?
      `,
        [vendor.category, vendor.category_type],
      );

      res.json({
        vendorCategory: vendor.category,
        vendorCategoryType: vendor.category_type,
        data: buckets,
      });
    } catch (err) {
      console.error("Get Vendor Buckets Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ---------------------- ADD VENDOR MEDICINE ---------------------- */
  // addVendorMedicine: async (req, res) => {
  //   try {
  //     const vendor_user_id = req.user.id;

  //     const {
  //       name,
  //       salt_composition,
  //       manufacturers,
  //       medicine_type,
  //       packaging,
  //       packaging_typ,
  //       mrp,
  //       cost_price,
  //       discount_percent,
  //       selling_price,
  //       offers_percent,
  //       prescription_required,
  //       storage,
  //       country_of_origin,
  //       manufacture_address,
  //       best_price,
  //       brought,
  //       image,
  //     } = req.body;

  //     if (!name) {
  //       return res.status(400).json({
  //         message: "Medicine name is required",
  //       });
  //     }

  //     const filesArray = Array.isArray(req.files) ? req.files : [];
  //     const imageUrls = filesArray.map((f) => f.path);

  //     /* normalize boolean */
  //     const prescriptionValue =
  //       prescription_required === true ||
  //       prescription_required === 1 ||
  //       prescription_required === "1" ||
  //       prescription_required === "true"
  //         ? 1
  //         : 0;

  //     const sql = `
  //       INSERT INTO vendor_medicine_table (
  //         user_id,
  //         medicine_owner,
  //         name,
  //         salt_composition,
  //         manufacturers,
  //         medicine_type,
  //         packaging,
  //         packaging_typ,
  //         mrp,
  //         cost_price,
  //         discount_percent,
  //         selling_price,
  //         offers_percent,
  //         prescription_required,
  //         storage,
  //         country_of_origin,
  //         manufacture_address,
  //         best_price,
  //         brought,
  //         image,
  //         added_from
  //       )
  //       VALUES (?, 'vendor', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'vendor')
  //     `;

  //     const values = [
  //       vendor_user_id,
  //       name,
  //       salt_composition || null,
  //       manufacturers || null,
  //       medicine_type || null,
  //       packaging || null,
  //       packaging_typ || null,
  //       mrp || null,
  //       cost_price || null,
  //       discount_percent || null,
  //       selling_price || null,
  //       offers_percent || null,
  //       prescriptionValue,
  //       storage || null,
  //       country_of_origin || null,
  //       manufacture_address || null,
  //       best_price || null,
  //       brought || null,
  //       image ? JSON.stringify(imageUrls) : null,
  //     ];

  //     const [result] = await db.query(sql, values);

  //     return res.status(201).json({
  //       message: "Medicine added successfully",
  //       medicineId: result.insertId,
  //     });
  //   } catch (err) {
  //     console.error("Add Vendor Medicine Error:", err);
  //     res.status(500).json({
  //       message: "Server error",
  //       error: err.message,
  //     });
  //   }
  // },

  /* ---------------------- GET ALL VENDOR MEDICINES ---------------------- */
  getVendorMedicines: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;

      const [rows] = await db.query(
        `
        SELECT *
        FROM vendor_medicine_table
        WHERE vendor_id = ?
        ORDER BY created_at DESC
        `,
        [vendor_user_id],
      );

      res.json(rows);
    } catch (err) {
      console.error("Get Vendor Medicines Error:", err);
      res.status(500).json({
        message: "Server error",
      });
    }
  },

  getVendorMedicineById: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;
      const [[vendor_info]] = await db.query(
        "select vendor_id from vendor_informations where vendor_user_id=?",
        [vendor_user_id],
      );
      const vendor_id = vendor_info?.vendor_id;
      const { id } = req.params;

      const [[medicine]] = await db.query(
        `
      SELECT *
      FROM vendor_medicine_table
      WHERE vendor_medicine_id = ? AND vendor_id = ?
      `,
        [id, vendor_id],
      );

      if (!medicine) {
        return res.status(404).json({
          message: "Medicine not found or unauthorized",
        });
      }

      /* parse images safely */
      let images = [];
      try {
        images = medicine.image ? JSON.parse(medicine.image) : [];
      } catch {
        images = [medicine.image];
      }

      res.json({
        ...medicine,
        images,
      });
    } catch (err) {
      console.error("Get Vendor Medicine Error:", err);
      res.status(500).json({
        message: "Server error",
      });
    }
  },

  deleteVendorMedicine: async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await db.query(
        `
      DELETE FROM vendor_medicine_table
      WHERE medicine_id = ? 
      `,
        [id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Medicine not found or unauthorized",
        });
      }

      res.json({
        message: "Medicine deleted successfully",
      });
    } catch (err) {
      console.error("Delete Vendor Medicine Error:", err);
      res.status(500).json({
        message: "Server error",
      });
    }
  },
  // getBucketMedicines: async (req, res) => {
  //   try {
  //     const bucket_id = req.params.id;
  //     const vendor_user_id = req.user.id;

  //     const [rows] = await db.query(
  //       `
  //     (
  //       /* 1️⃣ Medicines already in bucket */
  //       SELECT
  //         bm.bucket_id,
  //         bm.medicine_source,
  //         bm.medicine_id AS id,
  //         CASE
  //           WHEN bm.medicine_source = 'master' THEN m.name
  //           ELSE vm.name
  //         END AS name,
  //         CASE
  //           WHEN bm.medicine_source = 'master' THEN m.salt_composition
  //           ELSE vm.salt_composition
  //         END AS salt_composition,
  //         CASE
  //           WHEN bm.medicine_source = 'master' THEN m.manufacturers
  //           ELSE vm.manufacturers
  //         END AS manufacturers,
  //         CASE
  //           WHEN bm.medicine_source = 'master' THEN m.packaging
  //           ELSE vm.packaging
  //         END AS packaging,
  //         CASE
  //           WHEN bm.medicine_source = 'master' THEN m.mrp
  //           ELSE vm.mrp
  //         END AS mrp,
  //         CASE
  //           WHEN bm.medicine_source = 'master' THEN m.discount_percent
  //           ELSE vm.discount_percent
  //         END AS discount_percent,
  //         CASE
  //           WHEN bm.medicine_source = 'master' THEN m.selling_price
  //           ELSE vm.selling_price
  //         END AS selling_price,
  //         vm.added_from,
  //         'IN_BUCKET' AS display_source
  //       FROM bucket_medicine_map bm
  //       LEFT JOIN medicines m
  //         ON bm.medicine_source = 'master'
  //        AND m.id = bm.medicine_id
  //       LEFT JOIN vendor_medicine_table vm
  //         ON bm.medicine_source = 'vendor'
  //        AND vm.id = bm.medicine_id
  //       WHERE bm.bucket_id = ?
  //         AND bm.vendor_user_id = ?
  //     )

  //     UNION ALL

  //     (
  //       /* 2️⃣ Vendor medicines (NOT added to bucket) */
  //       SELECT
  //         NULL AS bucket_id,
  //         'vendor' AS medicine_source,
  //         vm.id AS id,
  //         vm.name,
  //         vm.salt_composition,
  //         vm.manufacturers,
  //         vm.packaging,
  //         vm.mrp,
  //         vm.discount_percent,
  //         vm.selling_price,
  //         vm.added_from,
  //         'VENDOR_ONLY' AS display_source
  //       FROM vendor_medicine_table vm
  //       WHERE vm.user_id = ?
  //         AND vm.id NOT IN (
  //           SELECT medicine_id
  //           FROM bucket_medicine_map
  //           WHERE bucket_id = ?
  //             AND vendor_user_id = ?
  //             AND medicine_source = 'vendor'
  //         )
  //     )
  //     `,
  //       [bucket_id, vendor_user_id, vendor_user_id, bucket_id, vendor_user_id],
  //     );

  //     res.json(rows);
  //   } catch (err) {
  //     console.error("getBucketMedicines error:", err);
  //     res.status(500).json({ message: "Server error" });
  //   }
  // },

  getBucketMedicines: async (req, res) => {
    try {
      const bucket_id = req.params.id;
      const vendor_user_id = req.user.id;

      const [rows] = await db.query(
        `
      SELECT 
        b.batch_id,
        b.medicine_id AS id,
        b.name,
        b.salt_composition,
        b.manufacture AS manufacturers,
        b.packing_type AS packaging,
        b.prescription_required,
        b.storage,
        b.country_of_origin,
        b.medicine_type,

        m.manufacturer_address,
        m.image_1,
        m.image_2,

        p.cost_price,
        p.discount,
        p.mrp,
        p.selling_price,
        p.offer_percent,
        p.bought,

        'BATCH_BASED' AS display_source

      FROM batches AS b

      LEFT JOIN medicines AS m 
        ON b.medicine_id = m.medicine_id

      LEFT JOIN prices AS p 
        ON p.batch_id = b.batch_id

      ORDER BY b.batch_id DESC
      `,
        // [bucket_id, vendor_user_id]
      );

      res.json(rows);
    } catch (err) {
      console.error("getBucketMedicines error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
  //get vendor bucket medicine
  getVendorMedicinesByBucket: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;
      const [[vendor_info]] = await db.query(
        `select vendor_id from vendor_informations where vendor_user_id=?`,
        [vendor_user_id],
      );
      const vendor_id = vendor_info?.vendor_id;
      const { bucket_id } = req.params;

      if (!bucket_id) {
        return res.status(400).json({
          message: "bucket_id is required",
        });
      }
      console.log("USER ID:", vendor_user_id);
      console.log("BUCKET ID:", bucket_id);
      console.log("VENDOR ID:", vendor_id);

      if (!vendor_id) {
        return res.status(400).json({
          message: "vendor_id not found for this user",
        });
      }

      const [medicineRows] = await db.query(
        `
    select 
    vm.*,
        b.name as bucket_name,

    vp.mrp,
    vp.discount,
    vp.quantity
    from vendor_medicine as vm
    left join vendor_medicine_price as vp 
    on vm.price_id=vp.price_id 
            left join bucket as b  on vm.bucket_id=b.id

    where vm.bucket_id=? 
    and vm.vendor_id=? 
    ORDER BY vm.vendor_medicine_id ASC
      `,
        [bucket_id, vendor_id],
      );

      res
        .status(200)
        .json({ data: medicineRows, message: "Vendor Medicines By Bucket" });
    } catch (err) {
      console.error("Get Vendor Medicines By Bucket Error:", err);
      res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  },
  //get price through price id
  getPriceThroughPriceId: async (req, res) => {
    try {
      const { price_id } = req.params;
      const [rows] = await db.query("SELECT * FROM prices WHERE price_id = ?", [
        price_id,
      ]);
      res.json(rows);
    } catch (err) {
      console.error("Get Price Through Price ID Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
  getAllAvailableMedicines: async (req, res) => {
    try {
      const vendor_user_id = req.user?.id || null;

      const [master] = await db.query(`SELECT * FROM MEDICINES`);
      const [vendor] = vendor_user_id
        ? await db.query(
          `SELECT * FROM vendor_medicine_table WHERE vendor_id = ?`,
          [vendor_user_id],
        )
        : [[]];

      res.json([
        ...master.map((m) => ({ ...m, source: "MASTER" })),
        ...vendor.map((v) => ({ ...v, source: "VENDOR" })),
      ]);
    } catch (err) {
      console.error("Get All Available Medicines Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ---------------------- GET ALL MASTER MEDICINES (FOR COPYING) ---------------------- */
  getAllMasterMedicines: async (req, res) => {
    try {
      const [medicines] = await db.query(`
      SELECT 
        id,
        name,
        salt_composition,
        manufacturers,
        medicine_type,
        packaging,
        packaging_typ,
        mrp,
        cost_price,
        discount_percent,
        selling_price,
        offers_percent,
        prescription_required,
        storage,
        country_of_origin,
        manufacture_address,
        best_price,
        brought,
        image,
        bucket_id
      FROM medicines
      ORDER BY name ASC
    `);

      res.json(medicines);
    } catch (err) {
      console.error("Get All Master Medicines Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ---------------------- COPY MASTER MEDICINES TO VENDOR TABLE ---------------------- */
  copyMasterMedicinesToVendor: async (req, res) => {
    const conn = await db.getConnection();
    try {
      const id = req.user.id;
      const [[vendor_info]] = await db.query(
        "SELECT vendor_id FROM vendor_informations WHERE vendor_user_id=?",
        [id],
      );
      const vendor_id = vendor_info?.vendor_id;
      const { selected_medicine_ids, bucket_id } = req.body;

      if (
        !selected_medicine_ids ||
        !Array.isArray(selected_medicine_ids) ||
        selected_medicine_ids.length === 0
      ) {
        return res.status(400).json({
          message: "Please select at least one medicine",
        });
      }

      await conn.beginTransaction();

      // Get selected master medicines
      const placeholders = selected_medicine_ids.map(() => "?").join(",");
      const [masterMedicines] = await conn.query(
        `
      SELECT 
        medicine_id AS id,
        name,
        manufacture,
        packaging,
        packing_type,
        mrp,
        cost_price,
        discount_price,
        prescription_required,
        storage,
        country_of_origin,
        category,
        sub_category,
        salt_composition,
        medicine_type,
        selling_price,
        offer_percent,
        manufacturer_address,
        price,
        batch_id,
        description,
        images
      FROM medicine_master_db_table
      WHERE medicine_id IN (${placeholders})
      `,
        selected_medicine_ids,
      );

      if (!masterMedicines.length) {
        await conn.rollback();
        return res.status(404).json({
          message: "No medicines found",
        });
      }

      const generateBatchId = async (conn, name) => {
        // 1. Check if ANY vendor already has this medicine with a batch_id
        const [existingBatch] = await conn.query(
          `SELECT batch_id FROM vendor_medicine WHERE name = ? LIMIT 1`,
          [name],
        );
        if (existingBatch.length > 0) {
          return existingBatch[0].batch_id;
        }

        const namePrefix = name?.trim().substring(0, 2).toUpperCase() || "XX";
        const prefix = `${namePrefix}`;
        const [rows] = await conn.query(
          `SELECT batch_id FROM vendor_medicine WHERE batch_id LIKE ? ORDER BY batch_id DESC LIMIT 1`,
          [`${prefix}%`],
        );
        let number = 1;
        if (rows.length > 0) {
          const lastBatch = rows[0].batch_id;
          const lastNumber = parseInt(lastBatch.replace(prefix, ""), 10);
          if (!isNaN(lastNumber)) {
            number = lastNumber + 1;
          }
        }
        const sequence = String(number).padStart(2, "0");
        return `${prefix}${sequence}`;
      };

      const copied = [];
      for (const med of masterMedicines) {
        // Check if medicine already exists
        const [[existing]] = await conn.query(
          `SELECT vendor_medicine_id FROM vendor_medicine WHERE vendor_id = ? AND name = ? AND bucket_id = ?`,
          [vendor_id, med.name, bucket_id || null],
        );

        if (!existing) {
          let batch_id = await generateBatchId(conn, med.name);

          // 1. Insert into vendor_medicine
          const [medicineResult] = await conn.query(
            `INSERT INTO vendor_medicine (
              name, salt_composition, medicine_type, packing_type,
              country_of_origin, prescription_required, storage,
              manufacture, batch_number, vendor_id, batch_id, bucket_id,medicine_id,medicine_owner
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              med.name,
              med.salt_composition || null,
              med.medicine_type || null,
              med.packing_type || null,
              med.country_of_origin || null,
              med.prescription_required || 0,
              med.storage || null,
              med.manufacture || null,
              med.batch_id || null, // original batch number
              vendor_id,
              batch_id,
              bucket_id || null,
              med.id,
              "super_admin",
            ],
          );

          const vendor_medicine_id = medicineResult.insertId;

          // 2. Insert into vendor_medicine_price
          const [priceResult] = await conn.query(
            `INSERT INTO vendor_medicine_price (
              mrp, cost_price, selling_price, discount, offer_percent,
              quantity, vendor_id, vendor_medicine_id
            ) VALUES (?,?,?,?,?,?,?,?)`,
            [
              med.mrp || 0,
              med.cost_price || 0,
              med.selling_price || 0,
              med.discount_price || 0,
              med.offer_percent || 0,
              0,
              vendor_id,
              vendor_medicine_id,
            ],
          );

          const price_id = priceResult.insertId;

          // Update medicine with price_id
          await conn.query(
            `UPDATE vendor_medicine SET price_id = ? WHERE vendor_medicine_id = ?`,
            [price_id, vendor_medicine_id],
          );

          let image_1 = null, image_2 = null, image_3 = null, image_4 = null, image_5 = null;
          if (med.images) {
            try {
              const parsedImages = JSON.parse(med.images);
              if (Array.isArray(parsedImages)) {
                image_1 = parsedImages[0] || null;
                image_2 = parsedImages[1] || null;
                image_3 = parsedImages[2] || null;
                image_4 = parsedImages[3] || null;
                image_5 = parsedImages[4] || null;
              } else if (typeof parsedImages === 'string') {
                image_1 = parsedImages;
              }
            } catch (e) {
              image_1 = med.images;
            }
          }

          // 3. Insert into vendor_medicine_information
          await conn.query(
            `INSERT INTO vendor_medicine_information (
              vendor_medicine_id, batch_id, manufacturer_address, description, packing,
              image_1, image_2, image_3, image_4, image_5
            ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [
              vendor_medicine_id,
              batch_id,
              med.manufacturer_address || null,
              med.description || null,
              med.packaging || null,
              image_1,
              image_2,
              image_3,
              image_4,
              image_5
            ],
          );

          copied.push(vendor_medicine_id);
        }
      }

      await conn.commit();

      return res.json({
        message: "Master medicines copied to vendor table successfully",
        totalCopied: copied.length,
        totalSelected: selected_medicine_ids.length,
      });
    } catch (err) {
      await conn.rollback();
      console.error("copyMasterMedicinesToVendor error:", err);
      return res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    } finally {
      conn.release();
    }
  },
  copyUniversalBucketToVendor: async (req, res) => {
    const conn = await db.getConnection();
    try {
      const vendor_user_id = req.user.id;
      const { bucket_id } = req.params;

      await conn.beginTransaction();

      const [masterMeds] = await conn.query(
        `SELECT * FROM medicines WHERE bucket_id = ?`,
        [bucket_id],
      );

      if (!masterMeds.length) {
        await conn.rollback();
        return res
          .status(404)
          .json({ message: "No medicines found in this bucket" });
      }

      const mapped = [];
      for (const m of masterMeds) {
        // ✅ already copied?
        const [[existing]] = await conn.query(
          `SELECT id FROM vendor_medicine_table
         WHERE vendor_user_id = ? AND master_medicine_id = ?
         LIMIT 1`,
          [vendor_user_id, m.id],
        );

        let vendorMedId = existing?.id;

        // ✅ if not exists -> copy into vendor table
        if (!vendorMedId) {
          const [ins] = await conn.query(
            `
          INSERT INTO vendor_medicine_table (
            vendor_user_id,
            medicine_owner,
            master_medicine_id,
            name, salt_composition, manufacturers, medicine_type,
            packaging, packaging_typ, mrp, cost_price,
            discount_percent, selling_price, offers_percent,
            prescription_required, storage, country_of_origin,
            manufacture_address, best_price, brought, image
          )
          VALUES (?, 'super_admin', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
            [
              vendor_user_id,
              m.id,
              m.name,
              m.salt_composition,
              m.manufacturers,
              m.medicine_type,
              m.packaging,
              m.packaging_typ,
              m.mrp,
              m.cost_price,
              m.discount_percent,
              m.selling_price,
              m.offers_percent,
              m.prescription_required,
              m.storage,
              m.country_of_origin,
              m.manufacture_address,
              m.best_price,
              m.brought,
              m.image,
            ],
          );

          vendorMedId = ins.insertId;
        }

        // ✅ map into bucket_medicine_map (as vendor)
        const [[mapExists]] = await conn.query(
          `
        SELECT id FROM bucket_medicine_map
        WHERE bucket_id = ?
          AND medicine_id = ?
          AND medicine_source = 'vendor'
          AND vendor_user_id = ?
        LIMIT 1
        `,
          [bucket_id, vendorMedId, vendor_user_id],
        );

        if (!mapExists) {
          await conn.query(
            `
          INSERT INTO bucket_medicine_map
          (bucket_id, medicine_id, medicine_source, vendor_user_id)
          VALUES (?, ?, 'vendor', ?)
          `,
            [bucket_id, vendorMedId, vendor_user_id],
          );
        }

        mapped.push(vendorMedId);
      }

      await conn.commit();

      return res.json({
        message:
          "Bucket copied successfully. Vendor medicines created + mapped.",
        bucket_id,
        totalCopiedOrReused: mapped.length,
      });
    } catch (err) {
      await conn.rollback();
      console.error("copyUniversalBucketToVendor error:", err);
      return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    } finally {
      conn.release();
    }
  },

  getMedicinesByBucket: async (req, res) => {
    try {
      const { bucket_id } = req.params;

      if (!bucket_id) {
        return res.status(400).json({
          message: "bucket_id is required",
        });
      }

      const [medicines] = await db.query(
        `
      SELECT *
      FROM medicines
      WHERE bucket_id = ?
      `,
        [bucket_id],
      );

      res.json({
        count: medicines.length,
        data: medicines,
      });
    } catch (err) {
      console.error("getMedicinesByBucket error:", err);
      res.status(500).json({
        message: "Server error",
      });
    }
  },
  removeMedicineFromBucket: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;
      const { bucket_id, medicine_id, medicine_source } = req.body;

      if (!bucket_id || !medicine_id || !medicine_source) {
        return res.status(400).json({
          message: "bucket_id, medicine_id, medicine_source required",
        });
      }

      const [result] = await db.query(
        `
      DELETE FROM bucket_medicine_map
      WHERE bucket_id = ?
        AND medicine_id = ?
        AND medicine_source = ?
        AND vendor_user_id = ?
      `,
        [bucket_id, medicine_id, medicine_source, vendor_user_id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Medicine not found in bucket",
        });
      }

      res.json({
        message: "Medicine removed from bucket successfully",
      });
    } catch (err) {
      console.error("removeMedicineFromBucket error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ---------------------- COPY BUCKET MEDICINES TO VENDOR TABLE ---------------------- */
  copyBucketMedicinesToVendor: async (req, res) => {
    const conn = await db.getConnection();
    try {
      const vendor_user_id = req.user.id;
      const { bucket_id } = req.params;
      const { selected_medicine_ids } = req.body; // Array of selected medicine IDs

      if (!bucket_id) {
        return res.status(400).json({
          message: "bucket_id is required",
        });
      }

      await conn.beginTransaction();

      // Get medicines from medicine table (super admin created medicines with bucket_id)
      // These are the master medicines in the bucket
      let masterQuery = `
      SELECT 
        id AS medicine_id,
        'master' AS medicine_source,
        name,
        salt_composition,
        manufacturers,
        medicine_type,
        packaging,
        packaging_typ,
        mrp,
        cost_price,
        discount_percent,
        selling_price,
        offers_percent,
        prescription_required,
        storage,
        country_of_origin,
        manufacture_address,
        best_price,
        brought,
        image
      FROM medicine
      WHERE bucket_id = ?
    `;

      // If specific medicines are selected, filter by IDs
      if (
        selected_medicine_ids &&
        Array.isArray(selected_medicine_ids) &&
        selected_medicine_ids.length > 0
      ) {
        const placeholders = selected_medicine_ids.map(() => "?").join(",");
        masterQuery += ` AND id IN (${placeholders})`;
      }

      const masterParams = [bucket_id];
      if (
        selected_medicine_ids &&
        Array.isArray(selected_medicine_ids) &&
        selected_medicine_ids.length > 0
      ) {
        masterParams.push(...selected_medicine_ids);
      }

      const [masterMedicines] = await conn.query(masterQuery, masterParams);

      // Also get medicines from bucket_medicine_map (vendor-specific mappings)
      const [mappedMedicines] = await conn.query(
        `
      SELECT 
        bm.medicine_id,
        bm.medicine_source,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.name
          ELSE vm.name
        END AS name,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.salt_composition
          ELSE vm.salt_composition
        END AS salt_composition,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.manufacturers
          ELSE vm.manufacturers
        END AS manufacturers,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.medicine_type
          ELSE vm.medicine_type
        END AS medicine_type,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.packaging
          ELSE vm.packaging
        END AS packaging,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.packaging_typ
          ELSE vm.packaging_typ
        END AS packaging_typ,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.mrp
          ELSE vm.mrp
        END AS mrp,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.cost_price
          ELSE vm.cost_price
        END AS cost_price,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.discount_percent
          ELSE vm.discount_percent
        END AS discount_percent,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.selling_price
          ELSE vm.selling_price
        END AS selling_price,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.offers_percent
          ELSE vm.offers_percent
        END AS offers_percent,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.prescription_required
          ELSE vm.prescription_required
        END AS prescription_required,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.storage
          ELSE vm.storage
        END AS storage,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.country_of_origin
          ELSE vm.country_of_origin
        END AS country_of_origin,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.manufacture_address
          ELSE vm.manufacture_address
        END AS manufacture_address,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.best_price
          ELSE vm.best_price
        END AS best_price,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.brought
          ELSE vm.brought
        END AS brought,
        CASE
          WHEN bm.medicine_source = 'master' THEN m.image
          ELSE vm.image
        END AS image
      FROM bucket_medicine_map bm
      LEFT JOIN medicine m
        ON bm.medicine_source = 'master' AND m.id = bm.medicine_id
      LEFT JOIN vendor_medicine_table vm
        ON bm.medicine_source = 'vendor' AND vm.id = bm.medicine_id
      WHERE bm.bucket_id = ?
        AND bm.vendor_user_id = ?
      `,
        [bucket_id, vendor_user_id],
      );

      // For copying, we only want master medicines (from medicine table with bucket_id)
      // Don't include vendor-specific mappings as those are already vendor's own medicines
      const bucketMedicines = masterMedicines;

      if (!bucketMedicines.length) {
        await conn.rollback();
        return res.status(404).json({
          message: "No medicines found in this bucket",
        });
      }

      const copied = [];
      for (const med of bucketMedicines) {
        // Check if medicine already exists in vendor_medicine_table
        // Check by name and bucket_id to avoid duplicates
        const [[existing]] = await conn.query(
          `
        SELECT id FROM vendor_medicine_table
        WHERE vendor_id = ? AND name = ? AND added_from = 'bucket' AND bucket_id = ?
        LIMIT 1
        `,
          [vendor_user_id, med.name, bucket_id],
        );

        if (!existing) {
          // Insert into vendor_medicine_table
          const [result] = await conn.query(
            `
          INSERT INTO vendor_medicine_table (
            user_id,
            medicine_owner,
            name,
            salt_composition,
            manufacturers,
            medicine_type,
            packaging,
            packaging_typ,
            mrp,
            cost_price,
            discount_percent,
            selling_price,
            offers_percent,
            prescription_required,
            storage,
            country_of_origin,
            manufacture_address,
            best_price,
            brought,
            image,
            added_from,
            bucket_id
          )
          VALUES (?, 'super_admin', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'bucket', ?)
          `,
            [
              vendor_user_id,
              med.name,
              med.salt_composition || null,
              med.manufacturers || null,
              med.medicine_type || null,
              med.packaging || null,
              med.packaging_typ || null,
              med.mrp || null,
              med.cost_price || null,
              med.discount_price || null,
              med.selling_price || null,
              med.offers_percent || null,
              med.prescription_required || 0,
              med.storage || null,
              med.country_of_origin || null,
              med.manufacture_address || null,
              med.best_price || null,
              med.brought || null,
              med.image || null,
              bucket_id,
            ],
          );
          copied.push(result.insertId);
        }
      }

      await conn.commit();

      return res.json({
        message: "Bucket medicines copied to vendor table successfully",
        totalCopied: copied.length,
        bucket_id,
      });
    } catch (err) {
      await conn.rollback();
      console.error("copyBucketMedicinesToVendor error:", err);
      return res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    } finally {
      conn.release();
    }
  },

  /* ---------------------- UPDATE VENDOR MEDICINE ---------------------- */
  // updateVendorMedicine: async (req, res) => {
  //   try {
  //     const vendor_user_id = req.user.id;
  //     const { id } = req.params;

  //     const {
  //       name,
  //       salt_composition,
  //       manufacturers,
  //       medicine_type,
  //       packaging,
  //       packaging_typ,
  //       mrp,
  //       cost_price,
  //       discount_percent,
  //       selling_price,
  //       offers_percent,
  //       prescription_required,
  //       storage,
  //       country_of_origin,
  //       manufacture_address,
  //       best_price,
  //       brought,
  //       image,
  //     } = req.body;

      // First check if medicine exists and belongs to this vendor
      // const [[medicine]] = await db.query(
      //   `
      // SELECT id, user_id, added_from
      // FROM vendor_medicine_table
      // WHERE id = ? AND user_id = ?
      // `,
      //   [id, vendor_user_id],
      // );

      // if (!medicine) {
      //   return res.status(404).json({
      //     message:
      //       "Medicine not found or you don't have permission to update it",
      //   });
      // }

      // Get image files if uploaded
      // const filesArray = Array.isArray(req.files) ? req.files : [];
      // const imageUrls = filesArray.map((f) => f.path);
      // const imageValue =
      //   imageUrls.length > 0 ? JSON.stringify(imageUrls) : image || null;

      // const prescriptionValue =
      //   prescription_required === true ||
      //     prescription_required === 1 ||
      //     prescription_required === "1" ||
      //     prescription_required === "true"
      //     ? 1
      //     : 0;

      // Update medicine (only vendor's own medicines)
  //     await db.query(
  //       `
  //     UPDATE vendor_medicine_table
  //     SET
  //       name = ?,
  //       salt_composition = ?,
  //       manufacturers = ?,
  //       medicine_type = ?,
  //       packaging = ?,
  //       packaging_typ = ?,
  //       mrp = ?,
  //       cost_price = ?,
  //       discount_percent = ?,
  //       selling_price = ?,
  //       offers_percent = ?,
  //       prescription_required = ?,
  //       storage = ?,
  //       country_of_origin = ?,
  //       manufacture_address = ?,
  //       best_price = ?,
  //       brought = ?,
  //       image = ?
  //     WHERE id = ? AND user_id = ?
  //     `,
  //       [
  //         name || null,
  //         salt_composition || null,
  //         manufacturers || null,
  //         medicine_type || null,
  //         packaging || null,
  //         packaging_typ || null,
  //         mrp || null,
  //         cost_price || null,
  //         discount_percent || null,
  //         selling_price || null,
  //         offers_percent || null,
  //         prescriptionValue,
  //         storage || null,
  //         country_of_origin || null,
  //         manufacture_address || null,
  //         best_price || null,
  //         brought || null,
  //         imageValue,
  //         id,
  //         vendor_user_id,
  //       ],
  //     );

  //     return res.json({
  //       message: "Medicine updated successfully",
  //     });
  //   } catch (err) {
  //     console.error("updateVendorMedicine error:", err);
  //     return res.status(500).json({
  //       message: "Server error",
  //       error: err.message,
  //     });
  //   }
  // },

  //newMedicineController

  getBatches: async (req, res) => {
    const { bucket_id } = req.params;

    const query = `
      SELECT 
        b.batch_id, 
        b.medicine_id,
        b.name, 
        b.salt_composition,
        b.medicine_type,
        b.packing_type,
        b.country_of_origin,
        b.prescription_required,
        b.storage,
        b.manufacture,
        p.mrp 
      FROM batches b 
      LEFT JOIN prices p ON b.batch_id = p.batch_id AND b.medicine_id = p.medicine_id 
      WHERE b.bucket_id=?
    `;

    const [result] = await db.query(query, [bucket_id]);

    return res
      .status(200)
      .json({ msg: "Data from batch get successfullt", data: result });
  },

  getMedicinesThroughBatchId: async (req, res) => {
    try {
      const { bucket_id } = req.params;

      const query = `select * from medicines where bucket_id=?`;

      const [result] = await db.query(query, [bucket_id]);

      return res
        .status(200)
        .json({ msg: "Data from batch get successfullt", data: result });
    } catch (err) {
      res.send(500).json({ msg: "server error", data: err });
    }
  },
  getMedicinePrice: async (req, res) => {
    try {
      const { batch_id, medicine_id } = req.body;

      const query = `select mrp,discount,selling_price,offer_percent,bought,cost_price,expiry_date,quantity from prices where batch_id=? and medicine_id=?`;

      const [result] = await db.query(query, [batch_id, medicine_id]);

      return res
        .status(200)
        .json({ msg: "Data from batch get successfullt", data: result[0] });
    } catch (err) {
      res.send(500).json({ msg: "server error", data: err });
    }
  },
  getAllMedicinePrice: async (req, res) => {
    try {
      const batch_id = req.body;
      const query = `select mrp,discount,selling_price,offer_percent,bought,cost_price,expiry_date,quantity from prices where batch_id=? `;

      const [result] = await db.query(query, [batch_id]);

      return res
        .status(200)
        .json({ msg: "Data from batch get successfullt", data: result });
    } catch (err) {
      res.send(500).json({ msg: "server error", data: err });
    }
  },
  getMedicineThroughBatch: async (req, res) => {
    try {
      const { batch_id } = req.body;
      const query = `select * from medicines where batch_id=?`;
      const [result] = await db.query(query, [batch_id]);
      return res
        .status(200)
        .json({ msg: "Medicine from batch_id get successfullt", data: result });
    } catch (err) {
      return res.status(500).json({ msg: "server error", error: err });
    }
  },

  getMedicineThroughBucketId: async (req, res) => {
    try {
      const { bucket_id } = req.params;

      const query = `
      SELECT
        b.name AS bucket_name,
        mb.batch_id,
        mb.medicine_id,
        mm.name,
        mm.salt_composition,
        mm.packing_type,
        mm.manufacture,
        mb.mrp,
        mb.expiry_date,
        mb.manufacturer_date,
        mm.prescription_required
      FROM bucket_medicine_map AS bm
      INNER JOIN medicine_master_db_table AS mm ON bm.medicine_id = mm.medicine_id
      LEFT JOIN bucket AS b ON b.id = bm.bucket_id
      LEFT JOIN master_batch_table AS mb ON mb.id = (
        SELECT MAX(mb2.id)
        FROM master_batch_table AS mb2
        WHERE mb2.medicine_id = mm.medicine_id
      )
      WHERE bm.bucket_id = ?
    `;

      const [result] = await db.query(query, [bucket_id]);

      return res.status(200).json({
        msg: "Medicines from Bucket fetched successfully",
        data: result,
      });

    } catch (err) {
      console.error("getMedicineThroughBucketId error:", err);
      return res.status(500).json({ msg: "Server error", error: err });
    }
  },

  getMedicineDetails: async (req, res) => {
    try {
      const { medicine_id, batch_id, bucket_id } = req.params;

      const query = `
      SELECT 
        mb.batch_id,
        mb.medicine_id,
        mm.name,
        mm.manufacturer_address,
        mm.safety_advice,
        mm.question_answers,
        mm.medicine_type,
        mm.pregnancy_interaction,
        mm.images,
        bm.bucket_id,
        mm.lactation_interaction,
        mm.common_side_effect,
        mm.how_it_works,
        mm.introduction,
        mm.salt_composition,
        mm.packing_type,
        mm.manufacture,
        mb.mrp,
        mb.expiry_date,
        mb.manufacturer_date,
        mm.prescription_required
      FROM bucket_medicine_map AS bm
      LEFT JOIN medicine_master_db_table AS mm
        ON bm.medicine_id = mm.medicine_id
      LEFT JOIN bucket AS b
        ON b.id = bm.bucket_id
      LEFT JOIN master_batch_table AS mb
        ON mm.medicine_id = mb.medicine_id
      WHERE mb.medicine_id = ?
        AND mb.batch_id = ?
        AND bm.bucket_id = ?
    `;

      const [result] = await db.query(query, [
        medicine_id,
        batch_id,
        bucket_id
      ]);

      return res.status(200).json({
        msg: "data received successfully",
        data: result
      });

    } catch (err) {
      console.log(err);

      return res.status(500).json({
        msg: "server error",
        error: err.message
      });
    }
  },
  //medicine price detail through medicine and batch id
  getMedicinePriceDetail: async (req, res) => {
    try {
      const { medicine_id, batch_id } = req.params;
      const query = `select * from prices where medicine_id=? and batch_id=?`;
      const [result] = await db.query(query, [medicine_id, batch_id]);
      return res
        .status(200)
        .json({ msg: "data recieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ msg: "server error", data: err });
    }
  },
  getPriceDetail: async (req, res) => {
    try {
      const { medicine_id } = req.params;

      const [rows] = await db.query(
        `SELECT * FROM medicine_master_db_table WHERE medicine_id=?`,
        [medicine_id],
      );

      if (!rows.length) {
        return res.status(404).json({ msg: "Medicine not found" });
      }

      res.json({ data: rows[0] });
    } catch (err) {
      return res.status(500).json({ msg: "Server error" });
    }
  },
  updateMedicinePrice: async (req, res) => {
    try {
      const { medicine_id } = req.params;

      if (!medicine_id) {
        return res.status(400).json({ msg: "Missing medicine_id" });
      }

      const {
        mrp,
        discount = 0,
        offer_percent = 0,
        cost_price,
        selling_price,
        expiry_date,
        quantity,
        manufacturer_date
      } = req.body;

      if (!mrp || !cost_price || !quantity) {
        return res
          .status(400)
          .json({ msg: "MRP, Cost Price and Quantity are required" });
      }
      const expiry_dates = new Date(expiry_date).toISOString().slice(0, 10);
      const finalSellingPrice =
        selling_price !== undefined
          ? selling_price
          : mrp - (mrp * discount) / 100;

      const query = `
      UPDATE medicine_master_db_table
      SET 
        mrp = ?,
        discount_price = ?,
        selling_price = ?,
        offer_percent = ?,
        cost_price = ?,
        expiry_date = ?,
        quantity = ?,
        manufacturer_date=?
      WHERE medicine_id = ?
    `;

      const [result] = await db.query(query, [
        mrp,
        discount,
        finalSellingPrice,
        offer_percent,
        cost_price,
        expiry_dates,
        quantity,
        manufacturer_date,
        medicine_id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ msg: "Price record not found" });
      }

      return res.status(200).json({
        msg: "Price updated successfully",
        updated: {
          medicine_id,
          selling_price: finalSellingPrice,
        },
      });
    } catch (err) {
      console.error("Update Price Error:", err);
      return res.status(500).json({ msg: "Server error" });
    }
  },

  // count medicines in bucket
  getBucketMedicineCount: async (req, res) => {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT COUNT(*) as total FROM batches WHERE bucket_id = ?`,
      [id],
    );

    res.json({ count: rows[0].total });
  },

  //creating new medicine

  createMedicine: async (req, res) => {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();
      const { bucket_id } = req.params;
      
      const {
        name,
        batchNumber,
        salt_composition,
        medicine_type,
        packing,
        packing_type,
        country_of_origin,
        prescription_required,
        storage,

        mrp,
        quantity,
        discount,
        cost_price,
        selling_price,
        offer_percent,

        manufacture,
        manufacturer_date,
        manufacturer_address,
        expiry_date,

        description,
        introduction,
        how_it_works,
        if_miss,
        common_side_effect,
        use_of,
        safety_advice,

        alcohol_interaction,
        driving_interaction,
        kidney_interaction,
        lactation_interaction,
        liver_interaction,
        pregnancy_interaction,
        question_answers,
      } = req.body;

      if (
        !name ||
        !salt_composition ||
        !medicine_type ||
        !packing ||
        !mrp ||
        !selling_price ||
        !manufacture ||
        !expiry_date
      ) {
        return res.status(400).json({
          success: false,
          message: "Required fields are missing",
        });
      }

      const generateBatchId = async (conn, name) => {
        // 1. Check if ANY entry already has this medicine with a batch_id
        const [existingBatch] = await conn.query(
          `SELECT batch_id FROM medicine_master_db_table WHERE name = ? LIMIT 1`,
          [name],
        );
        if (existingBatch.length > 0) {
          return existingBatch[0].batch_id;
        }

        const namePrefix = name?.trim().substring(0, 2).toUpperCase() || "XX";
        const prefix = `${namePrefix}`;
        const [rows] = await conn.query(
          `SELECT batch_id FROM medicine_master_db_table WHERE batch_id LIKE ? ORDER BY batch_id DESC LIMIT 1`,
          [`${prefix}%`],
        );
        let number = 1;
        if (rows.length > 0) {
          const lastBatch = rows[0].batch_id;
          const lastNumber = parseInt(lastBatch.replace(prefix, ""), 10);
          if (!isNaN(lastNumber)) {
            number = lastNumber + 1;
          }
        }
        const sequence = String(number).padStart(2, "0");
        return `${prefix}${sequence}`;
      };

      let batch_id = await generateBatchId(conn, name);
      const [[existingBatch]] = await conn.query(
        `SELECT batch_id FROM medicine_master_db_table WHERE batch_id = ?`,
        [batch_id],
      );
      if (existingBatch) {
        batch_id = existingBatch.batch_id;
      }

      const [result] = await conn.query(
        `INSERT INTO medicine_master_db_table (
        batch_id,
        bucket_id,
        batch_number,
        name,
        salt_composition,
        medicine_type,
        packaging,
        packing_type,
        country_of_origin,
        prescription_required,
        storage,

        mrp,
        quantity,
        discount_price,
        cost_price,
        selling_price,
        offer_percent,

        manufacture,
        manufacturer_date,
        manufacturer_address,
        expiry_date,

        description,
        introduction,
        how_it_works,
        if_miss,
        common_side_effect,
        use_of,
        safety_advice,

        alcohol_interaction,
        driving_interaction,
        kidney_interaction,
        lactation_interaction,
        liver_interaction,
        pregnancy_interaction,
        question_answers,
        created_at
      ) VALUES (?, ?,?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          null,
          0,
          batch_id,
          bucket_id,
          batchNumber,
          name,
          salt_composition,
          medicine_type,
          packing,
          packing_type || null,
          country_of_origin || null,
          prescription_required || null,
          storage || null,

          mrp,
          quantity || null,
          discount || null,
          cost_price || null,
          selling_price,
          offer_percent || null,

          manufacture,
          manufacturer_date || null,
          manufacturer_address || null,
          expiry_date,

          description || null,
          introduction || null,
          how_it_works || null,
          if_miss || null,
          common_side_effect || null,
          use_of || null,
          safety_advice || null,

          alcohol_interaction || null,
          driving_interaction || null,
          kidney_interaction || null,
          lactation_interaction || null,
          liver_interaction || null,
          pregnancy_interaction || null,
          question_answers || null,
        ],
      );

      await conn.commit();

      res.status(201).json({
        success: true,
        message: "Medicine created successfully",
        data: {
          medicine_id: result.insertId,
          batch_id,
        },
      });
    } catch (error) {
      await conn.rollback();
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to create medicine",
        error: error.message,
      });
    } finally {
      conn.release();
    }
  },

  //get medicine from db
  getAllDbMedicines: async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM medicine_master_db_table");

      return res.json({
        msg: "DB medicines fetched",
        data: rows,
      });
    } catch (err) {
      return res.status(500).json({
        msg: "server error",
        error: err,
      });
    }
  },

  getAllMedicineThroughBatch: async (req, res) => {
    try {
      const [result] = await db.query(
        "select *,mrp from batches left join prices on batches.batch_id=prices.batch_id",
      );
      return res
        .status(200)
        .json({ msg: "Medicine Get Successfully", data: result });
    } catch (err) {
      return res.status(500).json({ msg: "server error", data: err });
    }
  },

  deleteMedicine: async (req, res) => {
    const { medicine_id } = req.params;

    try {
      // ✅ Check if medicine exists
      const [[medicine]] = await db.query(
        "SELECT medicine_id FROM medicine_master_db_table WHERE medicine_id = ?",
        [medicine_id],
      );

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: "Medicine not found",
        });
      }

      // ✅ Delete medicine
      const [result] = await db.query(
        "Update medicine_master_db_table set bucket_id=0 where medicine_id=?",
        [medicine_id],
      );

      return res.status(200).json({
        success: true,
        message: "Medicine deleted successfully",
        data: result,
      });
    } catch (err) {
      console.error("deleteMedicine error:", err);

      return res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
      });
    }
  },

  /* ---------------------- VENDOR SPECIFIC CRUD ---------------------- */

  getVendorMedicines: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;
      const [rows] = await db.query(
        "SELECT * FROM vendor_medicine_table WHERE vendor_id = ?",
        [vendor_user_id],
      );
      res.json(rows);
    } catch (err) {
      console.error("getVendorMedicines error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
  getVendorMedicineById: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;
      const [[vendor_info]] = await db.query(
        "select vendor_id from vendor_informations where vendor_user_id=?",
        [vendor_user_id],
      );
      const vendor_id = vendor_info?.vendor_id;
      const { id } = req.params;
      const [[rows]] = await db.query(
        `
        SELECT vm.*, vp.*, vi.* 
        FROM vendor_medicine vm
        LEFT JOIN vendor_medicine_price vp ON vm.vendor_medicine_id = vp.vendor_medicine_id
        LEFT JOIN vendor_medicine_information vi ON vm.vendor_medicine_id = vi.vendor_medicine_id
        WHERE vm.vendor_id = ? AND vm.vendor_medicine_id = ?
        `,
        [vendor_id, id],
      );
      res.json({ msg: "Vendor Medicine Fetched Successfully", data: rows });
    } catch (err) {
      console.error("getVendorMedicineById error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
  addVendorMedicine: async (req, res) => {
    try {
      const id = req.user.id;
      const { bucket_id } = req.params;

      // ✅ Validate bucket_id
      if (!bucket_id) {
        return res.status(400).json({
          message: "bucket_id is required",
        });
      }

      const [[vendor_info]] = await db.query(
        "select vendor_id from vendor_informations where vendor_user_id=?",
        [id],
      );
      const vendor_id = vendor_info?.vendor_id;

      // ✅ Validate vendor_id exists
      if (!vendor_id) {
        return res.status(400).json({
          message: "vendor_id not found for this user",
        });
      }

      const {
        name,
        salt_composition,
        medicine_type,
        packing_type,
        country_of_origin,
        prescription_required,
        storage,
        manufacture,
        batchNumber,

        // PRICE
        mrp,
        cost_price,
        selling_price,
        discount,
        offer_percent,

        // STOCK
        quantity,
        expiry_date,
        manufacturer_date,

        // INFO
        description,
        alcohol_interaction,
        common_side_effect,
        driving_interaction,
        how_it_works,
        if_miss_dose,
        introduction,
        kidney_interaction,
        liver_interaction,
        lactation_interaction,
        pregnancy_interaction,
        question_answers,
        safety_advice,
        use_of,
        packing,
      } = req.body;

      /* ---------------- VALIDATION ---------------- */
      if (!name || !salt_composition || !mrp) {
        return res.status(400).json({
          message: "Name, Salt Composition and MRP are required",
        });
      }

      /* ---------------- IMAGE HANDLING ---------------- */
      const front = req.files?.front?.[0]?.path || null;
      const back = req.files?.back?.[0]?.path || null;
      const top = req.files?.top?.[0]?.path || null;
      const view = req.files?.view?.[0]?.path || null;
      const expiry = req.files?.expiry?.[0]?.path || null;

      if (!front) {
        return res.status(400).json({
          message: "Front image is required",
        });
      }

      /* ---------------- PRESCRIPTION FIX ---------------- */
      const prescriptionValue =
        prescription_required == 1 || prescription_required === "1" ? 1 : 0;

      /* ---------------- BATCH ID GENERATION ---------------- */
      const generateBatchId = async (conn, name) => {
        // 1. Check if ANY vendor already has this medicine with a batch_id
        const [existingBatch] = await conn.query(
          `SELECT batch_id FROM vendor_medicine WHERE name = ? LIMIT 1`,
          [name],
        );
        if (existingBatch.length > 0) {
          return existingBatch[0].batch_id;
        }

        const namePrefix = name?.trim().substring(0, 2).toUpperCase() || "XX";
        const prefix = `${namePrefix}`;
        const [rows] = await conn.query(
          `SELECT batch_id FROM vendor_medicine WHERE batch_id LIKE ? ORDER BY batch_id DESC LIMIT 1`,
          [`${prefix}%`],
        );
        let number = 1;
        if (rows.length > 0) {
          const lastBatch = rows[0].batch_id;
          const lastNumber = parseInt(lastBatch.replace(prefix, ""), 10);
          if (!isNaN(lastNumber)) {
            number = lastNumber + 1;
          }
        }
        const sequence = String(number).padStart(2, "0");
        return `${prefix}${sequence}`;
      };
      const batch_id = await generateBatchId(db, name);

      const [medicineResult] = await db.query(
        `INSERT INTO vendor_medicine
      (name, salt_composition, medicine_type, packing_type,
       country_of_origin, prescription_required, storage,
       manufacture, batch_number, vendor_id, batch_id, bucket_id)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          name,
          salt_composition,
          medicine_type || null,
          packing_type || null,
          country_of_origin || null,
          prescriptionValue,
          storage || null,
          manufacture || null,
          batchNumber || null,
          vendor_id,
          batch_id,
          bucket_id,
        ],
      );


      // ✅ Validate insert was successful
      if (!medicineResult.insertId) {
        return res.status(500).json({
          message: "Failed to insert medicine into vendor_medicine table",
        });
      }

      const vendor_medicine_id = medicineResult.insertId;

      const [priceResult] = await db.query(
        `INSERT INTO vendor_medicine_price
      (mrp, cost_price, selling_price, discount, offer_percent,
       quantity, expiry_date, manufacturer_date, vendor_id, vendor_medicine_id)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          mrp || 0,
          cost_price || 0,
          selling_price || 0,
          discount || 0,
          offer_percent || 0,
          quantity || 0,
          expiry_date || null,
          manufacturer_date || null,
          vendor_id,
          vendor_medicine_id,
        ],
      );
      const price_id = priceResult.insertId;
      await db.query(
        `update vendor_medicine set price_id=? where vendor_medicine_id=?`,
        [price_id, vendor_medicine_id],
      );

      await db.query(
        `INSERT INTO vendor_medicine_information
      (vendor_medicine_id, batch_id,
       manufacturer_address,
       image_1, image_2, image_3, image_4, image_5,
       description, alcohol_interaction, common_side_effect,
       driving_interaction, how_it_works, if_miss,
       introduction, kidney_interaction, liver_interaction,
       lactation_interaction, pregnancy_interaction,
       question_answers, safety_advice, use_of, packing)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          vendor_medicine_id,
          batch_id,
          manufacture || null,

          front,
          back,
          top,
          view,
          expiry,

          description || null,
          alcohol_interaction || null,
          common_side_effect || null,
          driving_interaction || null,
          how_it_works || null,
          if_miss_dose || null,
          introduction || null,
          kidney_interaction || null,
          liver_interaction || null,
          lactation_interaction || null,
          pregnancy_interaction || null,
          question_answers || null,
          safety_advice || null,
          use_of || null,
          packing || null,
        ],
      );

      /* ---------------- SUCCESS ---------------- */
      res.status(201).json({
        message: "Medicine Added Successfully",
        vendor_medicine_id,
        bucket_id,
      });
    } catch (err) {
      console.error("addVendorMedicine error:", err);
      res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  },

  updateVendorMedicine: async (req, res) => {
    try {
      const { id } = req.params; // vendor_medicine_id
      const vendor_user_id = req.user.id;
      console.log("Updating vendor medicine with ID:", id, "for user ID:", vendor_user_id);
      const [[vendor_info]] = await db.query(
        `select vendor_id from vendor_informations where vendor_user_id=?`,
        [vendor_user_id],
      );
      const vendor_id = vendor_info?.vendor_id;
      const {
        mrp,
        discount,
        quantity,
      } = req.body;

      // Update ONLY the price table
      await db.query(
        `UPDATE vendor_medicine_price SET 
          mrp=?,  discount=?, 
          quantity=?
        WHERE vendor_medicine_id=? AND vendor_id=?`,
        [
          mrp || 0,
          discount || 0,
          quantity || 0,
          id,
          vendor_id,
        ],
      );

      res.json({ message: "Medicine Pricing Updated Successfully" });
    } catch (err) {
      console.error("updateVendorMedicine error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  deleteVendorMedicine: async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const { id } = req.params;
      const vendor_user_id = req.user.id;
      const [[vendor_info]] = await conn.query(
        "select vendor_id from vendor_informations where vendor_user_id=?",
        [vendor_user_id],
      );
      const vendor_id = vendor_info?.vendor_id;

      // Check if this medicine is referenced in orders (or order_items)
      const [[orderRef]] = await conn.query(
        "SELECT COUNT(*) as count FROM order_items WHERE vendor_medicine_id = ?",
        [id]
      );
      if (orderRef && orderRef.count > 0) {
        await conn.rollback();
        return res.status(409).json({
          message: "Cannot delete this medicine because it is associated with existing orders. You can set its quantity/stock to 0 to make it unavailable.",
        });
      }

      // 1. Break the circular dependency link: vendor_medicine <-> vendor_medicine_price
      // We set price_id to NULL so that vendor_medicine no longer "protects" the price row from deletion.
      await conn.query(
        "UPDATE vendor_medicine SET price_id = NULL WHERE vendor_medicine_id = ? AND vendor_id = ?",
        [id, vendor_id],
      );

      // 2. Delete other related records that depend on the medicine_id
      await conn.query(
        "DELETE FROM vendor_discounts_offers WHERE vendor_medicine_id = ?",
        [id],
      );
      await conn.query(
        "DELETE FROM vendor_medicine_information WHERE vendor_medicine_id = ?",
        [id],
      );

      // 3. Delete from the price table
      // This is now safe from the first constraint (medicine -> price)
      // And we do this BEFORE deleting vendor_medicine to satisfy the second constraint (price -> medicine)
      await conn.query(
        "DELETE FROM vendor_medicine_price WHERE vendor_medicine_id = ? AND vendor_id = ?",
        [id, vendor_id],
      );

      // 4. Finally, delete the main medicine record
      const [result] = await conn.query(
        "DELETE FROM vendor_medicine WHERE vendor_medicine_id = ? AND vendor_id = ?",
        [id, vendor_id],
      );

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({
          message: "Medicine not found or unauthorized",
        });
      }

      await conn.commit();
      res.json({ message: "Medicine Deleted Successfully" });
    } catch (err) {
      await conn.rollback();
      console.error("deleteVendorMedicine error:", err);
      if (err.errno === 1451 || err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
          message: "Cannot delete this medicine because it is associated with existing orders. You can set its quantity/stock to 0 to make it unavailable.",
        });
      }
      res.status(500).json({ message: "Server error", error: err.message });
    } finally {
      conn.release();
    }
  },

  getVendorBucketMedicine: async (req, res) => {
    try {
      const vendor_id = req.user.id;
      const { bucket_id } = req.params;
      const [rows] = await db.query(
        `select * from medicine_master_db_table where bucket_id = ?`,
        [bucket_id],
      );

      if (!rows.length) {
        return res.json({ msg: "No medicines found in this bucket", data: [] });
      }

      const generateBatchId = async (conn, name) => {
        // 1. Check if ANY vendor already has this medicine with a batch_id
        const [existingBatch] = await conn.query(
          `SELECT batch_id FROM vendor_medicine WHERE name = ? LIMIT 1`,
          [name],
        );
        if (existingBatch.length > 0) {
          return existingBatch[0].batch_id;
        }

        const namePrefix = name?.trim().substring(0, 2).toUpperCase() || "XX";
        const prefix = `${namePrefix}`;
        const [rows] = await conn.query(
          `SELECT batch_id FROM vendor_medicine WHERE batch_id LIKE ? ORDER BY batch_id DESC LIMIT 1`,
          [`${prefix}%`],
        );
        let number = 1;
        if (rows.length > 0) {
          const lastBatch = rows[0].batch_id;
          const lastNumber = parseInt(lastBatch.replace(prefix, ""), 10);
          if (!isNaN(lastNumber)) {
            number = lastNumber + 1;
          }
        }
        const sequence = String(number).padStart(2, "0");
        return `${prefix}${sequence}`;
      };

      for (const med of rows) {
        // Check if medicine already exists
        const [[existing]] = await db.query(
          `SELECT vendor_medicine_id FROM vendor_medicine WHERE vendor_id = ? AND name = ? AND bucket_id = ?`,
          [vendor_id, med.name, bucket_id],
        );

        if (!existing) {
          let batch_id = await generateBatchId(db, med.name);

          // 1. Insert into vendor_medicine
          const [medicineResult] = await db.query(
            `INSERT INTO vendor_medicine (
              name, salt_composition, medicine_type, packing_type,
              country_of_origin, prescription_required, storage,
              manufacture, batch_number, vendor_id, batch_id, bucket_id, medicine_owner
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              med.name || "Na",
              med.salt_composition || null,
              med.medicine_type || null,
              med.packing_type || null,
              med.country_of_origin || null,
              med.prescription_required || 0,
              med.storage || null,
              med.manufacture || null,
              med.batch_id || null, // batchNumber
              vendor_id,
              batch_id,
              bucket_id,
              "super_admin",
            ],
          );

          const vendor_medicine_id = medicineResult.insertId;

          // 2. Insert into vendor_medicine_price
          const [priceResult] = await db.query(
            `INSERT INTO vendor_medicine_price (
              mrp, cost_price, selling_price, discount, offer_percent,
              quantity, vendor_id, vendor_medicine_id
            ) VALUES (?,?,?,?,?,?,?,?)`,
            [
              med.mrp || 0,
              med.cost_price || 0,
              med.selling_price || 0,
              med.discount_price || 0,
              med.offer_percent || 0,
              0, // quantity initial
              vendor_id,
              vendor_medicine_id,
            ],
          );

          const price_id = priceResult.insertId;

          // Update medicine with price_id
          await db.query(
            `UPDATE vendor_medicine SET price_id = ? WHERE vendor_medicine_id = ?`,
            [price_id, vendor_medicine_id],
          );

          // 3. Insert into vendor_medicine_information
          await db.query(
            `INSERT INTO vendor_medicine_information (
              vendor_medicine_id, batch_id, manufacturer_address, description, packing
            ) VALUES (?,?,?,?,?)`,
            [
              vendor_medicine_id,
              batch_id,
              med.manufacturer_address || null,
              med.description || null,
              med.packaging || null,
            ],
          );
        }
      }
      res.json({
        msg: "Vendor Bucket Medicine Fetched Successfully",
        data: rows,
      });
    } catch (err) {
      console.error("getVendorBucketMedicine error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
  addBucketMedicineToVendorBucket: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;
      const [[vendor_info]] = await db.query(`select vendor_id from vendor_informations where vendor_user_id=?`, [vendor_user_id])
      const vendor_id = vendor_info?.vendor_id;
      const { bucket_id } = req.body;
      if (!bucket_id) {
        return res.status(400).json({
          message: "bucket_id is required",
        });
      }
      console.log("USER ID:", vendor_user_id);
      console.log("BUCKET ID:", bucket_id);

      // Fetch medicines via bucket_medicine_map joined with bucket + medicine_master_db_table
      // md.* is selected last so it shadows any same-named bm columns (name, medicine_id, etc.)
      // keeping all existing datas.xxx insert references valid
      const [data] = await db.query(
        `SELECT
          bm.id            AS bm_id,
          bm.medicine_source,
          bm.medicine_owner AS bm_medicine_owner,
          bm.is_bucket,
          bm.packaging     AS bm_packaging,
          b.name           AS bucket_name,
          md.*
        FROM bucket_medicine_map AS bm
        LEFT JOIN bucket                   AS b  ON b.id         = bm.bucket_id
        LEFT JOIN medicine_master_db_table AS md ON md.medicine_id = bm.medicine_id
        WHERE bm.bucket_id = ?`,
        [bucket_id],
      );

      for (let datas of data) {
        // Check if medicine already exists for this vendor and bucket
        const [[existing]] = await db.query(
          `SELECT vendor_medicine_id FROM vendor_medicine WHERE vendor_id = ? AND name = ? AND bucket_id = ?`,
          [vendor_id, datas.name, bucket_id || null],
        );

        if (!existing) {
          const [medicineData] = await db.query(
            `Insert into vendor_medicine(
                  name,
                  salt_composition, 
                  medicine_type , 
                  packing_type, 
                  country_of_origin, 
                  prescription_required, 
                  storage , 
                  manufacture ,
                  batch_number ,
                  bucket_id  ,
                  vendor_id ,
                  medicine_id,
                  batch_id ,
                  medicine_owner)values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              datas.name,
              datas.salt_composition,
              datas.medicine_type,
              datas.packing_type,
              datas.country_of_origin,
              datas.prescription_required,
              datas.storage,
              datas.manufacture,
              datas.batchNumber,
              bucket_id,
              vendor_id,
              datas.medicine_id,
              datas.batch_id,
              "super_admin",
            ],
          );
          const vendorMedicineId = medicineData.insertId;

          const [priceData] = await db.query(
            `Insert into vendor_medicine_price(
                      mrp, 
                      discount, 
                      bought, 
                      quantity, 
                      vendor_id, 
                      vendor_medicine_id,
                      batch_id
                      )values(?,?,?,?,?,?,0)`,
            [
              datas.mrp || 0,
              datas.discount || 0,

              datas.bought || 0,

              datas.quantity,
              vendor_id,
              vendorMedicineId,
            ],
          );
          const priceId = priceData.insertId;

          await db.query(
            `UPDATE vendor_medicine SET price_id = ? WHERE vendor_medicine_id = ?`,
            [priceId, vendorMedicineId],
          );

          let image_1 = null, image_2 = null, image_3 = null, image_4 = null, image_5 = null;
          if (datas.images) {
            try {
              const parsedImages = JSON.parse(datas.images);
              if (Array.isArray(parsedImages)) {
                image_1 = parsedImages[0] || null;
                image_2 = parsedImages[1] || null;
                image_3 = parsedImages[2] || null;
                image_4 = parsedImages[3] || null;
                image_5 = parsedImages[4] || null;
              } else if (typeof parsedImages === 'string') {
                image_1 = parsedImages;
              }
            } catch (e) {
              image_1 = datas.images;
            }
          }

          await db.query(
            `Insert into vendor_medicine_information(
                  vendor_medicine_id,  
                  batch_id,
                  manufacturer_address,
                  image_1,
                  image_2,
                  image_3,
                  image_4,
                  image_5,  
                  alcohol_interaction,
                  common_side_effect,
                  description,
                  driving_interaction,  
                  how_it_works,
                  if_miss,
                  introduction,
                  kidney_interaction,  
                  lactation_interaction,
                  liver_interaction,  
                  pregnancy_interaction,  
                  question_answers , 
                  safety_advice,  
                  use_of,
                  packing
                  )values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              vendorMedicineId,
              datas.batch_id,
              datas.manufacturer_address || null,
              image_1,
              image_2,
              image_3,
              image_4,
              image_5,
              datas.alcohol_interaction || null,
              datas.common_side_effect || null,
              datas.description || null,
              datas.driving_interaction || null,
              datas.how_it_works || null,
              datas.if_miss || null,
              datas.introduction || null,
              datas.kidney_interaction || null,
              datas.lactation_interaction || null,
              datas.liver_interaction || null,
              datas.pregnancy_interaction || null,
              datas.question_answers || null,
              datas.safety_advice || null,
              datas.use_of || null,
              datas.packing || null,
            ],
          );

          // Stamp vendor_user_id on the bucket_medicine_map row so it knows which vendor copied it
          await db.query(
            `UPDATE bucket_medicine_map
             SET vendor_user_id = ?
             WHERE medicine_id = ? AND bucket_id = ?`,
            [vendor_user_id, datas.medicine_id, bucket_id],
          );
        }
      }

      // Return vendor medicines for this vendor & bucket so client receives the newly added items
      const [vendorRows] = await db.query(
        `
        SELECT vm.*, vp.mrp, vp.discount, vp.quantity
        FROM vendor_medicine AS vm
        LEFT JOIN vendor_medicine_price AS vp ON vm.price_id = vp.price_id
        WHERE vm.vendor_id = ? AND vm.bucket_id = ?
        ORDER BY vm.vendor_medicine_id ASC
      `,
        [vendor_id, bucket_id],
      );

      res.status(200).json({ message: "Medicine Added To Vendor Bucket", data: vendorRows });
    } catch (err) {
      console.error("Get Vendor Medicines By Bucket Error:", err);
      res.status(500).json({
        message: "Server error",
      });
    }
  },

  createNewBatchId: async (req, res) => {
    try {

      const { mrp, expiry_date, manufacturer_date, medicine_id, quantity } = req.body;

      if (!medicine_id || mrp == null || mrp === "" || !expiry_date) {
        return res.status(400).json({
          message: "medicine_id, mrp, and expiry_date are required",
        });
      }

      const expiry = new Date(expiry_date);
      if (Number.isNaN(expiry.getTime())) {
        return res.status(400).json({ message: "Invalid expiry_date" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry <= today) {
        return res.status(400).json({
          message: "Expiry date must be greater than current date",
        });
      }

      const [[medicine]] = await db.query(
        `SELECT medicine_id, name FROM medicine_master_db_table WHERE medicine_id = ?`,
        [medicine_id],
      );

      if (!medicine) {
        return res.status(404).json({
          message: "Medicine not found in medicine_master_db_table",
        });
      }

      const batch_id = await generateNextBatchId(db, medicine.name);

      const [[duplicate]] = await db.query(
        `SELECT id FROM master_batch_table
         WHERE medicine_id = ? AND batch_id = ?`,
        [medicine_id, batch_id],
      );
      if (duplicate) {
        return res.status(409).json({
          message: "Batch already exists for this medicine",
          batch_id,
        });
      }

      const batchRow = await insertMasterBatchRow(db, {
        medicine_id,
        batch_id,
        mrp,
        expiry_date,
        manufacturer_date,
        quantity,
      });

      return res.status(201).json({
        message: "Batch created successfully",
        data: batchRow,
      });
    } catch (err) {
      console.error("Create New Batch Id Error:", err);
      return res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  },

  getMasterBatchesByMedicine: async (req, res) => {
    try {
      const { medicine_id } = req.params;
      const [rows] = await db.query(
        `SELECT * FROM master_batch_table
         WHERE medicine_id = ?
         ORDER BY created_at DESC`,
        [medicine_id],
      );
      return res.status(200).json({
        message: "Batches fetched successfully",
        data: rows,
      });
    } catch (err) {
      console.error("getMasterBatchesByMedicine error:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  // Update a batch in master_batch_table
  updateMasterBatch: async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity, mrp, expiry_date, manufacturer_date } = req.body;

      // Check batch exists
      const [[existing]] = await db.query(
        `SELECT id FROM master_batch_table WHERE id = ?`,
        [id],
      );
      if (!existing) {
        return res.status(404).json({ message: "Batch not found" });
      }

      // Build dynamic SET clause — only update fields that are provided
      const updates = [];
      const values = [];

      if (quantity !== undefined && quantity !== null) {
        updates.push("quantity = ?");
        values.push(Number(quantity));
      }
      if (mrp !== undefined && mrp !== null) {
        updates.push("mrp = ?");
        values.push(Number(mrp));
      }
      if (expiry_date !== undefined) {
        updates.push("expiry_date = ?");
        values.push(expiry_date ? new Date(expiry_date).toISOString().slice(0, 10) : null);
      }
      if (manufacturer_date !== undefined) {
        updates.push("manufacturer_date = ?");
        values.push(manufacturer_date ? new Date(manufacturer_date).toISOString().slice(0, 10) : null);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No fields provided to update" });
      }

      values.push(id);
      await db.query(
        `UPDATE master_batch_table SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );

      // Return updated row
      const [[updated]] = await db.query(
        `SELECT * FROM master_batch_table WHERE id = ?`,
        [id],
      );

      return res.status(200).json({
        message: "Batch updated successfully",
        data: updated,
      });
    } catch (err) {
      console.error("updateMasterBatch error:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  // Delete a batch from master_batch_table
  deleteMasterBatch: async (req, res) => {
    try {
      const { id } = req.params;

      // Check batch exists
      const [[existing]] = await db.query(
        `SELECT id, batch_id FROM master_batch_table WHERE id = ?`,
        [id],
      );
      if (!existing) {
        return res.status(404).json({ message: "Batch not found" });
      }

      await db.query(
        `DELETE FROM master_batch_table WHERE id = ?`,
        [id],
      );

      return res.status(200).json({
        message: `Batch ${existing.batch_id} deleted successfully`,
      });
    } catch (err) {
      console.error("deleteMasterBatch error:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  },
  updateQuantityInSpecificBatchId: async (req, res) => {
    try {
      const { batch_id, medicine_id } = req.params;
      const { quantity } = req.body;
      if (quantity < 0) {
        return res.status(400).json({ msg: "Quantity should be greater than 0" });
      }
      await db.query(`update master_batch_table set quantity=? where id= ? and medicine_id=? `, [quantity, batch_id, medicine_id]);
      return res.status(200).json({ msg: "Update the quantity successfully" });
    } catch (err) {
      console.error("MasterBatch error:", err);
      return res.status(500).json({ message: "Server error", error: err.message });

    }
  },
  deleteInSpecificBatchId: async (req, res) => {
    try {
      const { batch_id, medicine_id } = req.params;
      await db.query(`delete from master_batch_table where medicine_id=? and id=? `, [medicine_id, batch_id]);
      return res.status(200).json({ msg: "Delete the quantity successfully" });
    } catch (err) {
      console.error("MasterBatch error:", err);
      return res.status(500).json({ message: "Server error", error: err.message });

    }
  },
  createNewBatchByVendor: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;
      const { mrp, medicine_id, expiry_date, manufacturer_date, discount, quantity } = req.body;
console.log("Vendor User ID:", vendor_user_id);
console.log("Medicine ID:", medicine_id);
      const [[medicine_name]] = await db.query(`select name from medicine_master_db_table where medicine_id=?`, [medicine_id]);

      const batch_id = await generateNextBatchId(db, medicine_name.name);
      if (expiry_date > new Date()) {
        return res.status(400).json({ msg: "Expiry date should be greater than current date" });
      }
      const [[duplicate]] = await db.query(
        `SELECT id FROM master_batch_table
         WHERE medicine_id = ? AND batch_id = ?`,
        [medicine_id, batch_id],
      );
      if (duplicate) {
        return res.status(409).json({
          message: "Batch already exists for this medicine",
          batch_id,
        });
      }

      const [result] = await db.query(
        `INSERT INTO master_batch_table (medicine_id,batch_id,mrp,quantity,expiry_date,manufacturer_date,created_by) VALUES (?,?,?,?,?,?,?)`,
        [medicine_id, batch_id, mrp, quantity, expiry_date, manufacturer_date, "vendor"]
      )

      // const id = result.insertId;

      // await db.query(`insert into vendor_medicine_price (batch_id,mrp,quantity,vendor_id,vendor_medicine_id,discount) values(?,?,?,?,?,?)`, [
      //   id,
      //   mrp,
      //   quantity,
      //   vendor_user_id,
      //   medicine_id,
      //   discount
      // ])
      return res.status(200).json({ msg: "Batch created Successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err.message });

    }
  },
 deleteInSpecificBatchIdByVendor: async (req, res) => {
    try {
      const { batch_id, medicine_id } = req.params;
      await db.query(`delete from master_batch_table where medicine_id=? and id=? `, [medicine_id, batch_id]);
      return res.status(200).json({ msg: "Delete the quantity successfully" });
    } catch (err) {
      console.error("MasterBatch error:", err);
      return res.status(500).json({ message: "Server error", error: err.message });

    }
  },

  selectMedicineFromBatch:async(req,res)=>{
    try{
     const {batch_id,medicine_id}=req.params;
      const [rows]=await db.query(`select * from master_batch_table where medicine_id=? and id=?`,[medicine_id,batch_id]);
      return res.status(200).json({msg:"Fetch the batch successfully",data:rows});

    }catch(err){
      console.error("MasterBatch error:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
  }
},
copyMasterMedicineToVendor : async (req, res) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const vendor_id = req.user.id;
    const { medicine_id, batch_id,bucket_id } = req.params;

    const [[vendor_info]] = await conn.query(
      "select vendor_id from vendor_informations where vendor_user_id=?",
      [vendor_id],
    );
    const vendorId = vendor_info?.vendor_id;
    /* =====================================================
       1️⃣ VALIDATE PARAMS
    ===================================================== */
    if (!medicine_id || !batch_id) {
      return res.status(400).json({
        message: "medicine_id and batch_id are required",
      });
    }

    /* =====================================================
       2️⃣ GET MASTER MEDICINE + BATCH
    ===================================================== */
    const [[master]] = await conn.query(
      `
      SELECT
        mt.*,
        mb.id                AS batch_row_id,
        mb.batch_id          AS batch_id,
        mb.mrp               AS mrp,
        mb.expiry_date       AS expiry_date,
        mb.manufacturer_date AS manufacturer_date,
        mb.quantity          AS quantity,
        mb.created_by        AS created_by
      FROM medicine_master_db_table mt
      LEFT JOIN master_batch_table mb
        ON mt.medicine_id = mb.medicine_id
      WHERE mt.medicine_id = ?
        AND mb.id = ?
      `,
      [medicine_id, batch_id]
    );

    if (!master) {
      await conn.rollback();
      return res.status(404).json({
        message: "Medicine or batch not found",
      });
    }

    /* =====================================================
       3️⃣ CHECK IF ALREADY COPIED (prevent duplicates)
    ===================================================== */
    const [[existing]] = await conn.query(
      `
      SELECT vendor_medicine_id 
      FROM vendor_medicine
      WHERE vendor_id = ?
        AND medicine_id = ?
        AND batch_id = ?
      LIMIT 1
      `,
      [vendor_id, medicine_id, master.batch_id]
    );

    if (existing) {
      await conn.rollback();
      return res.status(409).json({
        message: "This medicine with this batch is already in your inventory",
        vendor_medicine_id: existing.vendor_medicine_id,
      });
    }

    /* =====================================================
       4️⃣ INSERT INTO vendor_medicine
    ===================================================== */
    const [vendorMedicineResult] = await conn.query(
      `
      INSERT INTO vendor_medicine (
        name,
        salt_composition,
        medicine_type,
        packing_type,
        country_of_origin,
        prescription_required,
        storage,
        manufacture,
        batch_number,
        bucket_id,
        batch_id,
        medicine_owner,
        medicine_id,
        category,
        sub_category,
        vendor_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'super_admin', ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        master.name,
        master.salt_composition,
        master.medicine_type,
        master.packing_type,
        master.country_of_origin,
        master.prescription_required,
        master.storage,
        master.manufacture,
        master.batch_number,
        bucket_id,
        master.batch_id,
        master.medicine_id,
        master.category,
        master.sub_category,
        vendorId
      ]
    );

    const vendor_medicine_id = vendorMedicineResult.insertId;

    /* =====================================================
       5️⃣ INSERT INTO vendor_medicine_information
    ===================================================== */
    const [infoResult] = await conn.query(
      `
      INSERT INTO vendor_medicine_information (
        vendor_medicine_id,
        batch_id,
        manufacturer_address,
        alcohol_interaction,
        common_side_effect,
        description,
        driving_interaction,
        how_it_works,
        if_miss,
        introduction,
        kidney_interaction,
        lactation_interaction,
        liver_interaction,
        pregnancy_interaction,
        question_answers,
        safety_advice,
        use_of,
        packing,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        vendor_medicine_id,
        master.batch_id,
        master.manufacturer_address  || null,
        master.alcohol_interaction   || null,
        master.common_side_effect    || null,
        master.description           || null,
        master.driving_interaction   || null,
        master.how_it_works          || null,
        master.if_miss               || null,
        master.introduction          || null,
        master.kidney_interaction    || null,
        master.lactation_interaction || null,
        master.liver_interaction     || null,
        master.pregnancy_interaction || null,
        master.question_answers      || null,
        master.safety_advice         || null,
        master.use_of                || null,
        master.packaging             || null,
      ]
    );

    const medicine_information_id = infoResult.insertId;

    /* =====================================================
       6️⃣ INSERT INTO vendor_medicine_price
          ⚠️ batch_id here is INT → use batch_row_id (mb.id)
    ===================================================== */
    const [priceResult] = await conn.query(
      `
      INSERT INTO vendor_medicine_price (
        mrp,
        discount,
        bought,
        quantity,
        vendor_id,
        vendor_medicine_id,
        batch_id,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        master.mrp          || 0,
        master.offer_percent || 0,
        0,
        master.quantity      || 0,
        vendor_id,
        vendor_medicine_id,
        master.batch_row_id, // ✅ INT — mb.id not mb.batch_id
      ]
    );

    const price_id = priceResult.insertId;

    /* =====================================================
       7️⃣ UPDATE vendor_medicine — link price & info ids
    ===================================================== */
    await conn.query(
      `
      UPDATE vendor_medicine
      SET
        price_id               = ?
      WHERE vendor_medicine_id = ?
      `,
      [price_id,  vendor_medicine_id]
    );

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: "Medicine copied successfully",
      data: {
        vendor_medicine_id,
        medicine_information_id,
        price_id,
      },
    });

  } catch (err) {
    await conn.rollback();
    console.error("copyMasterMedicineToVendor error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  } finally {
    conn.release();
  }
}
}

module.exports = { medicineControllers };
