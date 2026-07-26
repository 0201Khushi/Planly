import Groq from "groq-sdk";

/* =========================
   CONFIG
========================= */

const EVENT_KEYWORDS = [
  "quiz",
  "exam",
  "evaluation",
  "deadline",
  "submission",
  "test",
  "meeting",
  "presentation",
];

/* =========================
   HELPERS
========================= */

// Normalize lines
function normalizeLines(text) {
  return text
    .split(/\n+/)
    .map(l => l.trim())
    .filter(Boolean);
}

function looksLikeEventChunk(text) {
  if (!text) return false;

  const trimmed = text.trim();
  if (!trimmed) return false;

  return (
    EVENT_KEYWORDS.some(k => trimmed.toLowerCase().includes(k)) ||
    /\b\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(trimmed) ||
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(st|nd|rd|th)?\b/i.test(trimmed) ||
    /\b\d{1,2}:\d{2}\s?(am|pm)\b/i.test(trimmed) ||
    /\btoday|tomorrow|yesterday\b/i.test(trimmed)
  );
}

function splitIntoEventChunks(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const lineChunks = normalizeLines(trimmed)
    .map(chunk => chunk.replace(/^(?:[-•*]|\d+\.)\s*/, "").trim())
    .filter(Boolean);

  if (lineChunks.length > 1) {
    const eventChunks = lineChunks.filter(looksLikeEventChunk);
    if (eventChunks.length > 1) return eventChunks;
  }

  const candidateChunks = trimmed
    .split(/\s*(?:\n|;|•|\u2022|\/|,|\band\b|\bthen\b)\s*(?=(?:[A-Z]{2,}\b|[A-Za-z]+\s+(?:quiz|exam|evaluation|deadline|submission|test|meeting|presentation)\b))/i)
    .map(chunk => chunk.trim())
    .filter(Boolean);

  const eventChunks = candidateChunks.filter(looksLikeEventChunk);
  if (eventChunks.length > 1) {
    return eventChunks;
  }

  return [];
}

// Detect "respectively"
function hasRespectively(text) {
  return /\brespectively\b/i.test(text);
}

// Extract subjects like BEE, ECT
function extractSubjects(text) {
  return text.match(/\b[A-Z]{2,}\b/g) || [];
}

// Extract dates like 15th Jan, 11 October
function extractDates(text) {
  return (
    text.match(
      /\b\d{1,2}(st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\b/gi
    ) || []
  );
}
function isSyllabusEvent(text) {
  return (
    /quiz|exam|test/i.test(text) &&
    /syllabus|unit|upto|portion|chapters?/i.test(text)
  );
}
// Decide if text is a REAL planner event
function isPrimaryEvent(text) {
  const hasDate =
    /\b\d{1,2}(st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\b/i.test(text) ||
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(st|nd|rd|th)?\b/i.test(text) ||
    /\btoday|tomorrow\b/i.test(text);

  const hasTime =
    /\b\d{1,2}:\d{2}\s?(AM|PM)\b/i.test(text);

  const hasKeyword = EVENT_KEYWORDS.some(k =>
    text.toLowerCase().includes(k)
  );

  // ✅ Allow syllabus-only quiz/exam items
  if (isSyllabusEvent(text)) {
    return true;
  }

  return (hasDate || hasTime) && hasKeyword;
}

/* =========================
   HANDLER
========================= */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Invalid input" });
  }

  /* =========================
     1️⃣ HEURISTIC SPLIT
  ========================= */
  const heuristicEvents = splitIntoEventChunks(text);
  if (heuristicEvents.length > 1) {
    return res.status(200).json(heuristicEvents);
  }

  /* =========================
     2️⃣ NEWLINE / LIST SPLIT
  ========================= */
  const lines = normalizeLines(text);

  if (lines.length > 1) {
    const primary = lines.filter(isPrimaryEvent);

    // If at least one real event exists, return only those
    if (primary.length > 0) {
      return res.status(200).json(primary);
    }

    // Else treat entire message as ONE event
    return res.status(200).json([text]);
  }

  /* =========================
     3️⃣ RESPECTIVELY LOGIC
  ========================= */
  if (hasRespectively(text)) {
    const subjects = extractSubjects(text);
    const dates = extractDates(text);

    if (subjects.length > 0 && subjects.length === dates.length) {
      const events = subjects.map((subj, i) => {
        return `${subj} quiz on ${dates[i]}`;
      });

      return res.status(200).json(events);
    }
  }

  /* =========================
     4️⃣ LLM FALLBACK (DENSE TEXT)
  ========================= */
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
Split the message into individual academic EVENTS only.

Rules:
- Only return quizzes, exams, evaluations, deadlines, submissions, meetings, presentations, or tests
- Ignore rules, policies, notes, warnings, links
- If there are multiple distinct events, return every one of them as separate array items
- If only one real event exists, return a single-item array
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

    const filtered = (parsed.events || []).filter(isPrimaryEvent);

    if (filtered.length > 0) {
      return res.status(200).json(filtered);
    }

    return res.status(200).json([text]);

  } catch (err) {
    console.error("Split error:", err);
    return res.status(200).json([text]);
  }
}
