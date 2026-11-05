const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const resourceRoutes = require("./routes/resource.routes");
const postRoutes = require("./routes/post.routes")
const commentRoutes = require("./routes/comment.routes");
const reportRoutes = require("./routes/report.routes");

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Authentication routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/users", userRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Resource routes
app.use("/api/resources", resourceRoutes);

// Post routes
app.use("/api/posts", postRoutes);

// Comment routes
app.use("/api", commentRoutes);

// Report routes
app.use("/api/reports", reportRoutes);



// Test route
app.get("/", (req, res) => {
    res.send("Academic Knowledge Hub API is running!");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();