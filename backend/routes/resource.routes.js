const express = require("express");

const {
  createResource,
  getApprovedResources,
  getResourceById,
  getResourcePreview,
  downloadResource,
  updateResource,
  deleteResource,
} = require("../controllers/resource.controller");
const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

// Upload a resource
router.post("/", protect, upload.single("file"), createResource);

// Get all approved resources
router.get("/", protect, getApprovedResources);

// Get details of a single resource
router.get("/:id", protect, getResourceById);

// Get resource preview
router.get("/:id/preview", protect, getResourcePreview);

// Download an approved resource
router.get("/:id/download", protect, downloadResource);

// Update a resource
router.put("/:id", protect, updateResource);

// Delete a resource
router.delete("/:id", protect, deleteResource);


module.exports = router;
