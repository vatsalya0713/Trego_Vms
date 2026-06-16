const db = require("../db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const client = require("../Services/twilio.js");
const generateVendorId = require("../utils/generateId.js");

const addVendor = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    if (
      !req.user ||
      (req.user.role !== "super_admin" && req.user.role !== "admin")
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!name || !username || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const [existing] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, username, password, role, created_by, activeStatus)
      VALUES (?, ?, ?, 'vendor', ?, 'Active')
    `;

    const [result] = await db.query(sql, [
      name,
      username,
      hashedPassword,
      req.user.role,
    ]);
    const insertedId = result.insertId;

    const [vendorData] = await db.query(
      "SELECT id, name, username FROM users WHERE id = ?",
      [insertedId],
    );

    return res.status(201).json({
      message: "Vendor created successfully",
      vendor: vendorData[0],
    });
  } catch (err) {
    console.error("addVendor error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
//Vendor SignUp
// Vendor SignUp - Send OTP
const vendorSign = async (req, res) => {
  try {
    const { username, email, mobileNo, password, confirmPassword } = req.body;

    if (!username || !email || !mobileNo || !password || !confirmPassword) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Password not matched" });
    }

    // 🧹 remove old OTP records for this mobile
    // await db.query(
    //   "DELETE FROM vendor_signup WHERE mobileNo = ?",
    //   [mobileNo]
    // );
    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      `INSERT INTO vendor_signup
       (username, email, mobileNo, password, otp, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, mobileNo, hashedPassword, otp, expiresAt],
    );

    console.log("🔐 OTP GENERATED:", otp);

    // ⚠️ TEMP RESPONSE (NO TWILIO)
    return res.status(200).json({
      msg: "OTP generated successfully (TEMP MODE)",
      otp, // 👈 send OTP in response
    });
  } catch (err) {
    console.error("vendorSign error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

//otp verify
// Verify OTP & Create Vendor User
const verifyOTP = async (req, res) => {
  try {
    const { mobileNo, otp } = req.body;

    const [[record]] = await db.query(
      `SELECT * FROM vendor_signup
       WHERE mobileNo=?
       ORDER BY expires_at DESC
       LIMIT 1`,
      [mobileNo],
    );

    if (!record) {
      return res.status(400).json({ msg: "OTP not found" });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // Generate token so the user can immediately call protected routes (like business details)
    const token = generateToken(record.id, "vendor");

    return res.status(200).json({
      msg: "OTP verified. Vendor account created successfully",
      token,
      user: {
        id: record.id,
        username: record.username,
        role: "vendor",
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};

//resend -verify otp
// RESEND OTP CONTROLLER
const resendOtp = async (req, res) => {
  try {
    const { mobileNo } = req.body;

    if (!mobileNo) {
      return res.status(400).json({ msg: "Mobile number is required" });
    }

    // find latest signup record
    const [[record]] = await db.query(
      `SELECT * FROM vendor_signup
       WHERE mobileNo = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [mobileNo],
    );

    if (!record) {
      return res.status(400).json({ msg: "No signup found for this number" });
    }

    // generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await db.query(
      `UPDATE vendor_signup
       SET otp = ?, expires_at = ?
       WHERE id = ?`,
      [String(newOtp), expiresAt, record.id],
    );

    console.log("🔁 RESENT OTP:", newOtp);

    // TEMP MODE: return OTP
    return res.status(200).json({
      msg: "OTP resent successfully",
      otp: newOtp,
    });
  } catch (err) {
    console.error("resendOtp error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

//forgetpassword

// POST /vendor/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ msg: "Email is required" });

  const [user] = await db.query("SELECT * FROM vendor_signup WHERE email = ?", [
    email,
  ]);

  if (user.length === 0) {
    return res
      .status(404)
      .json({ msg: "Email not found. Please signup first." });
  }

  // Success → Allow reset page
  return res
    .status(200)
    .json({ msg: "Email verified. Go to reset page", email });
};

// POST /vendor/reset-password
const resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword)
    return res.status(400).json({ msg: "All fields are required" });

  if (newPassword !== confirmPassword)
    return res.status(400).json({ msg: "Passwords do not match" });

  const hashed = await bcrypt.hash(newPassword, 10);

  await db.query("UPDATE vendor_signup SET password=? WHERE email=?", [
    hashed,
    email,
  ]);

  return res.status(200).json({ msg: "Password Updated Successfully!" });
};

// Vendor Login
// Vendor Login (FIXED)
const vendorlogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    /* 1️⃣ Authenticate vendor */
    const [rows] = await db.query(
      "SELECT *, id as id FROM vendor_signup WHERE username = ?",
      [username],
    );

    if (!rows.length) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const user = rows[0];

    if (user.role !== "vendor") {
      return res.status(403).json({ message: "Not authorized as vendor" });
    }

    let isMatch = false;
    if (user.password && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$"))) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password);
    }
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const [[application]] = await db.query(
      `
      SELECT 
        v.applicant_id,
        s.status
      FROM vendor_informations v
      LEFT JOIN vendor_application_status s
        ON s.applicant_id = v.applicant_id
      WHERE v.vendor_user_id = ?
      ORDER BY v.applicant_id DESC
      LIMIT 1
      `,
      [user.id],
    );

    const token = generateToken(user.id, user.role);

    return res.json({
      token,
      user,
      applicationStatus: application?.status || "DRAFT",
      applicant_id: application?.applicant_id || null,
    });
  } catch (err) {
    console.error("Vendor login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get All Vendors
const getVendors = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, username, role, activeStatus FROM users WHERE role = 'vendor'",
    );
    res.json(rows);
  } catch (err) {
    console.error("getVendors error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get Single Vendor
const getVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM users WHERE id=? AND role = 'vendor'",
      [id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Vendor not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("getVendor error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update Vendor
const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ msg: "Vendor not found" });

    let hashedPwd = rows[0].password;
    if (password) hashedPwd = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE users SET name = ?, username = ?, password = ? WHERE id = ?",
      [name, username, hashedPwd, id],
    );

    res.status(200).json({ msg: "Vendor details updated successfully" });
  } catch (err) {
    console.error("updateVendor error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ✅ Update Vendor Status (Active / Blocked)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT activeStatus FROM users WHERE id = ?",
      [id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Vendor not found" });

    const current = rows[0].activeStatus;
    const newStatus = current === "Active" ? "Blocked" : "Active";

    await db.query("UPDATE users SET activeStatus = ? WHERE id = ?", [
      newStatus,
      id,
    ]);
    await db.query("UPDATE vendors_info SET active = ? WHERE user_id = ?", [
      newStatus === "Active" ? 1 : 0,
      id,
    ]);

    res.json({ message: `Vendor status changed to ${newStatus}, newStatus ` });
  } catch (err) {
    console.error("updateStatus error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add Vendor Info
const saveVendorBusinessDetails = async (req, res) => {
  const user_id = req.user.id;

  try {
    const {
      name,
      category,
      category_type,
      address,
      druglicense,
      gstin,
      mobile,
      email,
      logo,
      website,
      delivery_time_minutes,
      delivery_range_km,
      lat,
      lng,
      user_discount = 0,
      company_discount = 0,
      vendor_offer_user = 0,
      company_offer_user = 0,
      offer_start_date,
      offer_end_date,
      is_verified = false,
      active = false,
      verified_by,
    } = req.body;

    const pan_card = req.files?.pan_card?.[0]?.path || null;

    const bank_passbook = req.files?.bank_passbook?.[0]?.path || null;

    const cancelled_cheque = req.files?.cancelled_cheque?.[0]?.path || null;

    const allowedCategories = ["pharmacy", "pathology", "surgery"];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid category. Allowed: pharmacy, pathology, surgery",
      });
    }

    if (!category || !category_type) {
      return res.status(400).json({
        message: "Category and category type required",
      });
    }

    const activeBool =
      active === true || active === 1 || active === "1" || active === "true";

    const verifiedBool =
      is_verified === true ||
      is_verified === 1 ||
      is_verified === "1" ||
      is_verified === "true";

    let vendor_id = null;
    if (activeBool || verifiedBool) {
      vendor_id = generateVendorId();
    }

    /* =========================
       INSERT QUERY
    ========================== */
    const sql = `
      INSERT INTO vendor_informations (
        vendor_user_id,
        vendor_id,
        ref_name,
        category,
        category_type,
        address,
        druglicense,
        gstin,
        mobile,
        email,
        logo,
        website,
        delivery_time_minutes,
        delivery_range_km,
        lat,
        lng,
        user_discount,
        company_discount,
        vendor_offer_user,
        company_offer_user,
        offer_start_date,
        offer_end_date,
        verified_by,
        is_verified,
        active,
        pan_card,
        bank_passbook,
        cancelled_cheque
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const values = [
      user_id ?? null,
      vendor_id ?? null,
      name ?? null,
      category ?? null,
      category_type ?? null,
      address ?? null,
      druglicense ?? null,
      gstin ?? null,
      mobile ?? null,
      email ?? null,
      logo ?? null,
      website ?? null,
      delivery_time_minutes ?? null,
      delivery_range_km ?? null,
      lat ?? null,
      lng ?? null,
      user_discount ?? 0,
      company_discount ?? 0,
      vendor_offer_user ?? 0,
      company_offer_user ?? 0,
      offer_start_date ?? null,
      offer_end_date ?? null,
      verified_by ?? null,
      verifiedBool ? 1 : 0,
      activeBool ? 1 : 0,
      pan_card ?? null,
      bank_passbook ?? null,
      cancelled_cheque ?? null,
    ];

    const [result] = await db.execute(sql, values);
    const applicant_id = result.insertId;

    await db.execute(
      `INSERT INTO vendor_application_status (applicant_id, status, editable)
       VALUES (?, 'DRAFT', true)`,
      [applicant_id],
    );

    return res.status(201).json({
      success: true,
      message: "Vendor information saved successfully",
      data: {
        applicant_id,
        vendor_id,
      },
    });
  } catch (err) {
    console.error("Vendor Save Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//saving personal details
const saveVendorPersonalDetails = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [[row]] = await db.execute(
      `SELECT applicant_id
       FROM vendor_informations
       WHERE vendor_user_id = ?
       ORDER BY applicant_id DESC
       LIMIT 1`,
      [user_id],
    );

    if (!row) {
      return res.status(400).json({
        message: "Business details not saved yet",
      });
    }

    const applicant_id = row.applicant_id;

    const { ownerName, age, gender, contactNo, address } = req.body;

    const profile_image = req.files?.profile_image?.[0]?.path || null;

    const aadhaar_card = req.files?.aadhaar_card?.[0]?.path || null;

    const pan_card = req.files?.pan_card?.[0]?.path || null;

    if (!ownerName || !age || !gender || !contactNo || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!profile_image) {
      return res.status(400).json({
        message: "Profile picture is required",
      });
    }

    if (!aadhaar_card || !pan_card) {
      return res.status(400).json({
        message: "Aadhaar Card and PAN Card are required",
      });
    }

    await db.execute(
      `
      INSERT INTO vendor_personal_details (
        applicant_id,
        owner_name,
        age,
        gender,
        contact_no,
        address,
        profile_image,
        aadhaar_card,
        pan_card
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        applicant_id ?? null,
        ownerName ?? null,
        age ?? null,
        gender ?? null,
        contactNo ?? null,
        address ?? null,
        profile_image ?? null,
        aadhaar_card ?? null,
        pan_card ?? null,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Vendor personal details saved successfully",
      applicant_id,
    });
  } catch (err) {
    console.error("Vendor Personal Save Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAdminVendors = async (req, res) => {
  try {
    const { status } = req.query;

    let statusFilter = "PENDING_APPROVAL";

    if (status === "APPROVED") statusFilter = "APPROVED";
    if (status === "SUPER_ADMIN_REVIEW") statusFilter = "SUPER_ADMIN_REVIEW";

    const [rows] = await db.execute(
      `
    SELECT 
      v.applicant_id,
      v.ref_name AS username,
      v.email,
      v.mobile,
      s.status,
      s.admin_feedback
    FROM vendor_informations v
    JOIN vendor_application_status s
      ON v.applicant_id = s.applicant_id
    WHERE s.status = ?
    ORDER BY v.applicant_id DESC
`,
      [statusFilter],
    );

    res.json(rows);
  } catch (err) {
    console.error("Admin Vendor Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const adminVendorAction = async (req, res) => {
  try {
    const { applicant_id, action } = req.body;

    if (!applicant_id || !action) {
      return res.status(400).json({ message: "Invalid request" });
    }

    /* =========================
       ACTION HANDLING
    ========================== */

    if (action === "REJECT") {
      await db.execute(
        `UPDATE vendor_application_status
         SET status='REJECTED', editable=false
         WHERE applicant_id=?`,
        [applicant_id],
      );
    }

    if (action === "VERIFY") {
      const vendor_id = generateVendorId();

      await db.execute(
        `UPDATE vendor_informations
         SET vendor_id=?, is_verified=1, active=1
         WHERE applicant_id=?`,
        [vendor_id, applicant_id],
      );

      await db.execute(
        `UPDATE vendor_application_status
         SET status='APPROVED'
         WHERE applicant_id=?`,
        [applicant_id],
      );
    }

    if (action === "SEND_SUPER") {
      const { feedback } = req.body;

      await db.execute(
        `UPDATE vendor_application_status
     SET status='SUPER_ADMIN_REVIEW',
         admin_feedback = ?
     WHERE applicant_id=?`,
        [feedback || null, applicant_id],
      );
    }

    if (action === "TOGGLE_ACTIVE") {
      await db.execute(
        `UPDATE vendor_informations
         SET active = IF(active=1,0,1)
         WHERE applicant_id=?`,
        [applicant_id],
      );
    }

    if (action === "DELETE_VENDOR") {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        // 1. Get vendor details
        const [[vendor]] = await conn.execute(
          `SELECT vendor_user_id, vendor_id, email, mobile 
           FROM vendor_informations 
           WHERE applicant_id = ?`,
          [applicant_id],
        );

        if (vendor) {
          const { vendor_user_id, vendor_id: vendor_id_val, email, mobile } = vendor;

          // 2. Delete associated medicines
          if (vendor_id_val) {
            // Break foreign key constraint in order_items
            await conn.execute(
              `UPDATE order_items 
               SET vendor_medicine_id = NULL 
               WHERE vendor_medicine_id IN (
                 SELECT vendor_medicine_id FROM vendor_medicine WHERE vendor_id = ?
               )`,
              [vendor_id_val],
            );

            // Break circular dependency link
            await conn.execute(
              "UPDATE vendor_medicine SET price_id = NULL WHERE vendor_id = ?",
              [vendor_id_val],
            );

            // Delete from vendor_discounts_offers
            await conn.execute(
              `DELETE FROM vendor_discounts_offers 
               WHERE vendor_medicine_id IN (
                 SELECT vendor_medicine_id FROM vendor_medicine WHERE vendor_id = ?
               )`,
              [vendor_id_val],
            );

            // Delete from vendor_medicine_information
            await conn.execute(
              `DELETE FROM vendor_medicine_information 
               WHERE vendor_medicine_id IN (
                 SELECT vendor_medicine_id FROM vendor_medicine WHERE vendor_id = ?
               )`,
              [vendor_id_val],
            );

            // Delete from vendor_medicine_price
            await conn.execute(
              "DELETE FROM vendor_medicine_price WHERE vendor_id = ?",
              [vendor_id_val],
            );

            // Delete from vendor_medicine
            await conn.execute(
              "DELETE FROM vendor_medicine WHERE vendor_id = ?",
              [vendor_id_val],
            );
          }

          // 3. Delete from bucket_medicine_map, vendors_information, and vendors
          if (vendor_user_id) {
            // Break foreign key constraint in stocks
            await conn.execute(
              "UPDATE stocks SET vendor_id = NULL WHERE vendor_id = ?",
              [vendor_user_id],
            );

            // Clean up orders table references
            await conn.execute(
              "UPDATE orders SET vendor_id = NULL WHERE vendor_id = ?",
              [vendor_user_id],
            );

            await conn.execute(
              "DELETE FROM bucket_medicine_map WHERE vendor_user_id = ?",
              [vendor_user_id],
            );

            await conn.execute(
              "DELETE FROM vendors_information WHERE vendor_user_id = ?",
              [vendor_user_id],
            );

            await conn.execute(
              "DELETE FROM vendors WHERE id = ?",
              [vendor_user_id],
            );
          }

          // 4. Delete vendor details
          await conn.execute(
            "DELETE FROM vendor_personal_details WHERE applicant_id = ?",
            [applicant_id],
          );

          await conn.execute(
            "DELETE FROM vendor_application_status WHERE applicant_id = ?",
            [applicant_id],
          );

          await conn.execute(
            "DELETE FROM vendor_informations WHERE applicant_id = ?",
            [applicant_id],
          );

          // 5. Delete user accounts and credentials permanently
          if (vendor_user_id) {
            await conn.execute(
              "DELETE FROM users WHERE id = ? AND role = 'vendor'",
              [vendor_user_id],
            );

            await conn.execute(
              "DELETE FROM vendor_signup WHERE id = ?",
              [vendor_user_id],
            );
          }

          if (email) {
            await conn.execute(
              "DELETE FROM vendor_signup WHERE email = ?",
              [email],
            );
          }

          if (mobile) {
            await conn.execute(
              "DELETE FROM vendor_signup WHERE mobileNo = ?",
              [mobile],
            );
          }
        } else {
          // Fallback: if vendor record not fully found in vendor_informations,
          // still try to delete what matches this applicant_id
          await conn.execute(
            "DELETE FROM vendor_personal_details WHERE applicant_id = ?",
            [applicant_id],
          );

          await conn.execute(
            "DELETE FROM vendor_application_status WHERE applicant_id = ?",
            [applicant_id],
          );

          await conn.execute(
            "DELETE FROM vendor_informations WHERE applicant_id = ?",
            [applicant_id],
          );
        }

        await conn.commit();
        res.json({ success: true, message: "Vendor and associated medicines deleted successfully" });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
      return;
    }

    res.json({ success: true, message: "Action applied successfully" });
  } catch (err) {
    console.error("Admin Vendor Action Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get All Vendor Info (Joined)
const getVendorInfo = async (req, res) => {
  try {
    const sql = `
      SELECT u.id AS user_id, u.name AS user_name, u.username, u.role, v.*
      FROM vendors_info v
      JOIN users u ON v.user_id = u.id
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("getVendorInfo error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//Get vendor application
const getVendorApplication = async (req, res) => {
  const { applicant_id } = req.params;

  const [data] = await db.execute(
    `
    SELECT
      v.applicant_id,
      v.ref_name AS name,
      v.category,
      v.category_type,
      v.website,
      v.logo,
      v.address,
      v.druglicense,
      v.gstin,
      v.mobile,
      v.email,
      v.delivery_time_minutes,
      v.delivery_range_km,
      v.user_discount,
      v.company_discount,
      v.vendor_offer_user,
      v.company_offer_user,
      v.offer_start_date,
      v.offer_end_date,
      v.active,
      v.is_verified,
      v.verified_by,
      v.pan_card,
      v.bank_passbook,
      v.cancelled_cheque,

      p.owner_name,
      p.age,
      p.gender,
      p.contact_no,
      p.address AS personal_address,
      p.aadhaar_card,
      p.pan_card AS personal_pan,

      s.status,
      s.editable

    FROM vendor_informations v
    LEFT JOIN vendor_personal_details p
      ON v.applicant_id = p.applicant_id
    LEFT JOIN vendor_application_status s
      ON v.applicant_id = s.applicant_id
    WHERE v.applicant_id = ?
  `,
    [applicant_id],
  );

  if (!data.length) {
    return res.status(404).json({ message: "Application not found" });
  }

  res.json(data[0]);
};

//update vendor business detail
const formatDate = (value) => {
  if (!value) return null;
  return value.toString().slice(0, 10); // YYYY-MM-DD
};

const updateVendorBusinessDetails = async (req, res) => {
  try {
    const { applicant_id } = req.body;

    if (!applicant_id) {
      return res.status(400).json({ message: "Applicant ID missing" });
    }

    const [[status]] = await db.execute(
      "SELECT editable FROM vendor_application_status WHERE applicant_id = ?",
      [applicant_id],
    );

    if (!status || !status.editable) {
      return res.status(403).json({ message: "Editing not allowed" });
    }

    const {
      ref_name,
      category,
      category_type,
      address,
      website,
      logo,
      druglicense,
      gstin,
      mobile,
      email,
      delivery_time_minutes,
      delivery_range_km,
      lat,
      lng,
      user_discount,
      company_discount,
      vendor_offer_user,
      company_offer_user,
      offer_start_date,
      offer_end_date,
    } = req.body;

    if (category && !["pharmacy", "pathology", "surgery"].includes(category)) {
      return res.status(400).json({
        message: "Invalid category value",
      });
    }

    await db.execute(
      `
      UPDATE vendor_informations
      SET
        ref_name = ?,
        category = ?,
        category_type = ?,
        address = ?,
        website = ?,
        logo = ?,
        druglicense = ?,
        gstin = ?,
        mobile = ?,
        email = ?,
        delivery_time_minutes = ?,
        delivery_range_km = ?,
        lat = ?,
        lng = ?,
        user_discount = ?,
        company_discount = ?,
        vendor_offer_user = ?,
        company_offer_user = ?,
        offer_start_date = ?,
        offer_end_date = ?
      WHERE applicant_id = ?
      `,
      [
        ref_name ?? null,
        category ?? null,
        category_type ?? null,
        address ?? null,
        website ?? null,
        logo ?? null,
        druglicense ?? null,
        gstin ?? null,
        mobile ?? null,
        email ?? null,
        delivery_time_minutes ?? null,
        delivery_range_km ?? null,
        lat ?? null,
        lng ?? null,
        user_discount ?? 0,
        company_discount ?? 0,
        vendor_offer_user ?? 0,
        company_offer_user ?? 0,
        formatDate(offer_start_date),
        formatDate(offer_end_date),
        applicant_id ?? null,
      ],
    );

    return res.json({
      success: true,
      message: "Business details updated",
    });
  } catch (err) {
    console.error("Update Business Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

//update vendor personal detail
const updateVendorPersonalDetails = async (req, res) => {
  try {
    const { applicant_id } = req.body;

    if (!applicant_id) {
      return res.status(400).json({ message: "Applicant ID missing" });
    }

    const [[status]] = await db.execute(
      "SELECT editable FROM vendor_application_status WHERE applicant_id = ?",
      [applicant_id],
    );

    if (!status || !status.editable) {
      return res.status(403).json({ message: "Editing not allowed" });
    }

    const { ownerName, age, gender, contactNo, address } = req.body;

    await db.execute(
      `UPDATE vendor_personal_details
       SET owner_name = ?, age = ?, gender = ?, contact_no = ?, address = ?
       WHERE applicant_id = ?`,
      [
        ownerName ?? null,
        age ?? null,
        gender ?? null,
        contactNo ?? null,
        address ?? null,
        applicant_id ?? null,
      ],
    );

    res.json({ success: true, message: "Personal details updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
//submit vendor application
const submitVendorApplication = async (req, res) => {
  try {
    const { applicant_id } = req.body;

    if (!applicant_id) {
      return res.status(400).json({ message: "Applicant ID required" });
    }

    await db.execute(
      `UPDATE vendor_application_status
       SET editable = false,
           status = 'PENDING_APPROVAL',
           submitted_at = NOW()
       WHERE applicant_id = ?`,
      [applicant_id],
    );

    return res.json({
      success: true,
      message:
        "Your request has been generated successfully. Please wait for approval.",
    });
  } catch (err) {
    console.error("Submit error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
//getvendorProfile
//  Get Logged-in Vendor Profile (SELF)
const getMyVendorProfile = async (req, res) => {
  try {
    const user_id = req.user.id;

    // get latest applicant_id
    const [[row]] = await db.execute(
      `
      SELECT applicant_id
      FROM vendor_informations
      WHERE vendor_user_id = ?
      ORDER BY applicant_id DESC
      LIMIT 1
      `,
      [user_id],
    );

    if (!row) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    const applicant_id = row.applicant_id;

    const [data] = await db.execute(
      `
      SELECT
        v.applicant_id,
        v.vendor_id,
        v.ref_name,
        v.category,
        v.category_type,
        v.website,
        v.logo,
        v.address,
        v.druglicense,
        v.gstin,
        v.mobile,
        v.email,
        v.delivery_time_minutes,
        v.delivery_range_km,
        v.user_discount,
        v.company_discount,
        v.vendor_offer_user,
        v.company_offer_user,
        v.offer_start_date,
        v.offer_end_date,
        v.active,
        v.is_verified,

        p.owner_name,
        p.age,
        p.gender,
        p.contact_no,
        p.address AS personal_address,

        s.status,
        s.editable
      FROM vendor_informations v
      LEFT JOIN vendor_personal_details p
        ON v.applicant_id = p.applicant_id
      LEFT JOIN vendor_application_status s
        ON v.applicant_id = s.applicant_id
      WHERE v.applicant_id = ?
      `,
      [applicant_id],
    );

    res.json(data[0]);
  } catch (err) {
    console.error("getMyVendorProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Vendor Info
const updateVendorInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category,
      address,
      druglicense,
      gstin,
      mobile,
      email,
      logo,
      website,
      delivery_time_minutes,
      delivery_range_km,
      lat,
      lng,
      user_discount,
      company_discount,
      vendor_offer_user,
      company_offer_user,
      offer_start_date,
      offer_end_date,
      is_verified,
      active,
    } = req.body;

    const sql = `
      UPDATE vendors_info
      SET category=?, address=?, druglicense=?, gstin=?, mobile=?, email=?, logo=?, website=?,
          delivery_time_minutes=?, delivery_range_km=?, lat=?, lng=?,
          user_discount=?, company_discount=?, vendor_offer_user=?, company_offer_user=?,
          offer_start_date=?, offer_end_date=?, is_verified=?, active=?, updated_at=NOW()
      WHERE user_id=?
    `;

    const [result] = await db.query(sql, [
      category,
      address,
      druglicense,
      gstin,
      mobile,
      email,
      logo,
      website,
      delivery_time_minutes,
      delivery_range_km,
      lat,
      lng,
      user_discount,
      company_discount,
      vendor_offer_user,
      company_offer_user,
      offer_start_date,
      offer_end_date,
      is_verified ? 1 : 0,
      typeof active === "boolean" ? (active ? 1 : 0) : 1,
      id,
    ]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Vendor info not found" });

    res.json({ message: "Vendor info updated successfully" });
  } catch (err) {
    console.error("updateVendorInfo error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const deleteVendorInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM vendors_info WHERE user_id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Vendors Info not found" });
    }

    res.json({ message: "Vendors Info deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", msg: err.res[0] });
  }
};

module.exports = {
  addVendor,
  vendorlogin,
  getVendors,
  getVendor,
  updateVendor,
  updateStatus,
  saveVendorPersonalDetails,
  getVendorInfo,
  updateVendorInfo,
  deleteVendorInfo,
  vendorSign,
  verifyOTP,
  forgotPassword,
  resetPassword,
  saveVendorBusinessDetails,
  submitVendorApplication,
  getVendorApplication,
  updateVendorBusinessDetails,
  updateVendorPersonalDetails,
  adminVendorAction,
  getAdminVendors,
  resendOtp,
  getMyVendorProfile,
};
