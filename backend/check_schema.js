const db = require("./db");
async function check() {
  try {
    const [vm] = await db.query("DESCRIBE vendor_medicine");
    console.log("--- vendor_medicine ---");
    console.table(vm);
    const [vmp] = await db.query("DESCRIBE vendor_medicine_price");
    console.log("--- vendor_medicine_price ---");
    console.table(vmp);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
