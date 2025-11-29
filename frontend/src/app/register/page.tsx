'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { EnvelopeSimple, Lock, User, Sparkle } from '@phosphor-icons/react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Card } from '@/components/ui';
import { registerSchema, RegisterFormData } from '@/utils/validation';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      router.push('/dashboard');
    } catch {
      // Error is handled by context
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Sparkle className="w-7 h-7 text-white" weight="fill" />
            </div>
          </Link>
          <h1 className="text-2xl font-display font-bold text-surface-100 mb-2">
            Create your account
          </h1>
          <p className="text-surface-400">
            Start creating amazing AI-generated images
          </p>
        </div>

        <Card className="animate-fade-in-up">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-4 bg-danger-500/10 border border-danger-500/30 rounded-xl text-danger-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                placeholder="John"
                leftIcon={<User className="w-5 h-5" />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />

              <Input
                label="Last name"
                placeholder="Doe"
                leftIcon={<User className="w-5 h-5" />}
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<EnvelopeSimple className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              hint="At least 8 characters with uppercase, lowercase, and number"
              {...register('password')}
            />

            <Input
              label="Confirm password"
              type="password"
              placeholder="Confirm your password"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="text-sm text-surface-400">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-primary-400 hover:text-primary-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-400 hover:text-primary-300">
                Privacy Policy
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
            >
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-surface-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}


