const jwt = require("jsonwebtoken");

//Middleware to verify JWT
const authenticate = (requiredRole = null) => {
  return (req, res, next) => {
    // console.log('incoming headers' , req.headers);

    let authHeader;

    // Handle non-standard headers structure
    if (req.headers.key && req.headers.value) {
      if (req.headers.key.toLowerCase() === "authorization") {
        authHeader = req.headers.value; // Extract the token
      }
    } else {
      // Fallback to standard structure
      authHeader = req.headers["authorization"];
    }
    console.log("Authorization Header:", authHeader);

    // Check if Authorization header is present
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Ensure the token follows the Bearer <token> format
    const token = authHeader.split(" ")[1];

    // const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // //for managing access for admin roles
      // if(decoded.role !=='Admin'){
      //     return res.status(403).json({message : 'Access Denied. Admin role required'})
      // }

      req.user = decoded; //attach user information to the request

      console.log(requiredRole, '==========' , decoded.role,'-------');

      // If a specific role is required, check it
      if (requiredRole && decoded.role !== requiredRole) {
        return res
          .status(403)
          .json({ message: `Access denied. ${requiredRole} role required.` });
      }

      // console.log(req.user,'in auth file');
      next();
    } catch (error) {
      res.status(403).json({ message: "Invalid or expired token." });
    }
  };
};

module.exports = authenticate;
