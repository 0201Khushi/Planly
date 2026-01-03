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
    // ================================
    // STEP 1: AI EXTRACTION
    // ================================
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
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
- Move all extra details into notes
- Return ONLY valid JSON (no markdown, no text)

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
    let parsed = JSON.parse(raw);

    // ================================
    // STEP 2: RULE-BASED FALLBACKS
    // ================================

    // DATE: 07.11.25 or 07-11-2025
    const dateMatch = text.match(/\b\d{2}[.\-]\d{2}[.\-]\d{2,4}\b/);
    if ((!parsed.date || parsed.date.trim() === "") && dateMatch) {
      parsed.date = dateMatch[0].replace(/\./g, "-");
    }

    // TIME: 1:00 PM / 13:00
    const timeMatch = text.match(/\b\d{1,2}:\d{2}(?:\s?(?:AM|PM))?\b/i);
    if ((!parsed.time || parsed.time.trim() === "") && timeMatch) {
      parsed.time = timeMatch[0].toUpperCase();
    }

    // VENUE: FN-1, FN-3 etc.
    const venueMatches = text.match(/\b[A-Z]{1,3}-\d\b/g);
    if ((!parsed.venue || parsed.venue.trim() === "") && venueMatches) {
      parsed.venue = venueMatches.join(", ");
    }

    // ================================
    // STEP 3: TITLE NORMALIZATION
    // ================================
    if (!parsed.title || parsed.title.length > 60) {
      let clean = text
        .replace(/\b\d{2}[.\-]\d{2}[.\-]\d{2,4}\b/g, "")
        .replace(/\b\d{1,2}:\d{2}\s?(AM|PM)?\b/gi, "")
        .replace(/\b[A-Z]{1,3}-\d\b/g, "")
        .replace(/\s+/g, " ")
        .trim();

      parsed.title = clen
        .split(" ")
        .slice(0, 7)
        .join(" ");
    }

    // ================================
    // STEP 4: FINAL GUARANTEE
    // ================================
    return res.status(200).json({
      title: parsed.title || text.slice(0, 50),
      date: parsed.date || "",
      time: parsed.time || "",
      venue: parsed.venue || "",
      notes: parsed.notes || text,
    });

  } catch (err) {
    console.error("Parsing error:", err);

    // Absolute fallback — frontend NEVER breaks
    return res.status(200).json({
      title: text.slice(0, 50),
      date: "",
      time: "",
      venue: "",
      notes: text,
    });
  }
}
