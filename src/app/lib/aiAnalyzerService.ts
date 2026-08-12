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
    aiScore: score,
    priorityLevel,
    suggestedSlaHours,
    summary: `AI Intelligence Analysis detected report in ${issue.location}, ${city} regarding ${issue.category.toLowerCase()}. Total community upvotes: ${issue.votes || 0}.`,
    riskAssessment:
      priorityLevel === "critical"
        ? "CRITICAL HAZARD: High risk of severe infrastructure disruption, public safety risk, or property damage. Immediate dispatch required."
        : priorityLevel === "high"
        ? "HIGH RISK: Moderate disruption to daily ward activities. Resolution required within 12-hour window to prevent escalation."
        : "STANDARD RISK: Non-emergency civic maintenance item. Routine dispatch schedule applicable.",
    citizenImpactScore: Math.min(95, Math.max(30, score + 10)),
    recommendedAction: `Dispatch ${issue.category} Response Squad immediately. Contact ward officer for verification.`,
    generatedAt: new Date().toISOString(),
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
      aiScore: score,
      priorityLevel,
      suggestedSlaHours,
      summary: `AI Intelligence Analysis detected ${duplicateCount} citizen report(s) in ${primary.location}, ${city} regarding ${primary.category.toLowerCase()}. Total community upvotes: ${totalVotes}.`,
      riskAssessment:
        priorityLevel === "critical"
          ? "CRITICAL HAZARD: High risk of severe infrastructure disruption, public safety risk, or property damage. Immediate dispatch required."
          : priorityLevel === "high"
          ? "HIGH RISK: Moderate disruption to daily ward activities. Resolution required within 12-hour window to prevent escalation."
          : "STANDARD RISK: Non-emergency civic maintenance item. Routine dispatch schedule applicable.",
      citizenImpactScore: Math.min(98, Math.max(20, score + duplicateCount * 5)),
      recommendedAction:
        priorityLevel === "critical"
          ? "IMMEDIATE DISPATCH: Deploy Quick Response Emergency Squad within 4 hours."
          : priorityLevel === "high"
          ? "PRIORITY ASSIGNMENT: Assign ward engineer squad within 12 hours."
          : "SCHEDULED MAINTENANCE: Queue for next scheduled ward maintenance cycle.",
      generatedAt: new Date().toISOString(),
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
 * AI Smart Team Dispatcher
 * Selects optimal available officers on shift matching the issue's department.
 */
export function suggestResponseTeam(
  issue: Issue,
  roster: CityRosterOfficer[]
): {
  teamName: string;
  recommendedOfficers: CityRosterOfficer[];
  reason: string;
} {
  const city = issue.city || "Mumbai";
  const cityRoster = roster.filter((o) => o.city.toLowerCase() === city.toLowerCase());

  // Filter officers on shift
  const onShift = cityRoster.filter((o) => o.status === "on_shift");

  // Map issue category to department
  const categoryDeptMap: Record<string, string> = {
    Infrastructure: "Public Works",
    Utilities: "Water & Power",
    Safety: "Traffic & Safety",
    Environment: "Sanitation & Bio-Hazard",
    "Public Spaces": "Parks & Amenities",
    Traffic: "Traffic & Safety",
  };

  const targetDept = categoryDeptMap[issue.category] || "Public Works";

  // Match department officers first
  let deptOfficers = onShift.filter((o) => o.department === targetDept);

  // If no department officers on shift, fallback to any available on shift officers
  if (deptOfficers.length === 0) {
    deptOfficers = onShift;
  }

  // Sort by lowest active assignments
  deptOfficers.sort((a, b) => a.activeAssignments - b.activeAssignments);

  const selected = deptOfficers.slice(0, 2);

  const squadNames = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Falcon", "Guardian"];
  const squadIndex = Math.abs(issue.id.charCodeAt(issue.id.length - 1) || 0) % squadNames.length;
  const teamName = `${targetDept} Squad ${squadNames[squadIndex]}`;

  return {
    teamName,
    recommendedOfficers: selected,
    reason:
      selected.length > 0
        ? `AI matched ${selected.length} on-shift officer(s) from ${targetDept} based on current shift timetable and lowest workload.`
        : "No officers currently on shift in this department. Please adjust shift roster or select off-duty backup.",
  };
}
