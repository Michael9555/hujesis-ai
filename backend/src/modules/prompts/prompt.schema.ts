import * as yup from "yup";
import { PromptCategory, PromptStatus } from "./prompt.entity";

export const createPromptSchema = yup.object({
  title: yup
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters")
    .required("Title is required")
    .trim(),
  content: yup
    .string()
    .min(10, "Prompt content must be at least 10 characters")
    .max(5000, "Prompt content must not exceed 5000 characters")
    .required("Prompt content is required")
    .trim(),
  negativePrompt: yup
    .string()
    .max(2000, "Negative prompt must not exceed 2000 characters")
    .trim()
    .optional(),
  description: yup
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .trim()
    .optional(),
  category: yup
    .string()
    .oneOf(Object.values(PromptCategory), "Invalid category")
    .default(PromptCategory.OTHER),
  tags: yup
    .array()
    .of(yup.string().trim())
    .max(10, "Maximum 10 tags allowed")
    .optional(),
  settings: yup
    .object({
      width: yup.number().min(256).max(2048).optional(),
      height: yup.number().min(256).max(2048).optional(),
      steps: yup.number().min(1).max(150).optional(),
      cfgScale: yup.number().min(1).max(30).optional(),
      sampler: yup.string().optional(),
      seed: yup.number().optional(),
    })
    .optional(),
  isFavorite: yup.boolean().default(false),
});

export const updatePromptSchema = yup.object({
  title: yup
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters")
    .trim()
    .optional(),
  content: yup
    .string()
    .min(10, "Prompt content must be at least 10 characters")
    .max(5000, "Prompt content must not exceed 5000 characters")
    .trim()
    .optional(),
  negativePrompt: yup
    .string()
    .max(2000, "Negative prompt must not exceed 2000 characters")
    .trim()
    .nullable()
    .optional(),
  description: yup
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .trim()
    .nullable()
    .optional(),
  category: yup
    .string()
    .oneOf(Object.values(PromptCategory), "Invalid category")
    .optional(),
  status: yup
    .string()
    .oneOf(Object.values(PromptStatus), "Invalid status")
    .optional(),
  tags: yup
    .array()
    .of(yup.string().trim())
    .max(10, "Maximum 10 tags allowed")
    .optional(),
  settings: yup
    .object({
      width: yup.number().min(256).max(2048).optional(),
      height: yup.number().min(256).max(2048).optional(),
      steps: yup.number().min(1).max(150).optional(),
      cfgScale: yup.number().min(1).max(30).optional(),
      sampler: yup.string().optional(),
      seed: yup.number().optional(),
    })
    .nullable()
    .optional(),
  isFavorite: yup.boolean().optional(),
});

export const promptQuerySchema = yup.object({
  page: yup.number().min(1).default(1),
  limit: yup.number().min(1).max(100).default(20),
  search: yup.string().trim().optional(),
  category: yup
    .string()
    .oneOf([...Object.values(PromptCategory), ""], "Invalid category")
    .optional(),
  status: yup
    .string()
    .oneOf([...Object.values(PromptStatus), ""], "Invalid status")
    .optional(),
  isFavorite: yup.boolean().optional(),
  sortBy: yup
    .string()
    .oneOf(
      ["createdAt", "updatedAt", "title", "usageCount"],
      "Invalid sort field"
    )
    .default("createdAt"),
  sortOrder: yup
    .string()
    .oneOf(["ASC", "DESC"], "Invalid sort order")
    .default("DESC"),
});

export const promptIdSchema = yup.object({
  id: yup.string().uuid("Invalid prompt ID").required(),
});

export type CreatePromptInput = yup.InferType<typeof createPromptSchema>;
export type UpdatePromptInput = yup.InferType<typeof updatePromptSchema>;
export type PromptQueryInput = yup.InferType<typeof promptQuerySchema>;
