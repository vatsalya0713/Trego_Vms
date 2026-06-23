const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  console.log('--- PROTECT MIDDLEWARE EXECUTION ---', req.method, req.url);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId =
      decoded.id ||
      decoded.user_id ||
      decoded.vendor_user_id ||
      decoded.vendorId;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token: no user id" });
    }

    req.user = {
      id: userId,
      role: decoded.role || null,
    };

    next();
  } catch (err) {
    console.error("JWT Error:", err.message); 
    return res.status(401).json({ message: "Token failed" });
  }
};

const isSuperAdmin = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();

  if (role !== "super_admin") {
    return res.status(403).json({
      message: "Access denied: Super Admin only",
    });
  }

  next();
};

const isSuperAdminorAdmin = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();

  if (role !== "admin" && role !== "super_admin") {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  next();
};

module.exports = {
  protect,
  isSuperAdmin,
  isSuperAdminorAdmin,
};
