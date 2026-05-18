import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";
const ALLOWED_CATEGORIES = [
  "Food",
  "Travel",
  "Utilities",
  "Office",
  "Healthcare",
  "Other",
];

function extractJson(text) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

function normalizeCategory(category) {
  if (!category || typeof category !== "string") return "Other";
  const normalized = category.trim().toLowerCase();
  const found = ALLOWED_CATEGORIES.find(
    (item) => item.toLowerCase() === normalized,
  );
  return found || "Other";
}

export async function extractExpenseDataFromImage({ mimeType, base64Data }) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an invoice extraction service.
Return only valid JSON with this exact shape:
{
  "vendor": "string",
  "amount": number,
  "date": "YYYY-MM-DD",
  "currency": "string",
  "category": "Food | Travel | Utilities | Office | Healthcare | Other"
}

Rules:
- Extract invoice vendor, total amount, and date from the image.
- Infer category from line items/vendor and choose only one allowed category.
- If a field is unknown, estimate conservatively but still return valid values.
- Output only JSON, no markdown.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
  });

  let text;
  try {
    text = response.text;
  } catch (err) {
    console.error("GenAI generateContent response shape:", response);
    throw new Error(
      "GenAI failed to return text: " + (err.message || String(err)),
    );
  }

  let parsed;
  try {
    parsed = extractJson(text);
  } catch (err) {
    console.error("Failed to parse GenAI output:", text);
    throw new Error(
      "Failed to parse GenAI JSON output: " + (err.message || String(err)),
    );
  }

  return {
    vendor: String(parsed.vendor || "Unknown Vendor").trim(),
    amount: Number(parsed.amount || 0),
    date: parsed.date || new Date().toISOString().slice(0, 10),
    currency: String(parsed.currency || "USD").toUpperCase(),
    category: normalizeCategory(parsed.category),
    rawExtraction: parsed,
  };
}
