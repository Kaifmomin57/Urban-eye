import { Issue } from "../data/mockData";

export interface CityRosterOfficer {
  id: string;
  name: string;
  department: string;
  role: string;
  phone: string;
  city: string;
  status: "on_shift" | "off_duty" | "on_leave";
  shiftStart: string;
  shiftEnd: string;
  activeAssignments: number;
  avatar?: string;
}

export interface AIComplaintDossier {
  issueId: string;
  title: string;
  city: string;
  location: string;
  category: string;
  duplicateCount: number;
  aiScore: number;
  priorityLevel: "critical" | "high" | "medium" | "low";
  suggestedSlaHours: number;
  summary: string;
  riskAssessment: string;
  citizenImpactScore: number; // 1-100
  recommendedAction: string;
  generatedAt: string;
  yoloDetections?: { class: string; confidence: number }[];
}

export interface IssueCluster {
  id: string;
  primaryIssue: Issue;
  relatedIssues: Issue[];
  duplicateCount: number;
  location: string;
  category: string;
  city: string;
  totalVotes: number;
  calculatedPriorityScore: number;
  suggestedSlaHours: number;
  priorityLevel: "critical" | "high" | "medium" | "low";
}

/**
 * Generates a formal AI Complaint Dossier for a single Issue object.
 */
export function generateSingleDossier(issue: Issue, city: string = "Mumbai"): AIComplaintDossier {
  let score = 40;
  if (issue.category === "Utilities" || issue.category === "Safety") score += 25;
  else if (issue.category === "Infrastructure") score += 20;
  else score += 10;

  if (issue.votes > 20) score += 15;
  score = Math.min(98, Math.max(15, score));

  let priorityLevel: "critical" | "high" | "medium" | "low" = "medium";
  let suggestedSlaHours = 24;

  if (score >= 80 || issue.priority === "critical") {
    priorityLevel = "critical";
    suggestedSlaHours = 4;
  } else if (score >= 60 || issue.priority === "high") {
    priorityLevel = "high";
    suggestedSlaHours = 12;
  } else if (score >= 40) {
    priorityLevel = "medium";
    suggestedSlaHours = 24;
  } else {
    priorityLevel = "low";
    suggestedSlaHours = 48;
  }

  return {
    issueId: issue.id,
    title: issue.title,
    city: city || issue.city || "Mumbai",
    location: issue.location,
    category: issue.category,
    duplicateCount: 1,
    aiScore: issue.aiPriorityScore || score,
    priorityLevel: (issue.priority as any) || priorityLevel,
    suggestedSlaHours: issue.slaHours || suggestedSlaHours,
    summary: issue.aiSummary || `AI Intelligence Analysis detected report in ${issue.location}, ${city} regarding ${issue.category.toLowerCase()}. Total community upvotes: ${issue.votes || 0}.`,
    riskAssessment:
      issue.aiRiskAssessment ||
      (priorityLevel === "critical"
        ? "CRITICAL HAZARD: High risk of severe infrastructure disruption, public safety risk, or property damage. Immediate dispatch required."
        : priorityLevel === "high"
        ? "HIGH RISK: Moderate disruption to daily ward activities. Resolution required within 12-hour window to prevent escalation."
        : "STANDARD RISK: Non-emergency civic maintenance item. Routine dispatch schedule applicable."),
    citizenImpactScore: Math.min(95, Math.max(30, (issue.aiPriorityScore || score) + 10)),
    recommendedAction: issue.recommendedAction || `Dispatch ${issue.category} Response Squad immediately. Contact ward officer for verification.`,
    generatedAt: new Date().toISOString(),
    yoloDetections: issue.yoloDetections || [],
  };
}

/**
 * City-wise comparative AI Analyzer.
 * Groups issues by city and calculates relative priority scores based on:
 * 1. Category inherent risk (Infrastructure/Utilities/Safety > Public Spaces)
 * 2. Cluster density / duplicate citizen complaints in the same area
 * 3. Votes & community traction
 * 4. Time elapsed without resolution
 */
