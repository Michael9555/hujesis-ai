import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const registerSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
});

export const promptSchema = yup.object({
  title: yup
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must not exceed 255 characters')
    .required('Title is required'),
  content: yup
    .string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(5000, 'Prompt must not exceed 5000 characters')
    .required('Prompt content is required'),
  negativePrompt: yup
    .string()
    .max(2000, 'Negative prompt must not exceed 2000 characters'),
  description: yup
    .string()
    .max(1000, 'Description must not exceed 1000 characters'),
  category: yup.string(),
  tags: yup.string(),
});

export const generateImageSchema = yup.object({
  prompt: yup
    .string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(5000, 'Prompt must not exceed 5000 characters')
    .required('Prompt is required'),
  negativePrompt: yup
    .string()
    .max(2000, 'Negative prompt must not exceed 2000 characters'),
  width: yup.number().min(256).max(2048),
  height: yup.number().min(256).max(2048),
  steps: yup.number().min(1).max(150),
  cfgScale: yup.number().min(1).max(30),
  seed: yup.number(),
});

export const profileSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    )
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type PromptFormData = yup.InferType<typeof promptSchema>;
export type GenerateImageFormData = yup.InferType<typeof generateImageSchema>;
export type ProfileFormData = yup.InferType<typeof profileSchema>;
export type ChangePasswordFormData = yup.InferType<typeof changePasswordSchema>;


