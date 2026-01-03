import Groq from "groq-sdk";

// Utility: clean lines
function normalizeLines(text) {
  return text
    .split(/\n+/)
    .map(l => l.trim())
    .filter(Boolean);
}

// Utility: detect "respectively" cases
function hasRespectively(text) {
  return /\brespectively\b/i.test(text);
}

// Utility: extract subjects (customize later)
function extractSubjects(text) {
  return text.match(/\b[A-Z]{2,}\b/g) || [];
}

// Utility: extract dates like "15th Jan", "14 Jan"
function extractDates(text) {
  return (
    text.match(
      /\b\d{1,2}(st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/gi
    ) || []
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Invalid input" });
  }

  // ===============================
  // 1️⃣ NEWLINE / LIST SPLITTING
  // ===============================
  const lines = normalizeLines(text);
  if (lines.length > 1) {
    return res.status(200).json(lines);
  }

  // ===============================
  // 2️⃣ "RESPECTIVELY" LOGIC
  // ===============================
  if (hasRespectively(text)) {
    const subjects = extractSubjects(text);
    const dates = extractDates(text);

    // positional alignment
    if (subjects.length > 0 && subjects.length === dates.length) {
      const events = subjects.map((subj, i) => {
        return `${subj} quiz on ${dates[i]}`;
      });

      return res.status(200).json(events);
    }
    // if mismatch → fall through to LLM
  }

  // ===============================
  // 3️⃣ LLM FALLBACK (DENSE TEXT)
  // ===============================
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
- Each quiz, test, syllabus, assignment, or deadline is a separate event
- Preserve original wording
- If only one event exists, return a single-item array
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

    if (Array.isArray(parsed.events) && parsed.events.length > 0) {
      return res.status(200).json(parsed.events);
    }

    // fallback
    return res.status(200).json([text]);

  } catch (err) {
    console.error("Split error:", err);
    return res.status(200).json([text]);
  }
}
