import { Router } from "express";
import {
  createRequirement,
  getRequirement,
  getStats,
  listRequirements,
} from "../controllers/requirement.controller";
import { validateBody } from "../middleware/validate";
import { requirementSchema } from "../schemas/requirement";
import { asyncHandler } from "../utils/asyncHandler";

export const requirementRouter = Router();

requirementRouter.get("/", asyncHandler(listRequirements));
requirementRouter.get("/stats", asyncHandler(getStats));
requirementRouter.get("/:id", asyncHandler(getRequirement));
requirementRouter.post("/", validateBody(requirementSchema), asyncHandler(createRequirement));
