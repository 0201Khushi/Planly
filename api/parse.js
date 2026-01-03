import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
You are a strict JSON generator.
Return ONLY valid JSON.
Do NOT include explanations, markdown, or extra text.
You extract structured academic events from messages.

Rules:
- Always infer date if present (including formats like 07.11.25)
- Always infer time if present (e.g. 1:00 PM)
- If multiple venues are present, join them with commas
- Generate a short, clean title (≤ 7 words)
- Move extra instructions into notes
- Never leave a field empty if information is present
- Return ONLY valid JSON

Schema:
{
  "title": string,
  "date": string,
  "time": string,
  "venue": string,
  "notes": string
}
      `.trim(),
    },
    {
      role: "user",
      content: text,
    },
  ],
});
