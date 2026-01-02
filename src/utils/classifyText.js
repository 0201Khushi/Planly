export function classifyText(text) {
  const t = text.toLowerCase();

  if (t.includes("exam") || t.includes("test") || t.includes("quiz"))
    return "Exams";

  if (t.includes("submit") || t.includes("deadline"))
    return "Academic Deadlines";

  if (t.includes("meeting") || t.includes("club"))
    return "Clubs";

  if (t.includes("event") || t.includes("fest"))
    return "Events";

  return "General";
}
