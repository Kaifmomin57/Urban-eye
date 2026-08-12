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
    avgSlaHours: number;
    escalatedCount: number;
  };
} {
  const targetCity = (city || "Mumbai").toLowerCase();
  // Filter issues belonging to the selected city (default to Mumbai if unspecified)
  const cityIssues = (allIssues || []).filter(
    (i) => (i.city || "Mumbai").toLowerCase() === targetCity
  );

  // Group similar issues by location/category proximity
  const clusterMap: Record<string, Issue[]> = {};

  cityIssues.forEach((issue) => {
    // Key by category + basic location normalized
    const locKey = issue.location.split(",")[0].trim().toLowerCase();
    const key = `${issue.category.toLowerCase()}-${locKey}`;

    if (!clusterMap[key]) {
      clusterMap[key] = [];
    }
    clusterMap[key].push(issue);
  });

  const clusters: IssueCluster[] = [];
  const dossiers: Record<string, AIComplaintDossier> = {};

  let criticalCount = 0;
  let highCount = 0;
  let escalatedCount = 0;
  let totalSlaHoursSum = 0;

  Object.entries(clusterMap).forEach(([key, group], idx) => {
    // Sort group by votes and creation date to find primary issue
    group.sort((a, b) => (b.votes || 0) - (a.votes || 0));
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
      citizenImpactScore: Math.min(100, score + duplicateCount * 5),
      recommendedAction: `Deploy ${primary.category} Emergency Response Squad. Target Action SLA: ${suggestedSlaHours} Hours. Dispatch formal status updates to ${duplicateCount} reporting citizen(s).`,
      generatedAt: new Date().toISOString(),
    };
  });

  // Sort clusters by highest AI Priority Score first
  clusters.sort((a, b) => b.calculatedPriorityScore - a.calculatedPriorityScore);

  return {
    clusters,
    dossiers,
    stats: {
      totalCityIssues: cityIssues.length,
      criticalCount,
      highCount,
      avgSlaHours: clusters.length ? Math.round(totalSlaHoursSum / clusters.length) : 24,
      escalatedCount,
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
