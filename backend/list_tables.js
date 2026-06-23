const db = require("./db");

async function listTables() {
  try {
    const [rows] = await db.query("SHOW TABLES");
    console.log("Tables in DB:", rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listTables();
