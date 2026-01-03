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
- Always infer date if present
- Always infer time if present
- Always infer venue if present
- Generate a short clean title
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

    // ✅ STEP 1: Parse AI output
    const raw = completion.choices[0].message.content.trim();
    const parsed = JSON.parse(raw);

    // =================================================
    // ✅ STEP 2: RULE-BASED FALLBACK EXTRACTION (HERE)
    // =================================================

   // ---------- RULE-BASED FALLBACK EXTRACTION ----------

const dateMatch = text.match(/\b\d{2}[.\-]\d{2}[.\-]\d{2,4}\b/);
if ((!parsed.date || parsed.date.trim() === "") && dateMatch) {
  parsed.date = dateMatch[0].replace(/\./g, "-");
}

// TIME
const timeMatch = text.match(/\b\d{1,2}:\d{2}(?:\s?(?:AM|PM))?\b/i);
if ((!parsed.time || parsed.time.trim() === "") && timeMatch) {
  parsed.time = timeMatch[0].toUpperCase();
}

// VENUE (FN-1, FN-3 and FN-4)
const venueMatches = text.match(/\b[A-Z]{1,3}-\d\b/g);
if ((!parsed.venue || parsed.venue.trim() === "") && venueMatches) {
  parsed.venue = venueMatches.join(", ");
}
// ---------- TITLE NORMALIZATION ----------

// If AI title is missing or too long, generate one from text
if (!parsed.title || parsed.title.length > 60) {
  // Remove dates, times, venues
  let clean = text
    .replace(/\b\d{2}[.\-]\d{2}[.\-]\d{2,4}\b/g, "")
    .replace(/\b\d{1,2}:\d{2}\s?(AM|PM)?\b/gi, "")
    .replace(/\b[A-Z]{1,3}-\d\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Take first meaningful 5–7 words
  parsed.title = clean
    .split(" ")
    .slice(0, 7)
    .join(" ");
}


    // =================================================
    // ✅ STEP 3: Return final cleaned object
    // =================================================

    return res.status(200).json(parsed);

  } catch (err) {
    console.error("Parsing error:", err);

    // Absolute fallback (never break frontend)
    return res.status(200).json({
      title: text.slice(0, 60),
      date: "",
      time: "",
      venue: "",
      notes: text,
    });
  }
}

