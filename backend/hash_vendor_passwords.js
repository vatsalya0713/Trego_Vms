const db = require("./db");
const bcrypt = require("bcrypt");

async function hashPasswords() {
  try {
    const [vendors] = await db.query("SELECT id, password FROM vendor_signup");
    console.log(`Found ${vendors.length} vendors.`);
    for (const vendor of vendors) {
      if (!vendor.password.startsWith("$2a$") && !vendor.password.startsWith("$2b$")) {
        const hashed = await bcrypt.hash(vendor.password, 10);
        await db.query("UPDATE vendor_signup SET password = ? WHERE id = ?", [hashed, vendor.id]);
        console.log(`Updated vendor ID ${vendor.id} password to bcrypt hash.`);
      }
    }
    console.log("Password hashing completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error hashing passwords:", err);
    process.exit(1);
  }
}

hashPasswords();
