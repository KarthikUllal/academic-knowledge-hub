const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    console.log("Authentication middleware executed");

    try {
        const token = req.cookies?.token;

        console.log("Token received:", Boolean(token));

        if (!token) {
            return res.status(401).json({
                message: "Token not found"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("Token verified successfully");

        req.user = decoded;

        next();

    } catch (error) {
        console.log("JWT verification error:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = protect;