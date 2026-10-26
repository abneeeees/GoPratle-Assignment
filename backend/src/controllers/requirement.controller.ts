import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { CATEGORIES, type Category } from "../constants";
import { Requirement } from "../models/Requirement";
import type { RequirementInput } from "../schemas/requirement";
import { ApiError } from "../utils/ApiError";
import { toRequirementDTO } from "../utils/serialize";

function toDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/** Maps the validated payload onto the document shape (dates become Date). */
function toDocument(input: RequirementInput) {
  const category = input.category;
  const block = input[category];

  return {
    category,
    basics: {
      ...input.basics,
      startDate: toDate(input.basics.startDate),
      endDate: input.basics.endDate ? toDate(input.basics.endDate) : null,
    },
    [category]: block,
    logistics: {
      ...input.logistics,
      responseDeadline: toDate(input.logistics.responseDeadline),
    },
  };
}

export async function createRequirement(req: Request, res: Response) {
  const input = req.body as RequirementInput;
  const created = await Requirement.create(toDocument(input));
  const document = created.toObject();

  res.status(201).json({
    success: true,
    data: toRequirementDTO(document),
  });
}

export async function listRequirements(req: Request, res: Response) {
  const categoryParam = typeof req.query.category === "string" ? req.query.category : undefined;

  if (categoryParam && !CATEGORIES.includes(categoryParam as Category)) {
    throw ApiError.badRequest(
      `Unknown category "${categoryParam}". Use one of: ${CATEGORIES.join(", ")}`,
    );
  }

  const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? "12"), 10) || 12));
  const search = typeof req.query.q === "string" ? req.query.q.trim() : "";

  const filter: Record<string, unknown> = {};
  if (categoryParam) filter.category = categoryParam;
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { "basics.eventName": { $regex: safe, $options: "i" } },
      { "basics.city": { $regex: safe, $options: "i" } },
    ];
  }

  const [documents, total] = await Promise.all([
    Requirement.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Requirement.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: documents.map(toRequirementDTO),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}

export async function getRequirement(req: Request, res: Response) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw ApiError.badRequest("That requirement id is not valid");
  }

  const document = await Requirement.findById(id).lean();

  if (!document) {
    throw ApiError.notFound("No requirement exists with that id");
  }

  res.json({ success: true, data: toRequirementDTO(document) });
}

export async function getStats(_req: Request, res: Response) {
  const [total, grouped] = await Promise.all([
    Requirement.countDocuments({}),
    Requirement.aggregate<{ _id: Category; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  const byCategory = Object.fromEntries(CATEGORIES.map((category) => [category, 0])) as Record<
    Category,
    number
  >;

  for (const row of grouped) {
    if (row?._id) byCategory[row._id] = row.count;
  }

  res.json({ success: true, data: { total, byCategory } });
}
