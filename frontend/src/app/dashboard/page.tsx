'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Article,
  Images,
  Star,
  ArrowRight,
  Plus,
  Clock,
  Lightning,
} from '@phosphor-icons/react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Spinner } from '@/components/ui';
import api from '@/services/api';
import { DashboardStats, Prompt, GeneratedImage } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPrompts, setRecentPrompts] = useState<Prompt[]>([]);
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, promptsRes, imagesRes] = await Promise.all([
          api.getDashboard(),
          api.getPrompts({ limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' }),
          api.getImages({ limit: 6, sortBy: 'createdAt', sortOrder: 'DESC' }),
        ]);

        setStats(dashboardRes.data);
        setRecentPrompts(promptsRes.data);
        setRecentImages(imagesRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const statCards = [
    {
      label: 'Total Prompts',
      value: stats?.promptCount || 0,
      icon: Article,
      color: 'primary',
      href: '/prompts',
    },
    {
      label: 'Generated Images',
      value: stats?.imageCount || 0,
      icon: Images,
      color: 'accent',
      href: '/gallery',
    },
    {
      label: 'Favorite Prompts',
      value: stats?.favoritePromptsCount || 0,
      icon: Star,
      color: 'warning',
      href: '/prompts?isFavorite=true',
    },
    {
      label: 'Favorite Images',
      value: stats?.favoriteImagesCount || 0,
      icon: Star,
      color: 'success',
      href: '/gallery?isFavorite=true',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-surface-100">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-surface-400 mt-1">
            Here&apos;s what&apos;s happening with your creations
          </p>
        </div>
        <Link href="/generate">
          <Button leftIcon={<Plus className="w-5 h-5" weight="bold" />}>
            Generate Image
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link key={stat.label} href={stat.href}>
                  <Card variant="hover" className="h-full">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          stat.color === 'primary'
                            ? 'bg-primary-500/10'
                            : stat.color === 'accent'
                            ? 'bg-accent-500/10'
                            : stat.color === 'warning'
                            ? 'bg-warning-500/10'
                            : 'bg-success-500/10'
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            stat.color === 'primary'
                              ? 'text-primary-400'
                              : stat.color === 'accent'
                              ? 'text-accent-400'
                              : stat.color === 'warning'
                              ? 'text-warning-400'
                              : 'text-success-400'
                          }`}
                          weight="duotone"
                        />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-surface-100">
                          {stat.value}
                        </p>
                        <p className="text-sm text-surface-400">{stat.label}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Prompts */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-surface-400" />
                  Recent Prompts
                </h2>
                <Link
                  href="/prompts"
                  className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {recentPrompts.length > 0 ? (
                <div className="space-y-3">
                  {recentPrompts.map((prompt) => (
                    <Link
                      key={prompt.id}
                      href={`/prompts/${prompt.id}`}
                      className="block p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-surface-100 truncate group-hover:text-primary-400 transition-colors">
                            {prompt.title}
                          </p>
                          <p className="text-sm text-surface-500 truncate">
                            {prompt.content.substring(0, 50)}...
                          </p>
                        </div>
                        {prompt.isFavorite && (
                          <Star
                            className="w-4 h-4 text-warning-400 ml-2 flex-shrink-0"
                            weight="fill"
                          />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Article className="w-12 h-12 text-surface-600 mx-auto mb-3" />
                  <p className="text-surface-400 mb-4">No prompts yet</p>
                  <Link href="/prompts/new">
                    <Button variant="secondary" size="sm">
                      Create your first prompt
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Recent Images */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
                  <Lightning className="w-5 h-5 text-surface-400" />
                  Recent Generations
                </h2>
                <Link
                  href="/gallery"
                  className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {recentImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {recentImages.map((image) => (
                    <Link
                      key={image.id}
                      href={`/gallery/${image.id}`}
                      className="aspect-square rounded-xl overflow-hidden bg-surface-800 relative group"
                    >
                      <img
                        src={image.thumbnailUrl || image.imageUrl}
                        alt="Generated image"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Images className="w-12 h-12 text-surface-600 mx-auto mb-3" />
                  <p className="text-surface-400 mb-4">No images generated yet</p>
                  <Link href="/generate">
                    <Button variant="secondary" size="sm">
                      Generate your first image
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}


