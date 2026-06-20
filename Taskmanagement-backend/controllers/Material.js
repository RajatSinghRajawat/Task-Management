const Material = require("../models/Material");

// ==============================
// 📤 UPLOAD MATERIAL
// ==============================
const uploadMaterial = async (req, res) => {
    try {
        const {
            title,
            description,
            course,
            batch,
            className,
            section,
            subject,
            type,
            links,
            visibility,
            tags
        } = req.body;

        // 🔒 Validation
        if (!title || !course || !type) {
            console.log("Material Validation Failed - Missing fields:", { title, course, type });
            return res.status(400).json({
                success: false,
                message: `Validation Error: Title, Course, and Type are mandatory. Received: title=${title || 'MISSING'}, course=${course || 'MISSING'}, type=${type || 'MISSING'}`
            });
        }

        const courseArray = Array.isArray(course) ? course : (typeof course === 'string' ? course.split(',') : [course]);

        // 📎 Files
        const files = req.files ? req.files.map(file => file.path) : [];

        // 🔗 Links (safe array)
        const parsedLinks = links
            ? Array.isArray(links)
                ? links
                : links.split(",").map(l => l.trim())
            : [];

        const parsedTags = tags
            ? Array.isArray(tags)
                ? tags
                : tags.split(",").map(t => t.trim())
            : [];

        const material = new Material({
            title,
            description,
            course: courseArray,
            batch,
            className,
            section,
            subject,
            type,
            files,
            links: parsedLinks,
            visibility: visibility || "Public",
            tags: parsedTags,
            uploadedBy: req.user?.id || null
        });

        await material.save();

        res.status(201).json({
            success: true,
            message: "Material uploaded successfully",
            data: material
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==============================
// 📥 GET ALL MATERIALS (FILTER)
// ==============================
const getAllMaterials = async (req, res) => {
    try {
        const { course, batch, className, subject, type } = req.query;

        let filter = { visibility: "Public" };

        if (course) filter.course = course;
        if (batch) filter.batch = batch;
        if (className) filter.className = className;
        if (subject) filter.subject = subject;
        if (type) filter.type = type;

        const materials = await Material.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: materials.length,
            data: materials
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==============================
// 🔍 GET SINGLE MATERIAL
// ==============================
const getMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found"
            });
        }

        // 📊 Track views
        material.views += 1;
        await material.save();

        res.status(200).json({
            success: true,
            data: material
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==============================
// ✏️ UPDATE MATERIAL
// ==============================
const updateMaterial = async (req, res) => {
    try {
        let updateData = req.body;

        // 📎 New files आए तो append करो
        if (req.files && req.files.length > 0) {
            updateData.files = req.files.map(f => f.path);
        }

        const material = await Material.findByIdAndUpdate(
            req.params.id,
            updateData,
            { returnDocument: "after" }
        );

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Material updated",
            data: material
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==============================
// 🗑 DELETE MATERIAL
// ==============================
const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findByIdAndDelete(req.params.id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Material deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    uploadMaterial,
    getAllMaterials,
    getMaterial,
    updateMaterial,
    deleteMaterial
};
