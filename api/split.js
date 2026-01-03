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
You split WhatsApp messages into individual events.

Rules:
- If the message contains multiple distinct events, split them.
- Each split must contain text for ONE event only.
- Preserve original wording.
- Return ONLY valid JSON.

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

    // Fallback: treat entire text as single event
    return res.status(200).json([text]);
  }
}
