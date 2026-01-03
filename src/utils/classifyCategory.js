export function classifyCategory(text) {
  const t = text.toLowerCase();

  // 🎓 EXAMS
  if (
    t.includes("quiz") ||
    t.includes("exam") ||
    t.includes("test") ||
    t.includes("midsem") ||
    t.includes("endsem") ||
    t.includes("evaluation")
  ) {
    return "Exams";
  }

  // 📚 ACADEMIC
  if (
    t.includes("syllabus") ||
    t.includes("assignment") ||
    t.includes("lab") ||
    t.includes("practical") ||
    t.includes("submission") ||
    t.includes("project")
  ) {
    return "Academic";
  }

  // 🏫 CLUBS
  if (
    t.includes("club") ||
    t.includes("society") ||
    t.includes("team") ||
    t.includes("cc") ||
    t.includes("cell") ||
    t.includes("committee") ||
    t.includes("kaggle") ||
    t.includes("hackathon")
  ) {
    return "Clubs";
  }

  // 🎉 EVENTS (default)
  return "Events";
}
