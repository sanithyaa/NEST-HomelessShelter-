import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ Auth failed: No token provided");
    return res.status(401).json({ msg: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach to request
    console.log("✅ Auth success for user:", decoded.user_id);
    next();
  } catch (err) {
    console.log("❌ Auth failed: Invalid token -", err.message);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
}

// Optional authentication - doesn't fail if no token
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // No token, but continue anyway
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ Optional auth success for user:", decoded.user_id);
  } catch (err) {
    console.log("⚠️  Optional auth: Invalid token, continuing without auth");
    req.user = null;
  }
  next();
}

// Role-based guard
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ msg: "Access denied" });
    next();
  };
}
