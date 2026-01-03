import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Invalid input" });
  }

  // 🔹 First: cheap deterministic split (newline-based)
  const lines = text
    .split(/\n+/)
    .map(l => l.trim())
    .filter(Boolean);

  // If clearly multiple lines → treat as separate events
  if (lines.length > 1) {
    return res.status(200).json(lines);
  }

  // 🔹 Fallback: ask LLM only if not obvious
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
Split the message into individual academic events.

Rules:
- Each quiz, test, syllabus, deadline, or meeting is a separate event
- If there is only one event, return a single-item array
- Preserve original wording
- Return ONLY valid JSON

Schema:
{
  "events": string[]
}
          `.trim(),
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const raw = completion.choices[0].message.content.trim();
    const parsed = JSON.parse(raw);

    return res.status(200).json(parsed.events);

  } catch (err) {
    console.error("Split error:", err);
    return res.status(200).json([text]);
  }
}
