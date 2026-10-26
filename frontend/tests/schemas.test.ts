import { describe, expect, it } from "vitest";
import { requirementSchema, stepOneSchema } from "@/lib/schemas";
import { emptyCategoryValues, emptyFormValues, type FormValues } from "@/lib/types";

function daysFromNow(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const validBasics = {
  eventName: "Mehta–Rao Wedding",
  eventType: "Wedding",
  dateMode: "range" as const,
  startDate: daysFromNow(30),
  endDate: daysFromNow(32),
  city: "Bengaluru",
  state: "Karnataka",
  country: "India",
  venue: "",
};

const validPlanner = {
  guestCount: 300,
  budgetMin: 500000,
  budgetMax: 800000,
  services: ["Vendor management"],
  experienceLevel: "Expert",
};

const validLogistics = {
  responseDeadline: daysFromNow(7),
  budgetFlexibility: "Fixed",
  travelCovered: true,
  contactName: "Test User",
  contactEmail: "test@example.com",
  contactPhone: "",
  notes: "",
  plannerContractType: "One-time",
};

function form(overrides: Partial<FormValues> = {}): FormValues {
  return {
    ...emptyFormValues(),
    category: "planner",
    basics: validBasics,
    ...emptyCategoryValues("planner"),
    planner: validPlanner,
    logistics: validLogistics,
    ...overrides,
  };
}

describe("stepOneSchema", () => {
  it("accepts a valid single-day event", () => {
    const result = stepOneSchema.safeParse({
      category: "crew",
      basics: { ...validBasics, dateMode: "single", endDate: "" },
    });

    expect(result.success).toBe(true);
  });

  it("rejects a date range without an end date", () => {
    const result = stepOneSchema.safeParse({
      category: "planner",
      basics: { ...validBasics, endDate: "" },
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some(
        (issue) => issue.path.join(".") === "basics.endDate" && /end date is required/i.test(issue.message),
      ),
    ).toBe(true);
  });

  it("rejects an end date before the start date", () => {
    const result = stepOneSchema.safeParse({
      category: "planner",
      basics: { ...validBasics, endDate: daysFromNow(10) },
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => /before the start date/i.test(issue.message)),
    ).toBe(true);
  });

  it("rejects a past start date", () => {
    const result = stepOneSchema.safeParse({
      category: "planner",
      basics: { ...validBasics, startDate: "2020-01-01", endDate: "2020-01-02" },
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => /in the past/i.test(issue.message))).toBe(true);
  });

  it("requires a category", () => {
    const result = stepOneSchema.safeParse({ category: "", basics: validBasics });
    expect(result.success).toBe(false);
  });
});

describe("requirementSchema", () => {
  it("accepts a complete planner payload", () => {
    const result = requirementSchema.safeParse(form());
    expect(result.success).toBe(true);
  });

  it("treats an empty end date on a single-day event as not set", () => {
    const result = requirementSchema.safeParse(
      form({ basics: { ...validBasics, dateMode: "single", endDate: "" } }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.basics.endDate).toBeUndefined();
    }
  });

  it("still rejects a malformed end date", () => {
    const result = requirementSchema.safeParse(
      form({ basics: { ...validBasics, endDate: "31-12-2026" } }),
    );

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.path.join(".") === "basics.endDate"),
    ).toBe(true);
  });

  it("rejects a budget where max is lower than min", () => {
    const result = requirementSchema.safeParse(
      form({ planner: { ...validPlanner, budgetMin: 900000, budgetMax: 100 } }),
    );

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.path.join(".") === "planner.budgetMax"),
    ).toBe(true);
  });

  it("rejects blocks that do not match the selected category", () => {
    const result = requirementSchema.safeParse({
      ...form(),
      crew: {
        role: "Photographer",
        headcount: 1,
        shiftHours: 4,
        skillLevel: "Beginner",
        dailyRate: 1000,
        ownGear: true,
      },
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path[0] === "crew")).toBe(true);
  });

  it("strips logistics extras that belong to another category", () => {
    const payload = form({
      category: "crew",
      planner: undefined,
      crew: {
        role: "Photographer",
        headcount: 2,
        shiftHours: 8,
        skillLevel: "Intermediate",
        dailyRate: 7000,
        ownGear: true,
      },
      logistics: {
        ...validLogistics,
        plannerContractType: "One-time",
        crewEquipmentProvided: true,
      },
    });

    const result = requirementSchema.safeParse(payload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.logistics.plannerContractType).toBeUndefined();
      expect(result.data.logistics.crewEquipmentProvided).toBe(true);
      expect(result.data.planner).toBeUndefined();
    }
  });

  it("rejects a response deadline in the past", () => {
    const result = requirementSchema.safeParse(
      form({ logistics: { ...validLogistics, responseDeadline: "2020-01-01" } }),
    );

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.path.join(".") === "logistics.responseDeadline"),
    ).toBe(true);
  });
});
