import "dotenv/config";
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post("/parse", async (req, res) => {
  try {
    const { text } = req.body;

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

    let parsed;

try {
  parsed = JSON.parse(completion.choices[0].message.content);
} catch (err) {
  return res.status(500).json({
    error: "AI returned invalid JSON",
    raw: completion.choices[0].message.content,
  });
}

res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI parsing failed" });
  }
});

app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
