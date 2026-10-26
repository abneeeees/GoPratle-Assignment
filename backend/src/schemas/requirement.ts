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
} from "../constants";

/**
 * Server-side schema. This is the authoritative contract: the client mirrors
 * these rules for instant feedback, but a request that fails here never
 * reaches MongoDB.
 */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD format");

/**
 * Some clients send `""` for a cleared optional date input. Treat that as
 * "not provided" instead of rejecting it, while still validating any value
 * that is present.
 */
const optionalIsoDate = z
  .string()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .refine((value) => value === undefined || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Use the YYYY-MM-DD format",
  });

const today = () => new Date().toISOString().slice(0, 10);

const text = (label: string, min: number, max: number) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters`)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));

/** Numbers arrive as JSON numbers; strings/NaN are rejected at the boundary. */
const number = (
  label: string,
  { min = 0, max = 1_000_000_000, int = false }: { min?: number; max?: number; int?: boolean } = {},
) =>
  z
    .number({
      required_error: `${label} is required`,
      invalid_type_error: `${label} must be a number`,
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

export const basicsSchema = z
  .object({
    eventName: text("Event name", 3, 120),
    eventType: z.enum(EVENT_TYPES, {
      errorMap: () => ({ message: "Choose a valid event type" }),
    }),
    dateMode: z.enum(DATE_MODES, {
      errorMap: () => ({ message: "Choose a single day or a date range" }),
    }),
    startDate: isoDate,
    endDate: optionalIsoDate,
    city: text("City", 2, 80),
    state: optionalText(80),
    country: text("Country", 2, 80),
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
        message: "Remove the end date for a single-day event",
      });
    }

    if (value.startDate < today()) {
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
    if (value.budgetMax < value.budgetMin) {
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
  genre: text("Genre / style", 2, 80),
  setDurationMinutes: number("Set duration", { min: 5, max: 1440, int: true }),
  feeExpectation: number("Fee expectation", { min: 0 }),
  ownEquipment: z.boolean({ invalid_type_error: "Specify whether equipment is included" }),
  portfolioUrl: optionalUrl,
});

export const crewSchema = z.object({
  role: z.enum(CREW_ROLES, {
    errorMap: () => ({ message: "Choose a crew role" }),
  }),
  headcount: number("Headcount", { min: 1, max: 500, int: true }),
  shiftHours: number("Shift length", { min: 1, max: 24 }),
  skillLevel: z.enum(SKILL_LEVELS, {
    errorMap: () => ({ message: "Choose a skill level" }),
  }),
  dailyRate: number("Daily rate", { min: 0 }),
  ownGear: z.boolean({ invalid_type_error: "Specify whether own gear is available" }),
});

export const logisticsSchema = z.object({
  responseDeadline: isoDate,
  budgetFlexibility: z.enum(BUDGET_FLEXIBILITY, {
    errorMap: () => ({ message: "Choose a budget flexibility" }),
  }),
  travelCovered: z.boolean({ invalid_type_error: "Specify whether travel is covered" }),
  contactName: text("Contact name", 2, 80),
  contactEmail: z
    .string({ required_error: "Contact email is required" })
    .trim()
    .email("Enter a valid email address"),
  contactPhone: optionalText(20),
  notes: optionalText(2000),
  // One category-aware field per type. Step 3 adapts, so this is not cosmetic.
  plannerContractType: z.enum(PLANNER_CONTRACT_TYPES).optional(),
  performerSoundcheck: z.boolean().optional(),
  crewEquipmentProvided: z.boolean().optional(),
});

export const requirementSchema = z
  .object({
    category: z.enum(CATEGORIES, {
      errorMap: () => ({ message: "Choose a valid category" }),
    }),
    basics: basicsSchema,
    planner: plannerSchema.optional(),
    performer: performerSchema.optional(),
    crew: crewSchema.optional(),
    logistics: logisticsSchema,
  })
  .superRefine((value, ctx) => {
    const blocks = ["planner", "performer", "crew"] as const;

    for (const block of blocks) {
      if (block !== value.category && value[block] !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [block],
          message: `A ${block} block is not allowed when the category is ${value.category}`,
        });
      }
    }

    if (value[value.category] === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [value.category],
        message: `${value.category} details are required`,
      });
    }

    if (value.logistics.responseDeadline < today()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["logistics", "responseDeadline"],
        message: "Response deadline cannot be in the past",
      });
    }
  });

export type RequirementInput = z.infer<typeof requirementSchema>;

/** Flattens a Zod error into `[{ path, message }]` for API consumers. */
export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
