const db = require("../db");
const generateBatchNumber = require("../utils/batchNumberGenerator");
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
      INSERT INTO BUCKET
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

  /* ---------------------- GET ALL BUCKETS ---------------------- */
  getAllBucket: async (req, res) => {
    // const {bucket_id}=req.body;
    try {
      const [rows] = await db.query(
        "SELECT bucket.*, COUNT(id) AS total_medicines FROM bucket LEFT JOIN batches ON bucket.id = batches.bucket_id GROUP BY bucket.id",
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
      const [rows] = await db.query("SELECT * FROM BUCKET WHERE id = ?", [id]);
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
  addMedicineToBucket: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;
      const { bucket_id, medicine_id, medicine_source } = req.body;

      if (!bucket_id || !medicine_id || !medicine_source) {
        return res.status(400).json({
          message: "bucket_id, medicine_id, medicine_source required",
        });
      }

      // const [[bucket]]=await db.query(`select capacity from bucket where bucket_id=?`,[bucket_id]);
      const [[exists]] = await db.query(
        `
      SELECT id FROM bucket_medicine_map
      WHERE bucket_id = ?
        AND medicine_id = ?
        AND medicine_source = ?
        AND vendor_user_id = ?
      `,
        [bucket_id, medicine_id, medicine_source, vendor_user_id],
      );

      if (exists) {
        return res.status(409).json({
          message: "Medicine already exists in this bucket",
        });
      }
      // const[[count]]=await db.query(`select count(*) as total from batches where bucket_id=?`,[bucket_id]);
      await db.query(
        `
      INSERT INTO bucket_medicine_map
      (bucket_id, medicine_id, medicine_source, vendor_user_id)
      VALUES (?, ?, ?, ?)
      `,
        [bucket_id, medicine_id, medicine_source, vendor_user_id],
      );

      const [[dbMed]] = await db.query(
        `SELECT * FROM db_medicine WHERE db_medicine_id = ?`,
        [medicine_id],
      );

      // if(count>=bucket.capacity){
      //   return res.status(409).json({
      //     message: "Bucket is full",
      //   });
      // }
      if (dbMed) {
        const [medResult] = await db.query(
          `INSERT INTO medicines (manufacturer, description) VALUES (?, ?)`,
          [dbMed.manufacturers || "not defined", dbMed.name || "not defined"],
        );

        const actualMedicineId = medResult.insertId;

        const [batchResult] = await db.query(
          `INSERT INTO batches 
           (bucket_id, medicine_id, name, salt_composition, medicine_type, packing_type, country_of_origin, prescription_required, storage, manufacture) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            bucket_id,
            actualMedicineId,
            dbMed.name,
            dbMed.salt_composition || "not defined",
            dbMed.medicine_type || "not defined",
            dbMed.packing_type || "not defined",
            dbMed.country_of_origin || "not defined",
            dbMed.prescription_required || "No",
            dbMed.storage || "Cool & Dry",
            dbMed.manufacturers || "not defined",
          ],
        );

        const newBatchId = batchResult.insertId;

        await db.query(
          `INSERT INTO prices 
           (batch_id, medicine_id, mrp, discount, selling_price, offer_percent, cost_price, quantity) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newBatchId,
            actualMedicineId,
            dbMed.price || 0,
            0,
            dbMed.price || 0,
            0,
            dbMed.price || 0,
            0,
          ],
        );
      }

      res.json({ message: "Medicine mapped to bucket successfully" });
    } catch (err) {
      console.error("addMedicineToBucket error:", err);
      res.status(500).json({ message: "Server error" });
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
      FROM BUCKET
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
        WHERE user_id = ?
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
      const { id } = req.params;

      const [[medicine]] = await db.query(
        `
      SELECT *
      FROM vendor_medicine_table
      WHERE id = ? AND user_id = ?
      `,
        [id, vendor_user_id],
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
      WHERE id = ? 
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
      const { bucket_id } = req.params;

      if (!bucket_id) {
        return res.status(400).json({
          message: "bucket_id is required",
        });
      }
      console.log("USER ID:", vendor_user_id);
      console.log("BUCKET ID:", bucket_id);

      const [rows] = await db.query(
        `
      SELECT * 
      FROM vendor_medicine_table 
      WHERE user_id = ? 
        AND bucket_id = ?
      ORDER BY created_at DESC
      `,
        [vendor_user_id, bucket_id],
      );

      res
        .status(200)
        .json({ data: rows, message: "Vendor Medicines By Bucket" });
    } catch (err) {
      console.error("Get Vendor Medicines By Bucket Error:", err);
      res.status(500).json({
        message: "Server error",
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
            `SELECT * FROM vendor_medicine_table WHERE user_id = ?`,
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
      const vendor_user_id = req.user.id;
      const { selected_medicine_ids, bucket_id } = req.body; // Array of selected medicine IDs

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
        db_medicine_id AS id,
        name,
        manufacturers,
        packaging,
        price,
        best_price,
        discount_price,
        prescription_required,
        storage,
        country_of_origin,
        category,
        sub_category
      FROM db_medicine
      WHERE db_medicine_id IN (${placeholders})
      `,
        selected_medicine_ids,
      );

      if (!masterMedicines.length) {
        await conn.rollback();
        return res.status(404).json({
          message: "No medicines found",
        });
      }

      const copied = [];
      for (const med of masterMedicines) {
        // Check if medicine already exists in vendor_medicine_table
        const [[existing]] = await conn.query(
          `
        SELECT id FROM vendor_medicine_table
        WHERE user_id = ? AND name = ? AND added_from = 'bucket' AND bucket_id = ?
        LIMIT 1
        `,
          [vendor_user_id, med.name, bucket_id || null],
        );

        if (!existing) {
          // Insert into vendor_medicine_table with added_from='bucket'
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
              med.discount_percent || null,
              med.selling_price || null,
              med.offers_percent || null,
              med.prescription_required || 0,
              med.storage || null,
              med.country_of_origin || null,
              med.manufacture_address || null,
              med.best_price || null,
              med.brought || null,
              med.image || null,
              bucket_id || null,
            ],
          );
          copied.push(result.insertId);
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
        WHERE user_id = ? AND name = ? AND added_from = 'bucket' AND bucket_id = ?
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
              med.discount_percent || null,
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
  updateVendorMedicine: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;
      const { id } = req.params;

      const {
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
      } = req.body;

      // First check if medicine exists and belongs to this vendor
      const [[medicine]] = await db.query(
        `
      SELECT id, user_id, added_from
      FROM vendor_medicine_table
      WHERE id = ? AND user_id = ?
      `,
        [id, vendor_user_id],
      );

      if (!medicine) {
        return res.status(404).json({
          message:
            "Medicine not found or you don't have permission to update it",
        });
      }

      // Get image files if uploaded
      const filesArray = Array.isArray(req.files) ? req.files : [];
      const imageUrls = filesArray.map((f) => f.path);
      const imageValue =
        imageUrls.length > 0 ? JSON.stringify(imageUrls) : image || null;

      const prescriptionValue =
        prescription_required === true ||
        prescription_required === 1 ||
        prescription_required === "1" ||
        prescription_required === "true"
          ? 1
          : 0;

      // Update medicine (only vendor's own medicines)
      await db.query(
        `
      UPDATE vendor_medicine_table
      SET
        name = ?,
        salt_composition = ?,
        manufacturers = ?,
        medicine_type = ?,
        packaging = ?,
        packaging_typ = ?,
        mrp = ?,
        cost_price = ?,
        discount_percent = ?,
        selling_price = ?,
        offers_percent = ?,
        prescription_required = ?,
        storage = ?,
        country_of_origin = ?,
        manufacture_address = ?,
        best_price = ?,
        brought = ?,
        image = ?
      WHERE id = ? AND user_id = ?
      `,
        [
          name || null,
          salt_composition || null,
          manufacturers || null,
          medicine_type || null,
          packaging || null,
          packaging_typ || null,
          mrp || null,
          cost_price || null,
          discount_percent || null,
          selling_price || null,
          offers_percent || null,
          prescriptionValue,
          storage || null,
          country_of_origin || null,
          manufacture_address || null,
          best_price || null,
          brought || null,
          imageValue,
          id,
          vendor_user_id,
        ],
      );

      return res.json({
        message: "Medicine updated successfully",
      });
    } catch (err) {
      console.error("updateVendorMedicine error:", err);
      return res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  },

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
  getMedicineDetails: async (req, res) => {
    try {
      const { medicine_id } = req.params;
      const query = `select * from medicines where medicine_id=? `;

      const [result] = await db.query(query, [medicine_id]);

      return res
        .status(200)
        .json({ msg: "data recieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ msg: "server error", data: err });
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
      const { medicine_id, batch_id } = req.params;

      const [rows] = await db.query(
        "SELECT * FROM prices WHERE medicine_id=? AND batch_id=?",
        [medicine_id, batch_id],
      );

      if (!rows.length) {
        return res.status(404).json({ msg: "Price not found" });
      }

      res.json({ data: rows[0] }); // return OBJECT
    } catch (err) {
      return res.status(500).json({ msg: "Server error" });
    }
  },
  updateMedicinePrice: async (req, res) => {
    try {
      const { medicine_id, batch_id } = req.params;

      if (!medicine_id || !batch_id) {
        return res.status(400).json({ msg: "Missing medicine_id or batch_id" });
      }

      const {
        mrp,
        discount = 0,
        offer_percent = 0,
        bought = 0,
        cost_price,
        expiry_date,
        quantity,
      } = req.body;

      if (!mrp || !cost_price || !quantity) {
        return res
          .status(400)
          .json({ msg: "MRP, Cost Price and Quantity are required" });
      }
      const expiry_dates = new Date(expiry_date).toISOString().slice(0, 10);
      const calculatedSellingPrice = mrp - (mrp * discount) / 100;

      const query = `
      UPDATE prices
      SET 
        mrp = ?,
        discount = ?,
        selling_price = ?,
        offer_percent = ?,
        bought = ?,
        cost_price = ?,
        expiry_date = ?,
        quantity = ?
      WHERE medicine_id = ? AND batch_id = ?
    `;

      const [result] = await db.query(query, [
        mrp,
        discount,
        calculatedSellingPrice,
        offer_percent,
        bought,
        cost_price,
        expiry_dates,
        quantity,
        medicine_id,
        batch_id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ msg: "Price record not found" });
      }

      return res.status(200).json({
        msg: "Price updated successfully",
        updated: {
          medicine_id,
          batch_id,
          selling_price: calculatedSellingPrice,
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

      const bucket_id = req.params.bucket_id;

      const {
        name,
        saltcomposition,
        manufacturer,
        manufactureaddress,
        countryoforigin,
        medicinetype,
        packingtype,
        packing,
        prescriptionrequired,
        storage,
        description,

        mrp,
        discount,
        sellingprice,
        offerpercent,
        bought,
        costprice,
        expirydate,
        quantity,

        discounttoconsumer,
        discounttocompany,
        companydiscount,
        vendordiscount,
        companyoffer,
        vendoroffer,
        validfrom,
        validtill,
      } = req.body;

      /* =========================
       0️⃣ HANDLE IMAGES
    ========================== */

      const images = req.files || [];

      const image1 = images[0]?.path || null;
      const image2 = images[1]?.path || null;
      const image3 = images[2]?.path || null;
      const image4 = images[3]?.path || null;
      const image5 = images[4]?.path || null;

      /* =========================
       1️⃣ INSERT MEDICINE
    ========================== */

      const [medicineResult] = await conn.query(
        `
      INSERT INTO medicines
      (
        manufacturer,
        manufacturer_address,
        image_1,
        image_2,
        image_3,
        image_4,
        image_5,
        description
      )
      VALUES (?,?,?,?,?,?,?,?)
      `,
        [
          manufacturer,
          manufactureaddress,
          image1,
          image2,
          image3,
          image4,
          image5,
          description,
        ],
      );

      const medicine_id = medicineResult.insertId;

      /* =========================
       2️⃣ INSERT BATCH
    ========================== */

      const [batchResult] = await conn.query(
        `
      INSERT INTO batches
      (
        name,
        salt_composition,
        medicine_type,
        packing_type,
        country_of_origin,
        prescription_required,
        storage,
        manufacture,
        bucket_id,
        medicine_id
      )
      VALUES (?,?,?,?,?,?,?,?,?,?)
      `,
        [
          name,
          saltcomposition,
          medicinetype,
          packingtype,
          countryoforigin,
          prescriptionrequired,
          storage,
          manufacturer,
          bucket_id,
          medicine_id,
        ],
      );

      const batch_id = batchResult.insertId;

      /* =========================
       3️⃣ GENERATE BATCH NUMBER
    ========================== */

      const batchNumber = generateBatchNumber(name, batch_id);

      await conn.query(`UPDATE batches SET batchNumber=? WHERE batch_id=?`, [
        batchNumber,
        batch_id,
      ]);

      /* =========================
       4️⃣ INSERT PRICE
    ========================== */

      const [priceResult] = await conn.query(
        `
      INSERT INTO prices
      (
        medicine_id,
        batch_id,
        mrp,
        discount,
        selling_price,
        offer_percent,
        bought,
        cost_price,
        expiry_date,
        quantity
      )
      VALUES (?,?,?,?,?,?,?,?,?,?)
      `,
        [
          medicine_id,
          batch_id,
          mrp,
          discount,
          sellingprice,
          offerpercent,
          bought,
          costprice,
          expirydate,
          quantity,
        ],
      );

      const price_id = priceResult.insertId;

      /* =========================
       5️⃣ INSERT DISCOUNT OFFER
    ========================== */

      await conn.query(
        `
      INSERT INTO discounts_offers
      (
        medicine_id,
        batch_id,
        price_id,
        discount_to_consumer,
        discount_to_company,
        company_discount,
        vendor_discount,
        company_offer,
        vendor_offer,
        valid_from,
        valid_till,
        quantity
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      `,
        [
          medicine_id,
          batch_id,
          price_id,
          discounttoconsumer,
          discounttocompany,
          companydiscount,
          vendordiscount,
          companyoffer,
          vendoroffer,
          validfrom,
          validtill,
          quantity,
        ],
      );

      await conn.commit();

      res.json({
        success: true,
        message: "Medicine created successfully",
        batchNumber,
      });
    } catch (err) {
      await conn.rollback();

      console.error(err);

      res.status(500).json({
        success: false,
        message: "Failed to create medicine",
      });
    } finally {
      conn.release();
    }
  },
  //get medicine from db
  getAllDbMedicines: async (req, res) => {
    try {
      const [rows] = await db.query(`SELECT * FROM db_medicine`);

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
    const { batch_id, medicine_id } = req.params;
    try {
      // 1. Find bucket_id first to clean up the map
      const [[batch]] = await db.query(
        "SELECT bucket_id FROM batches WHERE batch_id = ?",
        [batch_id],
      );

      if (batch) {
        // Only delete mapping if this was the last batch of this medicine in this bucket
        const [[otherBatches]] = await db.query(
          "SELECT COUNT(*) as count FROM batches WHERE bucket_id = ? AND medicine_id = ? AND batch_id != ?",
          [batch.bucket_id, medicine_id, batch_id],
        );

        if (otherBatches[0]?.count === 0) {
          await db.query(
            "DELETE FROM bucket_medicine_map WHERE bucket_id = ? AND medicine_id = ?",
            [batch.bucket_id, medicine_id],
          );
        }
      }

      // 2. Delete price first
      await db.query(
        "DELETE FROM prices WHERE batch_id = ? AND medicine_id = ?",
        [batch_id, medicine_id],
      );

      const [result] = await db.query(
        `delete from batches where batch_id=? and medicine_id=?`,
        [batch_id, medicine_id],
      );
      return res
        .status(200)
        .json({ msg: "Medicine Deleted Successfully", data: result });
    } catch (err) {
      console.error("deleteMedicine error:", err);
      return res.status(500).json({ msg: "server error", data: err });
    }
  },

  /* ---------------------- VENDOR SPECIFIC CRUD ---------------------- */

  getVendorMedicines: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;
      const [rows] = await db.query(
        "SELECT * FROM vendor_medicine_table WHERE user_id = ?",
        [vendor_user_id],
      );
      res.json(rows);
    } catch (err) {
      console.error("getVendorMedicines error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
getVendorMedicineById:async(req,res)=>{
  try {
    const vendor_user_id = req.user.id;
    const { id } = req.params;
    const [[rows]] = await db.query(
      `SELECT * FROM vendor_medicine_table WHERE user_id = ? AND id = ?`,
      [vendor_user_id, id],
    );
    res.json({msg:"Vendor Medicine Fetched Successfully",data:rows});
  } catch (err) {
    console.error("getVendorMedicineById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
},
  addVendorMedicine: async (req, res) => {
    try {
      const vendor_user_id = req.user.id;

      // ✅ get bucket_id from params
      const { bucket_id } = req.params;

      const {
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

      if (!name) {
        return res.status(400).json({
          message: "Medicine name is required",
        });
      }

      const filesArray = Array.isArray(req.files) ? req.files : [];
      const imageUrls = filesArray.map((f) => f.path);

      const prescriptionValue =
        prescription_required === true ||
        prescription_required === 1 ||
        prescription_required === "1" ||
        prescription_required === "true"
          ? 1
          : 0;

      const sql = `
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
      VALUES (?, 'vendor', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'vendor', ?)
    `;
      const selling_prices = best_price - (best_price * discount_percent) / 100;
      const values = [
        vendor_user_id,
        name,
        salt_composition || null,
        manufacturers || null,
        medicine_type || null,
        packaging || null,
        packaging_typ || null,
        mrp || 0,
        cost_price || 0,
        discount_percent || 0,
        selling_prices || 0,
        offers_percent || 0,
        prescriptionValue,
        storage || null,
        country_of_origin || null,
        manufacture_address || null,
        best_price || 0,
        brought || null,
        imageUrls.length ? JSON.stringify(imageUrls) : null,
        bucket_id || null,
      ];

      const [result] = await db.query(sql, values);

      res.status(201).json({
        message: "Medicine Added Successfully",
        id: result.insertId,
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
      const { id } = req.params;
      const vendor_user_id = req.user.id;
      const {
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
        bucket_id,
      } = req.body;

      let updateSql = `
        UPDATE vendor_medicine_table SET 
          name=?, salt_composition=?, manufacturers=?, medicine_type=?,
          packaging=?, packaging_typ=?, mrp=?, cost_price=?,
          discount_percent=?, selling_price=?, offers_percent=?,
          prescription_required=?, storage=?, country_of_origin=?,
          manufacture_address=?, best_price=?, brought=?, bucket_id=?
      `;
      let params = [
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
        bucket_id,
      ];

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const imageUrls = req.files.map((file) => file.path);
        updateSql += ", image=?";
        params.push(JSON.stringify(imageUrls));
      }

      updateSql += " WHERE id=? AND user_id=?";
      params.push(id, vendor_user_id);

      await db.query(updateSql, params);
      res.json({ message: "Medicine Updated Successfully" });
    } catch (err) {
      console.error("updateVendorMedicine error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  deleteVendorMedicine: async (req, res) => {
    try {
      const { id } = req.params;
      const vendor_user_id = req.user.id;

      await db.query(
        "DELETE FROM vendor_medicine_table WHERE id = ? AND user_id = ?",
        [id, vendor_user_id],
      );
      res.json({ message: "Medicine Deleted Successfully" });
    } catch (err) {
      console.error("deleteVendorMedicine error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
};

module.exports = medicineControllers;
