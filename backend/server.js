import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import companionRoutes from "./routes/companionRoutes.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
connectDB();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ================= ROUTES ================= */
app.use("/api/library", libraryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/companion", companionRoutes);

/* ================= GEMINI SETUP ================= */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

/* ================= GEMINI API ================= */
app.post("/api/generate-lesson", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
    const prompt = `
You are a professional Java instructor.

Explain the topic "${topic}" for beginners.

Rules:
- Simple language
- Step-by-step explanation
- Beginner friendly
- Why this topic is important
- Provide ONE Java code example
- Do NOT copy from W3Schools or any website
- Generate ORIGINAL content only

Return ONLY valid JSON in this format:
{
  "content": "explanation here",
  "code": "java code here"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON safely
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const jsonString = text.slice(start, end + 1);
    const lesson = JSON.parse(jsonString);

    res.json(lesson);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({
      error: "Failed to generate lesson content",
    });
  }
});

app.post("/api/ask", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ text });
  } catch (error) {
    console.error("Gemini /ask Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("✅ Server running successfully");
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
