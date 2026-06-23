const db = require("./db");

async function checkData() {
  try {
    const [rows] = await db.query("SELECT discount_price, offer_percent FROM medicine_master_db_table LIMIT 5");
    console.log("Sample data:", rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
