import mongoose from "mongoose";

const librarySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fileUrl: { type: String, required: true },
    userId: { type: String, required: true },
    uploaderName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Library", librarySchema);
