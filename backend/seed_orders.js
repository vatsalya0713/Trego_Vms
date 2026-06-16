const db = require("./db");

async function seed() {
  console.log("Starting database seeding for orders...");

  try {
    // 1. Fetch a valid vendor user ID from vendor_signup
    const [vendors] = await db.query("SELECT vendor_id FROM vendor_signup LIMIT 1");
    let vendorId = null;
    if (vendors.length > 0) {
      vendorId = vendors[0].vendor_id;
      console.log(`Using existing vendor_id: ${vendorId}`);
    } else {
      console.warn("No vendors found in vendor_signup. Seeding with vendor_id = 1.");
      vendorId = 1;
    }

    // 2. Clear existing test orders to start fresh
    await db.query("DELETE FROM orders");
    console.log("Cleared existing orders.");

    // 3. Define the seed data
    const now = new Date();
    const testOrders = [
      {
        address: "Sector 15, Noida, UP",
        city: "Noida",
        created_at: now,
        discount: 0.0,
        email: "john.doe@example.com",
        lanmark: "Near Metro Station",
        mobile: 9876543210,
        name: "John Doe",
        order_status: "Placed",
        payment_method: "COD",
        payment_status: "Pending",
        pincode: "201301",
        total_amount: 1200.00,
        updated_at: now,
        pre_order_id: null,
        user_id: 1,
        vendor_id: vendorId,
        prescription_url: "https://res.cloudinary.com/demo/image/upload/v1570535031/sample.jpg",
        items_count: 2,
        distance: "3.5 km",
        waiting_time: null,
        rider_username: null,
        route: null,
      },
      {
        address: "Sector 62, Noida, UP",
        city: "Noida",
        created_at: now,
        discount: 10.0,
        email: "alice.smith@example.com",
        lanmark: "Near Fortis Hospital",
        mobile: 8130424124,
        name: "Alice Smith",
        order_status: "New",
        payment_method: "GPay",
        payment_status: "Paid",
        pincode: "201309",
        total_amount: 1500.00,
        updated_at: now,
        pre_order_id: null,
        user_id: 2,
        vendor_id: vendorId,
        prescription_url: "https://res.cloudinary.com/demo/image/upload/v1570535031/sample.jpg",
        items_count: 3,
        distance: "2.5 km",
        waiting_time: null,
        rider_username: null,
        route: null,
      },
      {
        address: "Indirapuram, Ghaziabad, UP",
        city: "Ghaziabad",
        created_at: now,
        discount: 5.0,
        email: "bob.jones@example.com",
        lanmark: "Opposite Shipra Mall",
        mobile: 9123456789,
        name: "Bob Jones",
        order_status: "Pending",
        payment_method: "COD",
        payment_status: "Pending",
        pincode: "201014",
        total_amount: 850.00,
        updated_at: now,
        pre_order_id: null,
        user_id: 3,
        vendor_id: vendorId,
        prescription_url: null,
        items_count: 2,
        distance: "1.8 km",
        waiting_time: "10 min",
        rider_username: null,
        route: null,
        cancel_reason: "Urgent delivery - call client before departure",
      },
      {
        address: "Sector 21, Noida, UP",
        city: "Noida",
        created_at: now,
        discount: 0.0,
        email: "charlie.brown@example.com",
        lanmark: "Block C Market",
        mobile: 9988776655,
        name: "Charlie Brown",
        order_status: "Assigned",
        payment_method: "GPay",
        payment_status: "Paid",
        pincode: "201301",
        total_amount: 1250.00,
        updated_at: now,
        pre_order_id: null,
        user_id: 4,
        vendor_id: vendorId,
        prescription_url: "https://res.cloudinary.com/demo/image/upload/v1570535031/sample.jpg",
        items_count: 4,
        distance: "4.2 km",
        waiting_time: null,
        rider_username: "Rahul Rider",
        route: "Warehouse → Noida",
      },
      {
        address: "Indirapuram, Ghaziabad, UP",
        city: "Ghaziabad",
        created_at: now,
        discount: 15.0,
        email: "david.wilson@example.com",
        lanmark: "Aditya Mall",
        mobile: 9911223344,
        name: "David Wilson",
        order_status: "Out for Delivery",
        payment_method: "COD",
        payment_status: "Pending",
        pincode: "201014",
        total_amount: 3480.00,
        updated_at: now,
        pre_order_id: null,
        user_id: 5,
        vendor_id: vendorId,
        prescription_url: null,
        items_count: 5,
        distance: "6.2 km",
        waiting_time: null,
        rider_username: "Amit Rider",
        route: "Warehouse → Ghaziabad",
      },
      {
        address: "Sector 12, Noida, UP",
        city: "Noida",
        created_at: now,
        discount: 0.0,
        email: "eve.davis@example.com",
        lanmark: "Near Stadium",
        mobile: 9555666777,
        name: "Eve Davis",
        order_status: "Cancelled",
        payment_method: "COD",
        payment_status: "Cancelled",
        pincode: "201301",
        total_amount: 950.00,
        updated_at: now,
        pre_order_id: null,
        user_id: 6,
        vendor_id: vendorId,
        prescription_url: null,
        items_count: 1,
        distance: "5.0 km",
        waiting_time: null,
        rider_username: null,
        route: null,
        cancel_reason: "Customer cancelled the order",
      }
    ];

    // 4. Insert each order into the DB
    for (const ord of testOrders) {
      await db.query(
        `INSERT INTO orders (
          address, city, created_at, discount, email, lanmark, mobile, name, 
          order_status, payment_method, payment_status, pincode, total_amount, 
          updated_at, pre_order_id, user_id, vendor_id, prescription_url, 
          items_count, distance, waiting_time, rider_username, route, cancel_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ord.address,
          ord.city,
          ord.created_at,
          ord.discount,
          ord.email,
          ord.lanmark,
          ord.mobile,
          ord.name,
          ord.order_status,
          ord.payment_method,
          ord.payment_status,
          ord.pincode,
          ord.total_amount,
          ord.updated_at,
          ord.pre_order_id,
          ord.user_id,
          ord.vendor_id,
          ord.prescription_url,
          ord.items_count,
          ord.distance,
          ord.waiting_time,
          ord.rider_username,
          ord.route,
          ord.cancel_reason || null,
        ]
      );
    }

    console.log("Successfully seeded mock orders database!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed orders database:", err);
    process.exit(1);
  }
}

seed();
