import jwt from "jsonwebtoken";

// Protect shelter routes - verify JWT token
export function protectShelter(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ Shelter auth failed: No token provided");
    return res.status(401).json({ msg: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify this is a shelter token
    if (decoded.type !== 'shelter') {
      console.log("❌ Shelter auth failed: Invalid token type");
      return res.status(403).json({ msg: "Invalid token type" });
    }
    
    req.shelterUser = decoded; // Attach shelter user info to request
    console.log(`✅ Shelter auth success for user: ${decoded.shelter_user_id} (Shelter: ${decoded.shelter_id})`);
    next();
  } catch (err) {
    console.log("❌ Shelter auth failed: Invalid token -", err.message);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
}

// Check if shelter user has specific role
export function requireShelterRole(...roles) {
  return (req, res, next) => {
    if (!req.shelterUser) {
      return res.status(401).json({ msg: "Not authenticated" });
    }
    
    if (!roles.includes(req.shelterUser.role)) {
      console.log(`❌ Permission denied: User role '${req.shelterUser.role}' not in [${roles.join(', ')}]`);
      return res.status(403).json({ msg: "Insufficient permissions" });
    }
    
    next();
  };
}
