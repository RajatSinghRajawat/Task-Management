const express = require("express");
const router = express.Router();

const {
    uploadMaterial,
    getAllMaterials,
    getMaterial,
    updateMaterial,
    deleteMaterial
} = require("../controllers/Material");

const auth = require("../middleware/authMiddleware"); 
const upload = require("../middleware/multer"); 

// 📤 Upload (with files)
router.post("/upload", auth, upload.array("files", 5), uploadMaterial);

// 📥 Get all (filters supported)
router.get("/", getAllMaterials);

// 🔍 Get one
router.get("/:id", getMaterial);

// ✏️ Update
router.put("/:id", auth, upload.array("files", 5), updateMaterial);

// 🗑 Delete
router.delete("/:id", auth, deleteMaterial);

module.exports = router;