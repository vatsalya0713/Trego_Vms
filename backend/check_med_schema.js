const db = require("./db");

async function checkSchema() {
  try {
    const [rows] = await db.query("DESCRIBE medicine_master_db_table");
    console.log("medicine_master_db_table schema:", rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
