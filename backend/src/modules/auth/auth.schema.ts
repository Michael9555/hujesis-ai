import * as yup from 'yup';

export const registerSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required')
    .lowercase()
    .trim(),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must not exceed 100 characters')
    .required('First name is required')
    .trim(),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must not exceed 100 characters')
    .required('Last name is required')
    .trim(),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required')
    .lowercase()
    .trim(),
  password: yup.string().required('Password is required'),
});

export const refreshTokenSchema = yup.object({
  refreshToken: yup.string().required('Refresh token is required'),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Password confirmation is required'),
});

export type RegisterInput = yup.InferType<typeof registerSchema>;
export type LoginInput = yup.InferType<typeof loginSchema>;
export type RefreshTokenInput = yup.InferType<typeof refreshTokenSchema>;
export type ChangePasswordInput = yup.InferType<typeof changePasswordSchema>;


