import mongoose, { Schema } from "mongoose";
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
 * Single collection + `category` discriminator. Only the block that matches
 * `category` is ever persisted, which keeps "clearly categorised" true at the
 * storage layer as well as in the API response.
 */

const basicsSchema = new Schema(
  {
    eventName: { type: String, required: true, trim: true, maxlength: 120 },
    eventType: { type: String, required: true, enum: EVENT_TYPES },
    dateMode: { type: String, required: true, enum: DATE_MODES },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 80, default: null },
    country: { type: String, required: true, trim: true, maxlength: 80 },
    venue: { type: String, trim: true, maxlength: 120, default: null },
  },
  { _id: false },
);

const plannerSchema = new Schema(
  {
    guestCount: { type: Number, required: true, min: 1 },
    budgetMin: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, required: true, min: 0 },
    services: {
      type: [{ type: String, enum: PLANNER_SERVICES }],
      required: true,
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length > 0,
        message: "Select at least one service",
      },
    },
    experienceLevel: { type: String, required: true, enum: EXPERIENCE_LEVELS },
  },
  { _id: false },
);

const performerSchema = new Schema(
  {
    performerType: { type: String, required: true, enum: PERFORMER_TYPES },
    genre: { type: String, required: true, trim: true, maxlength: 80 },
    setDurationMinutes: { type: Number, required: true, min: 5, max: 1440 },
    feeExpectation: { type: Number, required: true, min: 0 },
    ownEquipment: { type: Boolean, required: true },
    portfolioUrl: { type: String, trim: true, default: null },
  },
  { _id: false },
);

const crewSchema = new Schema(
  {
    role: { type: String, required: true, enum: CREW_ROLES },
    headcount: { type: Number, required: true, min: 1, max: 500 },
    shiftHours: { type: Number, required: true, min: 1, max: 24 },
    skillLevel: { type: String, required: true, enum: SKILL_LEVELS },
    dailyRate: { type: Number, required: true, min: 0 },
    ownGear: { type: Boolean, required: true },
  },
  { _id: false },
);

const logisticsSchema = new Schema(
  {
    responseDeadline: { type: Date, required: true },
    budgetFlexibility: { type: String, required: true, enum: BUDGET_FLEXIBILITY },
    travelCovered: { type: Boolean, required: true },
    contactName: { type: String, required: true, trim: true, maxlength: 80 },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true, maxlength: 20, default: null },
    notes: { type: String, trim: true, maxlength: 2000, default: null },
    plannerContractType: { type: String, enum: PLANNER_CONTRACT_TYPES, default: null },
    performerSoundcheck: { type: Boolean, default: null },
    crewEquipmentProvided: { type: Boolean, default: null },
  },
  { _id: false },
);

const requirementSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
      index: true,
    },
    basics: { type: basicsSchema, required: true },
    planner: { type: plannerSchema, required: false },
    performer: { type: performerSchema, required: false },
    crew: { type: crewSchema, required: false },
    logistics: { type: logisticsSchema, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: true,
  },
);

// Guards the invariant even if a caller bypasses the Zod layer (e.g. a script).
requirementSchema.pre("validate", function enforceSingleCategory(next) {
  const blocks = ["planner", "performer", "crew"] as const;

  for (const block of blocks) {
    if (block !== this.category) {
      this.set(block, undefined);
    }
  }

  if (!this.get(this.category)) {
    this.invalidate("category", `Details for the "${this.category}" category are required`);
  }

  next();
});

requirementSchema.index({ category: 1, createdAt: -1 });

export const Requirement = mongoose.model("Requirement", requirementSchema);
