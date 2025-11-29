import * as yup from 'yup';
import { ImageStatus } from './image.entity';

export const generateImageSchema = yup.object({
  prompt: yup
    .string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(5000, 'Prompt must not exceed 5000 characters')
    .required('Prompt is required')
    .trim(),
  negativePrompt: yup
    .string()
    .max(2000, 'Negative prompt must not exceed 2000 characters')
    .trim()
    .optional(),
  promptId: yup.string().uuid('Invalid prompt ID').optional(),
  settings: yup
    .object({
      width: yup.number().min(256).max(2048).default(512),
      height: yup.number().min(256).max(2048).default(512),
      steps: yup.number().min(1).max(150).default(30),
      cfgScale: yup.number().min(1).max(30).default(7),
      sampler: yup.string().default('Euler a'),
      seed: yup.number().optional(),
      model: yup.string().optional(),
    })
    .default({}),
});

export const updateImageSchema = yup.object({
  isFavorite: yup.boolean().optional(),
  tags: yup.array().of(yup.string().trim()).max(10, 'Maximum 10 tags allowed').optional(),
});

export const imageQuerySchema = yup.object({
  page: yup.number().min(1).default(1),
  limit: yup.number().min(1).max(100).default(20),
  promptId: yup.string().uuid('Invalid prompt ID').optional(),
  status: yup
    .string()
    .oneOf([...Object.values(ImageStatus), ''], 'Invalid status')
    .optional(),
  isFavorite: yup.boolean().optional(),
  sortBy: yup
    .string()
    .oneOf(['createdAt', 'fileSize'], 'Invalid sort field')
    .default('createdAt'),
  sortOrder: yup.string().oneOf(['ASC', 'DESC'], 'Invalid sort order').default('DESC'),
});

export const imageIdSchema = yup.object({
  id: yup.string().uuid('Invalid image ID').required(),
});

export type GenerateImageInput = yup.InferType<typeof generateImageSchema>;
export type UpdateImageInput = yup.InferType<typeof updateImageSchema>;
export type ImageQueryInput = yup.InferType<typeof imageQuerySchema>;


