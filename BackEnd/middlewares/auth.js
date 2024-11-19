
const jwt = require('jsonwebtoken');

//Middleware to verify JWT
const authenticate = (req , res , next)=>{
    const token = req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({message: 'Access denied. No token provided.'});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;   //attach user information to the request
        next();
    }
    catch(error){
        res.status(403).json({message : 'Invalid or expired token.'});
    }
};

module.exports = authenticate;

