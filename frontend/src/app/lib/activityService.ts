export type ActivityType =
  | "issue_reported"
  | "issue_deleted"
  | "issue_upvoted"
  | "status_changed"
  | "fake_reported"
  | "reward_redeemed"
  | "profile_updated";

export interface UserActivity {
  id: string;
  uid: string;
  type: ActivityType;
  label: string;       // Human-readable description
  date: string;        // Local YYYY-MM-DD for easy heatmap lookup
  timestamp: string;   // Full ISO timestamp
  issueId?: string;    // Related issue (if applicable)
}

/** Format a Date to local YYYY-MM-DD. */
export function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function logActivity(
  _uid: string,
  _type: ActivityType,
  _label: string,
  _issueId?: string
): Promise<void> {
  // Pure local state logging
}

export function subscribeToActivities(
  _uid: string,
  callback: (activities: UserActivity[]) => void
): () => void {
  callback([]);
  return () => {};
}
