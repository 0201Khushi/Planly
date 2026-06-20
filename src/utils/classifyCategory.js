export function classifyCategory(text, visibleCategories = []) {
  const t = (text || "").toLowerCase();

  // Normalize visible categories set for quick checks
  const visible = new Set((visibleCategories || []).map((c) => c && String(c).trim()));

  const isVisible = (name) => visible.has(name) || visible.has(name === "Placements" ? "Career" : name);

  // Helper: whether an optional category is enabled/visible
  const optionalVisible = (name) => {
    // accept both 'Career' and 'Placements' as same semantic category
    if (name === "Placements") {
      return visible.has("Placements") || visible.has("Career");
    }
    return visible.has(name);
  };

  // Step 1: EXAMS (highest precedence)
  if (isVisible("Exams")) {
    if (
      t.includes("quiz") ||
      t.includes("exam") ||
      t.includes("test") ||
      t.includes("midsem") ||
      t.includes("endsem")
    ) {
      return "Exams";
    }
  }

  // Step 2: ACADEMIC
  if (isVisible("Academic") || isVisible("Academics")) {
    // Keep academics keywords focused on coursework-related terms (avoid 'project' and ambiguous 'submission')
    if (
      t.includes("syllabus") ||
      t.includes("assignment") ||
      t.includes("lab") ||
      t.includes("practical") ||
      t.includes("lecture") ||
      t.includes("tutorial")
    ) {
      // return the label as present in visible categories if possible
      if (visible.has("Academic")) return "Academic";
      if (visible.has("Academics")) return "Academics";
      return "Academic";
    }
  }

  // Step 3: enabled optional categories (only evaluate those visible)
  // Define keywords per optional category
  const optionalChecks = [];

  if (optionalVisible("Placements") || optionalVisible("Career")) {
    optionalChecks.push({
      name: visible.has("Placements") ? "Placements" : "Career",
      keywords: ["internship", "intern", "placement", "interview", "job", "career", "resume", "cv", "offer","Online Assessment","OA"]
    });
  }

  if (optionalVisible("Clubs")) {
    optionalChecks.push({
      name: "Clubs",
      keywords: ["club", "society", "team", "cc", "cell", "committee", "meeting", "briefing"]
    });
  }

  if (optionalVisible("Projects")) {
    optionalChecks.push({
      name: "Projects",
      keywords: ["project", "milestone", "deliverable", "repo", "repository", "git", "submission", "deadline"]
    });
  }

  if (optionalVisible("Personal")) {
    optionalChecks.push({
      name: "Personal",
      keywords: ["birthday", "anniversary", "call", "appointment", "personal", "doctor", "family", "gym"]
    });
  }

  // Evaluate optional checks and collect matches
  const matches = [];
  for (const opt of optionalChecks) {
    for (const kw of opt.keywords) {
      if (t.includes(kw)) {
        matches.push(opt.name);
        break;
      }
    }
  }

  // Step 4: If multiple enabled categories match, use deterministic priority
  if (matches.length > 0) {
    const priority = ["Placements", "Career", "Projects", "Clubs", "Personal"];
    for (const p of priority) {
      if (matches.includes(p)) return p;
    }
    // fallback to first match
    return matches[0];
  }

  // Step 5: default -> Events (ensure Events is visible)
  if (isVisible("Events")) return "Events";

  // If Events not visible for some reason, fall back to first visible category
  if (visibleCategories && visibleCategories.length > 0) return visibleCategories[0];

  return "Events";
}
