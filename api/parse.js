import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Invalid input" });
  }

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
You are a strict JSON generator.

Rules:
- Extract academic or event-related information
- Infer date, time, and venue if clearly present
- Generate a short, clean title (≤ 7 words)
- Move extra details into notes
- Return ONLY valid JSON (no markdown, no explanation)
-Also infer dates in the form of ordinal number,Month and return in the json date field 

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

    const raw = completion.choices[0].message.content.trim();
    const parsed = JSON.parse(raw);

    return res.status(200).json(parsed);

  } catch (err) {
    console.error("Parsing error:", err);

    // Absolute fallback (frontend must never break)
    return res.status(200).json({
      title: text.slice(0, 50),
      date: "",
      time: "",
      venue: "",
      notes: text,
    });
  }
}
