import { GoogleGenerativeAI } from "@google/generative-ai";

// Use environment variable for API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ Gemini API Key missing in environment variables!");
}

export async function generateQuizQuestions(username) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const topic = localStorage.getItem("selectedTopic") || "General";

  const prompt = `
Generate EXACTLY 5 multiple-choice questions ONLY about topic: "${topic}".

Return ONLY valid JSON. No markdown, no backticks, no explanation.

Correct format MUST be:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "answer": "string"
  }
]
`;

  try {
    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();

    // STEP 1: Remove ```json and ``` blocks
    raw = raw.replace(/```json|```/g, "").trim();

    // STEP 2: Extract JSON strictly between first "[" and last "]"
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]") + 1;

    if (start === -1 || end === -1) {
      console.error("❌ No JSON found:", raw);
      return [];
    }

    let jsonString = raw.substring(start, end);

    // STEP 3: Remove trailing commas inside objects or arrays
    jsonString = jsonString.replace(/,\s*([}\]])/g, "$1");

    // STEP 4: Replace single quotes with double quotes (Gemini sometimes uses them)
    jsonString = jsonString.replace(/'/g, '"');

    // STEP 5: Ensure valid JSON by removing stray \n, \t, comments
    jsonString = jsonString.replace(/[\r\n\t]/g, "");

    // STEP 6: Parse JSON
    const parsed = JSON.parse(jsonString);

    // STEP 7: Validate structure
    if (!Array.isArray(parsed) || parsed.length !== 5) {
      console.error("❌ Invalid quiz structure:", parsed);
      return [];
    }

    return parsed;

  } catch (error) {
    console.error("❌ JSON Parsing Error:", error);
    return [];
  }
}