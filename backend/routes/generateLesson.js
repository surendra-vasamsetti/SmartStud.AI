import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { topic } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Explain ${topic} in Java.
Beginner friendly.
Include explanation and example code.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const [content, code] = text.split("```");

    res.json({
      content: content?.trim(),
      code: code?.replace("java", "")?.trim(),
    });
  } catch (err) {
    res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;
