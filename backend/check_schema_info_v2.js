const db = require("./db");

async function checkSchema() {
  try {
    const [rows] = await db.query("DESCRIBE vendor_informations");
    console.log("vendor_informations schema (first 5):", rows.slice(0, 5));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
