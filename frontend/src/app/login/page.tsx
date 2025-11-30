"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { EnvelopeSimple, Lock, Sparkle } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { Button, Input, Card } from "@/components/ui";
import { loginSchema, LoginFormData } from "@/utils/validation";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      router.push("/dashboard");
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
            Welcome back
          </h1>
          <p className="text-surface-400">
            Sign in to continue creating amazing images
          </p>
        </div>

        <Card className="animate-fade-in-up">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-4 bg-danger-500/10 border border-danger-500/30 rounded-xl text-danger-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<EnvelopeSimple className="w-5 h-5" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-surface-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-surface-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
