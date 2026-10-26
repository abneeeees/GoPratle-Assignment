import { z } from "zod";
import {
  BUDGET_FLEXIBILITY,
  CATEGORIES,
  CREW_ROLES,
  DATE_MODES,
  EVENT_TYPES,
  EXPERIENCE_LEVELS,
  PERFORMER_TYPES,
  PLANNER_CONTRACT_TYPES,
  PLANNER_SERVICES,
  SKILL_LEVELS,
} from "./constants";

/**
 * Client-side mirror of `backend/src/schemas/requirement.ts`.
 *
 * Used for per-step gating (so the user never reaches step 4 with a broken
 * step 1) and to build the payload. The server re-validates everything — this
 * schema is a UX convenience, not a security boundary.
 */

export const dateString = z
  .string({ required_error: "Pick a date" })
  .min(1, "Pick a date")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD format");

export const today = () => new Date().toISOString().slice(0, 10);

const requiredText = (label: string, min: number, max: number) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters`)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));

const number = (
  label: string,
  { min = 0, max = 1_000_000_000, int = false }: { min?: number; max?: number; int?: boolean } = {},
) =>
  z
    .number({
      required_error: `${label} is required`,
      invalid_type_error: `${label} is required`,
    })
    .refine((value) => !Number.isNaN(value), `${label} is required`)
    .refine((value) => !int || Number.isInteger(value), `${label} must be a whole number`)
    .refine((value) => value >= min, `${label} must be at least ${min}`)
    .refine((value) => value <= max, `${label} must be at most ${max}`);

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .refine((value) => value === undefined || z.string().url().safeParse(value).success, {
    message: "Enter a valid URL (including https://)",
  });

/**
 * An optional date. An empty string means "not set" — a date input that was
 * cleared still submits `""`, and sending that to the API used to fail with
 * "Use the YYYY-MM-DD format" even though the client thought it was valid.
 */
const optionalDate = z
  .string()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .refine((value) => value === undefined || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Use the YYYY-MM-DD format",
  });

export const basicsSchema = z
  .object({
    eventName: requiredText("Event name", 3, 120),
    eventType: z.enum(EVENT_TYPES, { errorMap: () => ({ message: "Choose an event type" }) }),
    dateMode: z.enum(DATE_MODES),
    startDate: dateString,
    endDate: optionalDate,
    city: requiredText("City", 2, 80),
    state: optionalText(80),
    country: requiredText("Country", 2, 80),
    venue: optionalText(120),
  })
  .superRefine((value, ctx) => {
    if (value.dateMode === "range") {
      if (!value.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date is required for a date range",
        });
        return;
      }
      if (value.endDate < value.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date cannot be before the start date",
        });
      }
    } else if (value.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Clear the end date for a single-day event",
      });
    }

    if (value.startDate && value.startDate < today()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Start date cannot be in the past",
      });
    }
  });

export const plannerSchema = z
  .object({
    guestCount: number("Guest count", { min: 1, max: 1_000_000, int: true }),
    budgetMin: number("Minimum budget", { min: 0 }),
    budgetMax: number("Maximum budget", { min: 0 }),
    services: z
      .array(z.enum(PLANNER_SERVICES))
      .min(1, "Select at least one service")
      .max(PLANNER_SERVICES.length),
    experienceLevel: z.enum(EXPERIENCE_LEVELS, {
      errorMap: () => ({ message: "Choose an experience level" }),
    }),
  })
  .superRefine((value, ctx) => {
    if (!Number.isNaN(value.budgetMin) && !Number.isNaN(value.budgetMax) && value.budgetMax < value.budgetMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["budgetMax"],
        message: "Maximum budget cannot be lower than the minimum",
      });
    }
  });

export const performerSchema = z.object({
  performerType: z.enum(PERFORMER_TYPES, {
    errorMap: () => ({ message: "Choose a performer type" }),
  }),
  genre: requiredText("Genre / style", 2, 80),
  setDurationMinutes: number("Set duration", { min: 5, max: 1440, int: true }),
  feeExpectation: number("Fee expectation", { min: 0 }),
  ownEquipment: z.boolean(),
  portfolioUrl: optionalUrl,
});

export const crewSchema = z.object({
  role: z.enum(CREW_ROLES, { errorMap: () => ({ message: "Choose a crew role" }) }),
  headcount: number("Headcount", { min: 1, max: 500, int: true }),
  shiftHours: number("Shift length", { min: 1, max: 24 }),
  skillLevel: z.enum(SKILL_LEVELS, { errorMap: () => ({ message: "Choose a skill level" }) }),
  dailyRate: number("Daily rate", { min: 0 }),
  ownGear: z.boolean(),
});

export const logisticsSchema = z.object({
  responseDeadline: dateString,
  budgetFlexibility: z.enum(BUDGET_FLEXIBILITY, {
    errorMap: () => ({ message: "Choose a budget flexibility" }),
  }),
  travelCovered: z.boolean(),
  contactName: requiredText("Contact name", 2, 80),
  contactEmail: z
    .string({ required_error: "Contact email is required" })
    .trim()
    .min(1, "Contact email is required")
    .email("Enter a valid email address"),
  contactPhone: optionalText(20),
  notes: optionalText(2000),
  plannerContractType: z.enum(PLANNER_CONTRACT_TYPES).optional(),
  performerSoundcheck: z.boolean().optional(),
  crewEquipmentProvided: z.boolean().optional(),
});

export const detailsSchemaByCategory = {
  planner: plannerSchema,
  performer: performerSchema,
  crew: crewSchema,
} as const;

export const stepOneSchema = z.object({
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: "Choose a category" }) }),
  basics: basicsSchema,
});

export const requirementSchema = z
  .object({
    category: z.enum(CATEGORIES, { errorMap: () => ({ message: "Choose a category" }) }),
    basics: basicsSchema,
    planner: plannerSchema.optional(),
    performer: performerSchema.optional(),
    crew: crewSchema.optional(),
    logistics: logisticsSchema,
  })
  .superRefine((value, ctx) => {
    for (const block of CATEGORIES) {
      if (block !== value.category && value[block] !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [block],
          message: `A ${block} block is not allowed for a ${value.category} requirement`,
        });
      }
    }
    if (value[value.category] === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [value.category],
        message: "Category details are missing",
      });
    }
    if (value.logistics.responseDeadline && value.logistics.responseDeadline < today()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["logistics", "responseDeadline"],
        message: "Response deadline cannot be in the past",
      });
    }
  })
  .transform((value) => {
    const logistics = { ...value.logistics };
    if (value.category !== "planner") delete logistics.plannerContractType;
    if (value.category !== "performer") delete logistics.performerSoundcheck;
    if (value.category !== "crew") delete logistics.crewEquipmentProvided;
    return { ...value, logistics };
  });

export type RequirementPayload = z.infer<typeof requirementSchema>;

/** `zod` issues -> flat `{ "basics.endDate": "message" }` map. */
export function issuesToErrorMap(
  issues: readonly z.ZodIssue[],
  prefix = "",
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of issues) {
    const path = [prefix, issue.path.join(".")].filter(Boolean).join(".");
    if (!map[path]) map[path] = issue.message;
  }
  return map;
}

