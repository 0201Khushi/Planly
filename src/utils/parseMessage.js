export function parseMessage(text) {
  const lower = text.toLowerCase();

  let title = "";
  let date = "";
  let time = "";
  let venue = "";
  let notes = "";

  // ---- TIME DETECTION ----
  const timeMatch = text.match(/\b(\d{1,2}(:\d{2})?\s?(am|pm))\b/i);
  if (timeMatch) time = timeMatch[0];

  // ---- DATE DETECTION ----
  if (lower.includes("tomorrow")) date = "Tomorrow";
  else if (lower.includes("today")) date = "Today";

  // ---- VENUE DETECTION ----
  const venueMatch = text.match(/(in|at)\s([A-Za-z0-9\s]+)/i);
  if (venueMatch) venue = venueMatch[2];

  // ---- TITLE LOGIC ----
  if (lower.includes("exam") || lower.includes("quiz")) title = "Exam";
  else if (lower.includes("meeting")) title = "Meeting";
  else if (lower.includes("class")) title = "Class";
  else title = "General Task";

  // ---- NOTES ----
  notes = text;

  return {
    title,
    date,
    time,
    venue,
    notes,
  };
}
