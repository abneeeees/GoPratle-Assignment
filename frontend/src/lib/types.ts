import type { Category } from "./constants";

export interface BasicsValues {
  eventName: string;
  eventType: string;
  dateMode: "single" | "range";
  startDate: string;
  endDate: string;
  city: string;
  state: string;
  country: string;
  venue: string;
}

export interface PlannerValues {
  guestCount: number;
  budgetMin: number;
  budgetMax: number;
  services: string[];
  experienceLevel: string;
}

export interface PerformerValues {
  performerType: string;
  genre: string;
  setDurationMinutes: number;
  feeExpectation: number;
  ownEquipment: boolean;
  portfolioUrl?: string;
}

export interface CrewValues {
  role: string;
  headcount: number;
  shiftHours: number;
  skillLevel: string;
  dailyRate: number;
  ownGear: boolean;
}

export interface LogisticsValues {
  responseDeadline: string;
  budgetFlexibility: string;
  travelCovered: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  notes?: string;
  plannerContractType?: string;
  performerSoundcheck?: boolean;
  crewEquipmentProvided?: boolean;
}

export interface FormValues {
  category: Category | "";
  basics: BasicsValues;
  planner?: Partial<PlannerValues>;
  performer?: Partial<PerformerValues>;
  crew?: Partial<CrewValues>;
  logistics: LogisticsValues;
}

export function emptyFormValues(): FormValues {
  return {
    category: "",
    basics: {
      eventName: "",
      eventType: "",
      dateMode: "single",
      startDate: "",
      endDate: "",
      city: "",
      state: "",
      country: "India",
      venue: "",
    },
    logistics: {
      responseDeadline: "",
      budgetFlexibility: "",
      travelCovered: false,
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      notes: "",
    },
  };
}

export function emptyCategoryValues(category: Category): Partial<FormValues> {
  switch (category) {
    case "planner":
      return { planner: { services: [], experienceLevel: "" } };
    case "performer":
      return { performer: { performerType: "", genre: "", ownEquipment: false, portfolioUrl: "" } };
    case "crew":
      return { crew: { role: "", skillLevel: "", ownGear: false } };
  }
}

/* ------------------------------------------------------------------ */
/* Read models returned by the API                                     */
/* ------------------------------------------------------------------ */

export interface RequirementBasics {
  eventName: string;
  eventType: string;
  dateMode: "single" | "range";
  startDate: string;
  endDate: string | null;
  city: string;
  state: string | null;
  country: string;
  venue: string | null;
}

export interface RequirementLogistics {
  responseDeadline: string;
  budgetFlexibility: string;
  travelCovered: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  notes: string | null;
  plannerContractType: string | null;
  performerSoundcheck: boolean | null;
  crewEquipmentProvided: boolean | null;
}

export interface Requirement {
  id: string;
  category: Category;
  basics: RequirementBasics;
  planner: PlannerValues | null;
  performer: PerformerValues | null;
  crew: CrewValues | null;
  logistics: RequirementLogistics;
  createdAt: string;
  updatedAt: string;
}

export interface ListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Stats {
  total: number;
  byCategory: Record<Category, number>;
}
