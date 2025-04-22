import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure we're using the same field name as in your token
    req.userId = decoded.userId; // Changed from userId || _id to just userId
    
    console.log("Middleware Decoded:", decoded);
    next();
  } catch (err) {
    console.error("Token error:", err);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};