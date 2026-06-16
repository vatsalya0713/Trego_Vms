const db = require("../db");
const bcrypt = require("bcrypt");
const generateVendorId = require("../utils/generateId.js");

const addAdmin = (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query("SELECT * FROM users WHERE username = ?", [username])
    .then(([rows]) => {
      if (rows.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }

      return bcrypt.hash(password, 10).then((hashedPassword) => {
        const sql =
          "INSERT INTO users (name, username, password, role, created_by, activeStatus) VALUES (?, ?, ?, 'admin', 'super_admin','Active')";
        return db.query(sql, [name, username, hashedPassword]);
      });
    })
    .then(() => res.json({ message: "Admin created successfully" }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error", data: err });
    });
};

const getAdmins = (req, res) => {
  db.query(
    "SELECT id, name, username, role, activeStatus, created_at FROM users WHERE role = 'admin'",
  )
    .then(([rows]) => res.json(rows))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    let hashedPwd = rows[0].password;
    if (password) {
      hashedPwd = await bcrypt.hash(password, 10);
    }

    await db.query(
      "UPDATE users SET name = ?, username = ?, password = ? WHERE id = ?",
      [name, username, hashedPwd, id],
    );

    return res.status(200).json({ msg: "Admin details updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const updateStatus = (req, res) => {
  const { id } = req.params;
  const query = "UPDATE users SET activeStatus='Blocked' WHERE id=?";
  db.query(query, [id])
    .then(() => {
      return res.status(200).json({ msg: "Admin Blocked Successfully" });
    })
    .catch((err) => {
      console.log(err);
    });
};

const deleteAdmin = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE id = ? AND role = 'admin'", [id])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Admin not found" });
      }
      res.json({ message: "Admin deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
};

const adminVendorAction = async (req, res) => {
  try {
    const { applicant_id, action } = req.body;

    if (!applicant_id || !action) {
      return res.status(400).json({ message: "Invalid request" });
    }

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

const getAdminVendors = async (req, res) => {
  try {
    const { status } = req.query;

    let statusFilter = "PENDING_APPROVAL";
    if (status === "APPROVED") statusFilter = "APPROVED";

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

module.exports = {
  addAdmin,
  getAdmins,
  updateAdmin,
  updateStatus,
  deleteAdmin,
  getAdminVendors,
  adminVendorAction,
};
