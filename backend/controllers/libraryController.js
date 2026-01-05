import Library from "../models/Library.js";

/* ---------- UPLOAD ---------- */
export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const { userId, uploaderName } = req.body;

    if (!file || !userId || !uploaderName) {
      return res.status(400).json({ message: "Missing data" });
    }

    const newFile = await Library.create({
      name: file.originalname,
      fileUrl: `${process.env.BASE_URL}/uploads/${file.filename}`,
      userId,
      uploaderName,
    });

    res.status(201).json(newFile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

/* ---------- GET ALL FILES ---------- */
export const getFiles = async (req, res) => {
  try {
    const files = await Library.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
};

/* ---------- DELETE (OWNER ONLY) ---------- */
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const file = await Library.findById(id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Library.findByIdAndDelete(id);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};
