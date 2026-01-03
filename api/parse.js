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

Rules:
- Always infer date if present (including formats like 07.11.25)
- Always infer time if present (e.g. 1:00 PM)
- If multiple venues are present, join them with commas
- Generate a short, clean title (≤ 7 words)
- Move extra instructions into notes
- Never leave a field empty if information is present
- Return ONLY valid JSON
- No explanations, no markdown

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

    // light normalization
    parsed.date = parsed.date.replace(/\./g, "-");
    parsed.venue = parsed.venue.replace(/\s*,\s*/g, ", ");

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("AI parsing error:", err);

    // SAFE FALLBACK (never break UI)
    return res.status(200).json({
      title: text.slice(0, 60),
      date: "",
      time: "",
      venue: "",
      notes: text,
    });
  }
}
