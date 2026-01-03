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

Schema:
{
  "title": string,
  "date": string | "",
  "time": string | "",
  "venue": string | "",
  "notes": string | ""
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
    console.error("AI ERROR:", err);
    return res.status(200).json({
      title: text.slice(0, 40),
      date: "",
      time: "",
      venue: "",
      notes: text,
    });
  }
}
