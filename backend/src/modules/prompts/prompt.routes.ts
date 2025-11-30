import { Router } from "express";
import promptController from "./prompt.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import {
  createPromptSchema,
  updatePromptSchema,
  promptQuerySchema,
  promptIdSchema,
} from "./prompt.schema";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user stats
router.get("/stats", promptController.getStats.bind(promptController));

// List prompts
router.get(
  "/",
  validate({ query: promptQuerySchema }),
  promptController.findAll.bind(promptController)
);

// Create prompt
router.post(
  "/",
  validate({ body: createPromptSchema }),
  promptController.create.bind(promptController)
);

// Get single prompt
router.get(
  "/:id",
  validate({ params: promptIdSchema }),
  promptController.findById.bind(promptController)
);

// Update prompt
router.put(
  "/:id",
  validate({ params: promptIdSchema, body: updatePromptSchema }),
  promptController.update.bind(promptController)
);

// Delete prompt
router.delete(
  "/:id",
  validate({ params: promptIdSchema }),
  promptController.delete.bind(promptController)
);

// Toggle favorite
router.post(
  "/:id/favorite",
  validate({ params: promptIdSchema }),
  promptController.toggleFavorite.bind(promptController)
);

// Archive prompt
router.post(
  "/:id/archive",
  validate({ params: promptIdSchema }),
  promptController.archive.bind(promptController)
);

// Restore prompt
router.post(
  "/:id/restore",
  validate({ params: promptIdSchema }),
  promptController.restore.bind(promptController)
);

// Duplicate prompt
router.post(
  "/:id/duplicate",
  validate({ params: promptIdSchema }),
  promptController.duplicate.bind(promptController)
);

export default router;
