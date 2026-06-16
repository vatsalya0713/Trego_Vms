const db = require("./db");

async function checkSchema() {
  try {
    const [rows] = await db.query("DESCRIBE vendor_medicine_table");
    console.log("vendor_medicine_table schema:", rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
