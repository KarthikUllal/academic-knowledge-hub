// Check whether the user has the required role
const authorize = (...allowedRoles) => {

    return (req, res, next) => {

        // Check whether the user's role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You do not have permission to access this resource"
            });
        }

        next();
    };
};

module.exports = authorize;