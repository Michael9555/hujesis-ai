import { Router } from "express";
import imageController from "./image.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import {
  generateImageSchema,
  updateImageSchema,
  imageQuerySchema,
  imageIdSchema,
} from "./image.schema";
import * as yup from "yup";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user stats
router.get("/stats", imageController.getStats.bind(imageController));

// List images
router.get(
  "/",
  validate({ query: imageQuerySchema }),
  imageController.findAll.bind(imageController)
);

// Generate new image
router.post(
  "/generate",
  validate({ body: generateImageSchema }),
  imageController.generate.bind(imageController)
);

// Bulk delete
router.post(
  "/bulk-delete",
  validate({
    body: yup.object({
      ids: yup.array().of(yup.string().uuid()).min(1).max(100).required(),
    }),
  }),
  imageController.bulkDelete.bind(imageController)
);

// Get single image
router.get(
  "/:id",
  validate({ params: imageIdSchema }),
  imageController.findById.bind(imageController)
);

// Update image
router.put(
  "/:id",
  validate({ params: imageIdSchema, body: updateImageSchema }),
  imageController.update.bind(imageController)
);

// Delete image
router.delete(
  "/:id",
  validate({ params: imageIdSchema }),
  imageController.delete.bind(imageController)
);

// Toggle favorite
router.post(
  "/:id/favorite",
  validate({ params: imageIdSchema }),
  imageController.toggleFavorite.bind(imageController)
);

export default router;
