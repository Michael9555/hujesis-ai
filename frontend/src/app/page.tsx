'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import {
  Sparkle,
  Lightning,
  Palette,
  CloudArrowUp,
  ArrowRight,
  Star,
} from '@phosphor-icons/react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Lightning,
      title: 'Lightning Fast',
      description: 'Generate stunning images in seconds with our optimized AI engine.',
    },
    {
      icon: Palette,
      title: 'Prompt Helper',
      description: 'Get intelligent suggestions to craft the perfect prompts for your vision.',
    },
    {
      icon: CloudArrowUp,
      title: 'Cloud Storage',
      description: 'Save and organize your prompts and generated images in the cloud.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-12 sm:py-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-accent-500/20 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800/50 border border-surface-700 mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-warning-400" weight="fill" />
            <span className="text-sm text-surface-300">Now with enhanced AI models</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 animate-fade-in-up">
            Create stunning
            <br />
            <span className="gradient-text">AI-powered images</span>
          </h1>

          <p className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-100">
            Unleash your creativity with our advanced AI image generation platform.
            Craft perfect prompts, generate beautiful artwork, and build your collection.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-200">
            {isAuthenticated ? (
              <Link href="/generate">
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Start Creating
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="lg">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Hero image preview */}
          <div className="mt-16 relative animate-fade-in-up animation-delay-300">
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent z-10" />
            <div className="glass-card p-2 sm:p-4 overflow-hidden">
              <div className="aspect-video rounded-xl bg-surface-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-mesh" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg animate-float">
                    <Sparkle className="w-10 h-10 text-white" weight="fill" />
                  </div>
                  <p className="text-surface-400 text-sm">Your AI-generated masterpiece awaits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Everything you need to create
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto">
              Powerful tools designed to help you generate, organize, and manage your AI artwork.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-card-hover p-6 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-400" weight="duotone" />
                  </div>
                  <h3 className="text-lg font-semibold text-surface-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-surface-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass-card p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">
                Ready to start creating?
              </h2>
              <p className="text-surface-400 mb-8 max-w-xl mx-auto">
                Join thousands of creators using HujesisAI to bring their imagination to life.
              </p>
              {isAuthenticated ? (
                <Link href="/generate">
                  <Button size="lg" rightIcon={<Sparkle className="w-5 h-5" weight="fill" />}>
                    Generate Now
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" rightIcon={<Sparkle className="w-5 h-5" weight="fill" />}>
                    Create Free Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-surface-800">
        <div className="max-w-6xl mx-auto px-4 text-center text-surface-500 text-sm">
          <p>&copy; {new Date().getFullYear()} HujesisAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


