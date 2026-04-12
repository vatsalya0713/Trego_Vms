const db = require("../db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

/* =========================================================
   RIDER SIGNUP (SEND OTP)
========================================================= */

const riderSignup = async (req, res) => {
  try {
    const { username, email, mobileNo, password, confirmPassword } = req.body;

    if (!username || !email || !mobileNo || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check existing mobile/email
    // const [existing] = await db.query(
    //   "SELECT * FROM rider_signup WHERE mobileNo = ? OR email = ?",
    //   [mobileNo, email]
    // );

    // if (existing.length > 0) {
    //   return res.status(400).json({ message: "Rider already exists" });
    // }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await db.query(
      `INSERT INTO rider_signup
       (username, email, mobileNo, password, role, verified, otp, expires_at)
       VALUES (?, ?, ?, ?, 'rider', 0, ?, ?)`,
      [username, email, mobileNo, hashedPassword, otp, expiresAt]
    );

    console.log("📩 RIDER OTP:", otp);

    return res.status(200).json({
      message: "OTP sent successfully",
      otp:otp      // remove in production
    });

  } catch (err) {
    console.error("Rider Signup Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   VERIFY OTP
========================================================= */

const verifyRiderOTP = async (req, res) => {
  try {
    const { mobileNo, otp } = req.body;

    const [[rider]] = await db.query(
      `SELECT * FROM rider_signup
       WHERE mobileNo = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [mobileNo]
    );

    if (!rider) {
      return res.status(400).json({ message: "Rider not found" });
    }

    if (new Date() > new Date(rider.expires_at)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (String(rider.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await db.query(
      "UPDATE rider_signup SET verified = 1, otp = NULL WHERE user_id = ?",
      [rider.user_id]
    );

    return res.status(200).json({
      message: "Rider verified successfully"
    });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



const resendRiderOTP = async (req, res) => {
  try {
    const { mobileNo } = req.body;

    const [[rider]] = await db.query(
      "SELECT * FROM rider_signup WHERE mobileNo = ?",
      [mobileNo]
    );

    if (!rider) {
      return res.status(400).json({ message: "Rider not found" });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      "UPDATE rider_signup SET otp = ?, expires_at = ? WHERE user_id = ?",
      [newOtp, expiresAt, rider.user_id]
    );

    console.log("🔁 RESENT RIDER OTP:", newOtp);

    return res.status(200).json({
      message: "OTP resent successfully",
      otp: newOtp // remove in production
    });

  } catch (err) {
    console.error("Resend OTP Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const riderLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM rider_signup WHERE username = ?",
      [username]
    );

    if (!rows.length) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const rider = rows[0];

    const isMatch = await bcrypt.compare(password, rider.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔥 Check if application status exists
    const [statusRows] = await db.query(
      "SELECT status FROM rider_application_status WHERE applicant_id = ?",
      [rider.user_id]
    );

    let applicationStatus;

    if (statusRows.length === 0) {
      // ✅ First login → create DRAFT automatically
      await db.query(
        `INSERT INTO rider_application_status 
         (applicant_id, status, editable)
         VALUES (?, 'DRAFT', 1)`,
        [rider.user_id]
      );

      applicationStatus = "DRAFT";
    } else {
      applicationStatus = statusRows[0].status;
    }

    const token = generateToken(rider.user_id, rider.role);

    return res.status(200).json({
      token,
      applicant_id: rider.user_id,
      applicationStatus
    });

  } catch (err) {
    console.error("Rider Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


const forgotRiderPassword = async (req, res) => {
  const { email } = req.body;

  const [rider] = await db.query(
    "SELECT * FROM rider_signup WHERE email = ?",
    [email]
  );

  if (!rider.length) {
    return res.status(404).json({ message: "Email not found" });
  }

  return res.status(200).json({
    message: "Email verified. Proceed to reset password",
    email
  });
};


const resetRiderPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await db.query(
    "UPDATE rider_signup SET password = ? WHERE email = ?",
    [hashed, email]
  );

  return res.status(200).json({
    message: "Password updated successfully"
  });
};

/* =====================================================
   1️⃣ Get Rider Application Status
   (Used after login or on details page)
===================================================== */

const getRiderApplicationStatus = async (req, res) => {
  try {
    const { applicant_id } = req.params;

    const [rows] = await db.query(
      `SELECT status, editable, submitted_at, approved_at
       FROM rider_application_status
       WHERE applicant_id = ?`,
      [applicant_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("Get Rider Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   2️⃣ Submit For Approval
   (Rider clicks submit button)
===================================================== */

const submitRiderForApproval = async (req, res) => {
  try {
    const { applicant_id } = req.body;

    if (!applicant_id) {
      return res.status(400).json({ message: "Applicant ID required" });
    }

    const [existing] = await db.query(
      "SELECT id FROM rider_application_status WHERE applicant_id = ?",
      [applicant_id]
    );

    if (existing.length === 0) {
      // Insert if not exists
      await db.query(
        `INSERT INTO rider_application_status
         (applicant_id, status, editable, submitted_at)
         VALUES (?, 'PENDING_APPROVAL', 0, NOW())`,
        [applicant_id]
      );
    } else {
      // Update if exists
      await db.query(
        `UPDATE rider_application_status
         SET status='PENDING_APPROVAL',
             editable=0,
             submitted_at=NOW()
         WHERE applicant_id=?`,
        [applicant_id]
      );
    }

    res.json({
      success: true,
      message: "Application submitted successfully"
    });

  } catch (error) {
    console.error("Submit Rider Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   3️⃣ Vendor Approves Rider
===================================================== */

const approveRider = async (req, res) => {
  try {
    const { applicant_id } = req.body;

    await db.query(
      `UPDATE rider_application_status
       SET status = 'APPROVED',
           approved_at = NOW()
       WHERE applicant_id = ?`,
      [applicant_id]
    );
    res.json({
      success: true,
      message: "Rider approved successfully"
    });

  } catch (error) {
    console.error("Approve Rider Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   4️⃣ Vendor Rejects Rider
===================================================== */

const rejectRider = async (req, res) => {
  try {
    const { applicant_id } = req.body;

    await db.query(
      `UPDATE rider_application_status
       SET status = 'REJECTED'
       WHERE applicant_id = ?`,
      [applicant_id]
    );
    res.json({
      success: true,
      message: "Rider rejected"
    });

  } catch (error) {
    console.error("Reject Rider Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   5️⃣ Get Riders By Status (Vendor List Page)
===================================================== */

const getRidersByStatus = async (req, res) => {
  const { status } = req.query;

  const [rows] = await db.query(
    `SELECT r.user_id, r.username, r.mobileNo,
            s.status, s.submitted_at
     FROM rider_signup r
     JOIN rider_application_status s
       ON r.user_id = s.applicant_id
     WHERE s.status = ?`,
    [status]
  );

  res.json(rows);
};

const saveRiderDetails = async (req, res) => {
  try {
    const rider_applicant_id = req.body.applicant_id; // 🔐 secure (no need from body)

    const {
      full_name,
      age,
      gender,
      mobile,
      location,
      vehicle_number,
      driving_license_number
    } = req.body;

    const clean = (value) => (value && value !== "" ? value : null);

    // 📸 Extract file paths (if uploaded)
    const photo = req.files?.photo?.[0]?.path || null;
    const vehicle_photo = req.files?.vehicle_photo?.[0]?.path || null;
    const driving_license_photo =
      req.files?.driving_license_photo?.[0]?.path || null;
    const aadhar_card = req.files?.aadhar_card?.[0]?.path || null;
    const pancard = req.files?.pancard?.[0]?.path || null;

    // Check if record exists
    const [existing] = await db.query(
      "SELECT id FROM rider_details WHERE rider_applicant_id=?",
      [rider_applicant_id]
    );

    if (existing.length > 0) {
      // UPDATE
      await db.query(
        `UPDATE rider_details SET
          full_name=?,
          age=?,
          gender=?,
          mobile=?,
          location=?,
          photo=COALESCE(?, photo),
          vehicle_number=?,
          driving_license_number=?,
          vehicle_photo=COALESCE(?, vehicle_photo),
          driving_license_photo=COALESCE(?, driving_license_photo),
          aadhar_card=COALESCE(?, aadhar_card),
          pancard=COALESCE(?, pancard)
         WHERE rider_applicant_id=?`,
        [
          clean(full_name),
          clean(age),
          clean(gender),
          clean(mobile),
          clean(location),
          photo,
          clean(vehicle_number),
          clean(driving_license_number),
          vehicle_photo,
          driving_license_photo,
          aadhar_card,
          pancard,
          rider_applicant_id
        ]
      );
    } else {
      // INSERT
      await db.query(
        `INSERT INTO rider_details (
          rider_applicant_id,
          full_name,
          age,
          gender,
          mobile,
          location,
          photo,
          vehicle_number,
          driving_license_number,
          vehicle_photo,
          driving_license_photo,
          aadhar_card,
          pancard
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          rider_applicant_id,
          clean(full_name),
          clean(age),
          clean(gender),
          clean(mobile),
          clean(location),
          photo,
          clean(vehicle_number),
          clean(driving_license_number),
          vehicle_photo,
          driving_license_photo,
          aadhar_card,
          pancard
        ]
      );
    }

    res.json({
      success: true,
      message: "Rider details saved successfully"
    });

  } catch (error) {
    console.error("Save Rider Details Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   6️⃣ Get Rider Details (For Review Page)
===================================================== */

const getRiderDetails = async (req, res) => {
  try {
    const { applicant_id } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM rider_details
       WHERE rider_applicant_id = ?`,
      [applicant_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Rider details not found" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("Get Rider Details Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//update rider details
const updateRiderDetails = async (req, res) => {
  try {
    const { applicant_id, ...fields } = req.body;

    if (!applicant_id) {
      return res.status(400).json({
        success: false,
        message: "Applicant ID required"
      });
    }

    let updateFields = [];
    let values = [];

    const allowedTextFields = [
      "full_name",
      "age",
      "gender",
      "mobile",
      "location",
      "vehicle_number",
      "driving_license_number"
    ];

    // Only update provided allowed text fields
    allowedTextFields.forEach((key) => {
      if (fields[key] !== undefined) {
        updateFields.push(`${key}=?`);
        values.push(fields[key]); // exact value
      }
    });

    // Handle uploaded images
    const fileFields = [
      "photo",
      "vehicle_photo",
      "driving_license_photo",
      "aadhar_card",
      "pancard"
    ];

    fileFields.forEach((field) => {
      if (req.files?.[field]?.[0]?.path) {
        updateFields.push(`${field}=?`);
        values.push(req.files[field][0].path);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update"
      });
    }

    values.push(applicant_id);

    const query = `
      UPDATE rider_details
      SET ${updateFields.join(", ")}
      WHERE rider_applicant_id=?
    `;

    await db.query(query, values);

    return res.json({
      success: true,
      message: "Rider updated successfully"
    });

  } catch (error) {
    console.error("PATCH Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getRiderApplicationStatus,
  submitRiderForApproval,
  approveRider,
  rejectRider,
  getRidersByStatus,
  riderSignup,
  verifyRiderOTP,
  resendRiderOTP,
  riderLogin,
  forgotRiderPassword,
  resetRiderPassword,
  saveRiderDetails,
  getRiderDetails,
  updateRiderDetails
};