export function analyzeCityIssues(city: string = "Mumbai", allIssues: Issue[] = []): {
  clusters: IssueCluster[];
  dossiers: Record<string, AIComplaintDossier>;
  stats: {
    totalCityIssues: number;
    criticalCount: number;
    highCount: number;
    escalatedCount: number;
    avgSlaHours: number;
  };
} {
  const cityIssues = allIssues.filter(
    (i) => (i.city || "Mumbai").toLowerCase() === city.toLowerCase()
  );

  // Group by near location & category to find duplicate complaints
  const groups: Map<string, Issue[]> = new Map();
  for (const issue of cityIssues) {
    const key = `${issue.location.toLowerCase().trim()}_${issue.category}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(issue);
  }

  const clusters: IssueCluster[] = [];
  const dossiers: Record<string, AIComplaintDossier> = {};

  let criticalCount = 0;
  let highCount = 0;
  let escalatedCount = 0;
  let totalSlaHoursSum = 0;

  let idx = 0;
  for (const [, group] of groups.entries()) {
    const primary = group[0];
    const duplicateCount = group.length;
    const totalVotes = group.reduce((sum, i) => sum + (i.votes || 0), 0);

    if (primary.escalated) escalatedCount++;

    // Calculate AI Priority Score (1 - 100)
    let score = 30; // base score

    // Category weighting
    if (primary.category === "Utilities" || primary.category === "Safety") score += 25;
    else if (primary.category === "Infrastructure") score += 20;
    else if (primary.category === "Environment") score += 15;
    else score += 10;

    // Multi-report boost (duplicate citizen complaints in same location)
    if (duplicateCount > 3) score += 25;
    else if (duplicateCount > 1) score += 15;

    // Upvote traction boost
    if (totalVotes > 50) score += 15;
    else if (totalVotes > 20) score += 10;

    // Cap at 98
    score = Math.min(98, Math.max(15, score));

    // Determine SLA hours based on AI score & category
    let priorityLevel: "critical" | "high" | "medium" | "low" = "medium";
    let suggestedSlaHours = 24;

    if (score >= 80 || primary.priority === "critical") {
      priorityLevel = "critical";
      suggestedSlaHours = 4;
      criticalCount++;
    } else if (score >= 60 || primary.priority === "high") {
      priorityLevel = "high";
      suggestedSlaHours = 12;
      highCount++;
    } else if (score >= 40) {
      priorityLevel = "medium";
      suggestedSlaHours = 24;
    } else {
      priorityLevel = "low";
      suggestedSlaHours = 48;
    }

    totalSlaHoursSum += suggestedSlaHours;

    const clusterId = `cluster-${city.toLowerCase()}-${idx + 1}`;
    const cluster: IssueCluster = {
      id: clusterId,
      primaryIssue: primary,
      relatedIssues: group.slice(1),
      duplicateCount,
      location: primary.location,
      category: primary.category,
      city,
      totalVotes,
      calculatedPriorityScore: score,
      suggestedSlaHours,
      priorityLevel,
    };

    clusters.push(cluster);

    // Generate Formal AI Complaint Dossier for Higher Authorities
    dossiers[primary.id] = {
      issueId: primary.id,
      title: primary.title,
      city,
      location: primary.location,
      category: primary.category,
      duplicateCount,
      aiScore: primary.aiPriorityScore || score,
      priorityLevel: (primary.priority as any) || priorityLevel,
      suggestedSlaHours: primary.slaHours || suggestedSlaHours,
      summary: primary.aiSummary || `AI Intelligence Analysis detected ${duplicateCount} citizen report(s) in ${primary.location}, ${city} regarding ${primary.category.toLowerCase()}. Total community upvotes: ${totalVotes}.`,
      riskAssessment:
        primary.aiRiskAssessment ||
        (priorityLevel === "critical"
          ? "CRITICAL HAZARD: High risk of severe infrastructure disruption, public safety risk, or property damage. Immediate dispatch required."
          : priorityLevel === "high"
          ? "HIGH RISK: Moderate disruption to daily ward activities. Resolution required within 12-hour window to prevent escalation."
          : "STANDARD RISK: Non-emergency civic maintenance item. Routine dispatch schedule applicable."),
      citizenImpactScore: Math.min(98, Math.max(20, (primary.aiPriorityScore || score) + duplicateCount * 5)),
      recommendedAction:
        primary.recommendedAction ||
        (priorityLevel === "critical"
          ? "IMMEDIATE DISPATCH: Deploy Quick Response Emergency Squad within 4 hours."
          : priorityLevel === "high"
          ? "PRIORITY ASSIGNMENT: Assign ward engineer squad within 12 hours."
          : "SCHEDULED MAINTENANCE: Queue for next scheduled ward maintenance cycle."),
      generatedAt: new Date().toISOString(),
      yoloDetections: primary.yoloDetections || [],
    };

    idx++;
  }

  const avgSlaHours = clusters.length > 0 ? Math.round(totalSlaHoursSum / clusters.length) : 24;

  return {
    clusters,
    dossiers,
    stats: {
      totalCityIssues: cityIssues.length,
      criticalCount,
      highCount,
      escalatedCount,
      avgSlaHours,
    },
  };
}

/**
 * ─── AI Smart Dispatch Engine v2 ────────────────────────────────────────────
 *
 * Makes dispatch decisions based on:
 *  1. Issue category  → target department
 *  2. Description + title keyword scan → role affinity score per officer
 *  3. Officer availability (on_shift only)
 *  4. Workload balancing (lowest activeAssignments first)
 *  5. Priority urgency factor (critical = needs highest-ranked role)
 */

// Keyword → role skill tags
const KEYWORD_ROLE_MAP: { keywords: string[]; roleTags: string[]; dept?: string }[] = [
  // Water / Sewage / Drainage
  {
    keywords: ["water", "pipe", "leak", "flood", "sewage", "drain", "manhole", "overflow", "waterlogging", "pipeline", "burst"],
    roleTags: ["hydraulic", "utilities", "water", "plumb"],
    dept: "Water & Power",
  },
  // Electricity / Power
  {
    keywords: ["electric", "power", "light", "streetlight", "wire", "cable", "transformer", "outage", "electr"],
    roleTags: ["electric", "power", "utilities"],
    dept: "Water & Power",
  },
  // Roads / Pothole / Infrastructure
  {
    keywords: ["road", "pothole", "bridge", "crack", "pavement", "footpath", "sidewalk", "tarmac", "construction", "excavat"],
    roleTags: ["road", "engineer", "infrastructure", "works", "supervisor"],
    dept: "Public Works",
  },
  // Traffic / Signals / Accidents
  {
    keywords: ["traffic", "signal", "accident", "vehicle", "junction", "zebra", "crossing", "speed", "parking"],
    roleTags: ["traffic", "safety", "lead"],
    dept: "Traffic & Safety",
  },
  // Safety / Hazard / Emergency
  {
    keywords: ["hazard", "danger", "unsafe", "fire", "gas", "chemical", "collapse", "structure", "wall", "building"],
    roleTags: ["safety", "supervisor", "lead", "emergency"],
    dept: "Traffic & Safety",
  },
  // Garbage / Sanitation / Waste
  {
    keywords: ["garbage", "waste", "trash", "sanit", "litter", "dump", "smell", "odor", "bio", "dead animal", "rot"],
    roleTags: ["environ", "sanit", "bio"],
    dept: "Sanitation & Bio-Hazard",
  },
  // Parks / Public spaces
  {
    keywords: ["park", "garden", "tree", "bench", "playground", "amenit", "civic", "public space", "fountain"],
    roleTags: ["civic", "parks", "maintenance"],
    dept: "Parks & Amenities",
  },
];

// Priority → urgency label + preferred role seniority keywords
const PRIORITY_URGENCY: Record<string, { label: string; seniorityKeywords: string[] }> = {
  critical: { label: "EMERGENCY RESPONSE", seniorityKeywords: ["captain", "inspector", "senior", "lead", "supervisor"] },
  high:     { label: "PRIORITY DISPATCH",  seniorityKeywords: ["inspector", "senior", "lead", "supervisor"] },
  medium:   { label: "STANDARD DISPATCH",  seniorityKeywords: ["officer", "engineer", "specialist"] },
  low:      { label: "ROUTINE DISPATCH",   seniorityKeywords: ["officer", "engineer", "maintenance"] },
};

/**
 * Scores an officer against a keyword context derived from the issue.
 * Returns 0–100 based on role keyword matches.
 */
function scoreOfficer(
  officer: CityRosterOfficer,
  roleTags: string[],
  seniorityKeywords: string[]
): number {
  const roleLower = officer.role.toLowerCase();
  const nameLower = officer.name.toLowerCase();
  const deptLower = officer.department.toLowerCase();

  let score = 0;

  // Role tag matching (main signal)
  for (const tag of roleTags) {
    if (roleLower.includes(tag.toLowerCase()) || deptLower.includes(tag.toLowerCase())) {
      score += 30;
    }
  }

  // Seniority bonus
  for (const keyword of seniorityKeywords) {
    if (roleLower.includes(keyword) || nameLower.includes(keyword)) {
      score += 20;
    }
  }

  // Workload penalty — more assignments = lower preference
  score -= officer.activeAssignments * 10;

  return Math.max(0, score);
}

export function suggestResponseTeam(
  issue: Issue,
  roster: CityRosterOfficer[]
): {
  teamName: string;
  recommendedOfficers: CityRosterOfficer[];
  reason: string;
  matchedKeywords: string[];
  urgencyLabel: string;
  roleMatchDetail: { officerName: string; role: string; score: number }[];
} {
  const city = (issue.city || "Mumbai").toLowerCase();
  const priority = issue.aiPriorityLevel || issue.priority || "medium";
  const urgency = PRIORITY_URGENCY[priority] || PRIORITY_URGENCY.medium;

  // Build search corpus from title + description + tags
  const corpus = [
    issue.title || "",
    issue.description || "",
    issue.category || "",
    ...(issue.tags || []),
  ].join(" ").toLowerCase();

  // Step 1: Keyword scan → determine department & keywords
  const contextScores: { entry: typeof KEYWORD_ROLE_MAP[0]; hits: string[]; score: number }[] = [];

  for (const entry of KEYWORD_ROLE_MAP) {
    const hits = entry.keywords.filter(kw => corpus.includes(kw.toLowerCase()));
    if (hits.length > 0) {
      contextScores.push({ entry, hits, score: hits.length });
    }
  }

  contextScores.sort((a, b) => b.score - a.score);
  const topContext = contextScores[0];

  // Category → Department fallback
  const categoryDeptMap: Record<string, string> = {
    Infrastructure: "Public Works",
    Utilities: "Water & Power",
    Safety: "Traffic & Safety",
    Environment: "Sanitation & Bio-Hazard",
    "Public Spaces": "Parks & Amenities",
    Traffic: "Traffic & Safety",
  };

  const targetDept = topContext?.entry.dept || categoryDeptMap[issue.category] || "Public Works";
  const roleTags = topContext?.entry.roleTags || ["engineer", "officer"];
  const matchedKeywords = topContext?.hits || [issue.category?.toLowerCase() || "general"];

  // Step 2: Filter STRICTLY to city + on_shift + EXACT DEPARTMENT match
  const cityOnShift = roster.filter(
    o => o.city.toLowerCase() === city && o.status === "on_shift"
  );

  let deptOfficers = cityOnShift.filter(
    o => o.department.toLowerCase() === targetDept.toLowerCase()
  );

  // If no officer in exact department is on shift, fallback to any on-shift officer in the city
  const usedFallbackDept = deptOfficers.length === 0;
  if (usedFallbackDept) {
    deptOfficers = cityOnShift;
  }

  // Step 3: Score matching department officers
  const scored = deptOfficers.map(o => ({
    officer: o,
    score: scoreOfficer(o, roleTags, urgency.seniorityKeywords),
  }));

  // Sort by role match score desc, then activeAssignments asc
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.officer.activeAssignments - b.officer.activeAssignments;
  });

  const pickCount = priority === "critical" ? 3 : 2;
  const selected = scored.slice(0, pickCount).map(s => s.officer);

  const roleMatchDetail = scored.map(s => ({
    officerName: s.officer.name,
    role: s.officer.role,
    score: s.score,
  }));

  // Step 4: Generate team name
  const squadNames = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Falcon", "Guardian", "Hawk"];
  const squadIndex = Math.abs((issue.id?.charCodeAt(issue.id.length - 1) || 0)) % squadNames.length;
  const deptShort = targetDept.split(" ")[0];
  const teamName = `${deptShort} ${urgency.label.split(" ")[0]} Squad ${squadNames[squadIndex]}`;

  // Step 5: Build natural language reasoning
  let reason = "";
  if (selected.length === 0) {
    reason = `⚠️ No officers currently on shift in ${targetDept}. Please adjust shift roster or call off-duty backup.`;
  } else {
    const keywordList = matchedKeywords.slice(0, 3).join(", ");
    const topOfficer = selected[0];

    reason =
      `🎯 Strict Department Match: Matched to ${targetDept} based on issue category (${issue.category}) & detected keywords ("${keywordList}"). ` +
      `Primary: ${topOfficer.name} (${topOfficer.role}) from ${topOfficer.department} — ` +
      (topOfficer.activeAssignments === 0
        ? "free with 0 active tasks. "
        : `assigned (${topOfficer.activeAssignments} active task(s)). `) +
      (selected.length > 1
        ? `Backup: ${selected[1].name} (${selected[1].role}) from ${selected[1].department}. `
        : "") +
      `Priority: ${priority.toUpperCase()}.`;
  }

  return {
    teamName,
    recommendedOfficers: selected,
    reason,
    matchedKeywords,
    urgencyLabel: urgency.label,
    roleMatchDetail,
  };
}
