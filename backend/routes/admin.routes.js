const express = require("express");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

// Only admins can access this route
router.get(
    "/dashboard",
    protect,
    authorize("admin"),
    (req, res) => {
        res.status(200).json({
            message: "Welcome to the admin dashboard"
        });
    }
);

//test admin dashboard route
router.get(
    "/dashboard",
    protect,
    authorize("admin"),
    (req, res) => {
        res.status(200).json({
            message: "Welcome to the admin dashboard"
        });
    }
);

module.exports = router;