/**
 * Domain constants shared by the API. Kept in sync by hand with
 * `frontend/src/lib/constants.ts` (see README -> "Known trade-offs").
 */

export const CATEGORIES = ["planner", "performer", "crew"] as const;
export type Category = (typeof CATEGORIES)[number];

export const EVENT_TYPES = [
  "Wedding",
  "Corporate Event",
  "Concert / Live Show",
  "Conference",
  "Birthday Party",
  "Festival",
  "Exhibition",
  "Private Party",
  "Other",
] as const;

export const DATE_MODES = ["single", "range"] as const;

export const PLANNER_SERVICES = [
  "Venue sourcing",
  "Vendor management",
  "Budget planning",
  "On-site coordination",
  "Design & decor",
  "Guest management",
  "Logistics & permits",
] as const;

export const EXPERIENCE_LEVELS = ["Any", "Intermediate", "Expert"] as const;

export const PERFORMER_TYPES = [
  "Singer",
  "Live Band",
  "DJ",
  "Dancer / Dance Troupe",
  "Magician",
  "Comedian",
  "MC / Host",
  "Other",
] as const;

export const CREW_ROLES = [
  "Photographer",
  "Videographer",
  "Sound Engineer",
  "Lighting Technician",
  "AV Technician",
  "Stage Hand",
  "Makeup Artist",
  "Other",
] as const;

export const SKILL_LEVELS = ["Beginner", "Intermediate", "Expert"] as const;

export const BUDGET_FLEXIBILITY = [
  "Fixed",
  "Somewhat flexible",
  "Negotiable",
] as const;

export const PLANNER_CONTRACT_TYPES = ["One-time", "Ongoing retainer"] as const;
