const db = require("../db");
const bcrypt = require("bcrypt");

const addAdmin = (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query("SELECT * FROM user WHERE username = ?", [username])
    .then(([rows]) => {
      if (rows.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }

      return bcrypt.hash(password, 10).then((hashedPassword) => {
        const sql =
          "INSERT INTO user (name, username, password, role, created_by,activeStatus) VALUES (?, ?, ?, 'admin', 'super_admin','Active')";
        return db.query(sql, [name, username, hashedPassword]);
      });
    })
    .then(() => res.json({ message: "Admin created successfully" }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server error" ,data:err});
    });
};


const getAdmins = (req, res) => {
  db.query("SELECT id, name, username, role,activeStatus FROM user WHERE role = 'admin'")
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

    const [rows] = await db.query("SELECT * FROM user WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    let hashedPwd = rows[0].password; 
    if (password) {
      hashedPwd = await bcrypt.hash(password, 10);
    }

    await db.query(
      "UPDATE user SET name = ?, username = ?, password = ? WHERE id = ?",
      [name, username, hashedPwd, id]
    );

    return res.status(200).json({ msg: "Vendor details updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const updateStatus=(req,res)=>{
  const {id}=req.params;
  const query="UPDATE user  SET activeStatus='Blocked'WHERE id=?";
  db.query(query,[id]).then(()=>{
    return res.status(200).json({msg:"Admin Blocked Successfully"});
  }).catch((err)=>{
    console.log(err);
  })
}

const deleteAdmin = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM user WHERE id = ? AND role = 'admin'", [id])
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

    /* =========================
       ACTION HANDLING
    ========================== */

    if (action === "REJECT") {
      await db.execute(
        `UPDATE vendor_application_status
         SET status='REJECTED', editable=false
         WHERE applicant_id=?`,
        [applicant_id]
      );
    }

   if (action === "VERIFY") {
  const vendor_id = generateVendorId();

  await db.execute(
    `UPDATE vendor_informations
     SET vendor_id=?, is_verified=1, active=1
     WHERE applicant_id=?`,
    [vendor_id, applicant_id]
  );

  await db.execute(
    `UPDATE vendor_application_status
     SET status='APPROVED'
     WHERE applicant_id=?`,
    [applicant_id]
  );
}


 if (action === "SEND_SUPER") {
  const { feedback } = req.body;

  await db.execute(
    `UPDATE vendor_application_status
     SET status='SUPER_ADMIN_REVIEW',
         admin_feedback = ?
     WHERE applicant_id=?`,
    [feedback || null, applicant_id]
  );
}

    if (action === "TOGGLE_ACTIVE") {
      await db.execute(
        `UPDATE vendor_informations
         SET active = IF(active=1,0,1)
         WHERE applicant_id=?`,
        [applicant_id]
      );
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

    const [rows] = await db.execute(`
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
`, [statusFilter]);


    res.json(rows);

  } catch (err) {
    console.error("Admin Vendor Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addAdmin, getAdmins,updateAdmin,updateStatus, deleteAdmin,getAdminVendors,adminVendorAction };