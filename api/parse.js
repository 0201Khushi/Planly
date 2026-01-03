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
      messages: [
        {
          role: "system",
          content:
            "Extract structured data from the message. Return JSON with keys: title, date, time, venue, notes.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    return res.status(200).json(
      JSON.parse(completion.choices[0].message.content)
    );
  } catch (err) {
    return res.status(500).json({ error: "AI parsing failed" });
  }
}
