import * as yup from "yup";

export const updateProfileSchema = yup.object({
  firstName: yup
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name must not exceed 100 characters")
    .trim()
    .optional(),
  lastName: yup
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name must not exceed 100 characters")
    .trim()
    .optional(),
  avatarUrl: yup
    .string()
    .url("Invalid avatar URL")
    .max(255, "Avatar URL must not exceed 255 characters")
    .nullable()
    .optional(),
});

export const userIdSchema = yup.object({
  id: yup.string().uuid("Invalid user ID").required(),
});

export type UpdateProfileInput = yup.InferType<typeof updateProfileSchema>;
