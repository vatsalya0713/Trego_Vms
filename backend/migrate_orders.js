const db = require("./db");

const cols = [
  { name: "items_count", spec: "INT DEFAULT 1" },
  { name: "distance", spec: "VARCHAR(50) DEFAULT '2.5 km'" },
  { name: "waiting_time", spec: "VARCHAR(50) DEFAULT NULL" },
  { name: "rider_username", spec: "VARCHAR(100) DEFAULT NULL" },
  { name: "route", spec: "VARCHAR(100) DEFAULT NULL" }
];

async function run() {
  console.log("Starting orders table migration...");
  for (const col of cols) {
    try {
      await db.query(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.spec}`);
      console.log(`Added column ${col.name} successfully.`);
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME" || err.errno === 1060) {
        console.log(`Column ${col.name} already exists.`);
      } else {
        console.error(`Error adding ${col.name}:`, err);
      }
    }
  }
  console.log("Migration completed.");
  process.exit(0);
}

run();
