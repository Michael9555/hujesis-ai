'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Article,
  ArrowLeft,
  Lightning,
  Tag,
  Sliders,
} from '@phosphor-icons/react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Input, Textarea, Select } from '@/components/ui';
import { promptSchema, PromptFormData } from '@/utils/validation';
import api from '@/services/api';
import { PromptCategory } from '@/types';

const CATEGORIES: { value: PromptCategory; label: string }[] = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'scifi', label: 'Sci-Fi' },
  { value: 'anime', label: 'Anime' },
  { value: 'realistic', label: 'Realistic' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'other', label: 'Other' },
];

export default function NewPromptPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [category, setCategory] = useState<PromptCategory>('other');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PromptFormData>({
    resolver: yupResolver(promptSchema),
    defaultValues: {
      title: '',
      content: '',
      negativePrompt: '',
      description: '',
      category: 'other',
      tags: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const onSubmit = async (data: PromptFormData) => {
    try {
      const tags = data.tags
        ?.split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const response = await api.createPrompt({
        title: data.title,
        content: data.content,
        negativePrompt: data.negativePrompt || undefined,
        description: data.description || undefined,
        category: category,
        tags: tags?.length ? tags : undefined,
      });

      router.push(`/prompts/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create prompt:', error);
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-surface-400 hover:text-surface-100 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-surface-100 flex items-center gap-3">
          <Article className="w-8 h-8 text-primary-400" weight="fill" />
          Create New Prompt
        </h1>
        <p className="text-surface-400 mt-1">
          Save your prompt for later use or generate images directly
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Title"
            placeholder="Give your prompt a memorable title"
            error={errors.title?.message}
            {...register('title')}
          />

          <Textarea
            label="Prompt Content"
            placeholder="A majestic dragon flying over a medieval castle at sunset, highly detailed, cinematic lighting, 4k, artstation..."
            minRows={4}
            maxRows={10}
            error={errors.content?.message}
            {...register('content')}
          />

          <Textarea
            label="Negative Prompt (optional)"
            placeholder="blurry, low quality, distorted, ugly, bad anatomy..."
            minRows={2}
            maxRows={4}
            error={errors.negativePrompt?.message}
            {...register('negativePrompt')}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={category}
              onChange={(val) => setCategory(val as PromptCategory)}
              options={CATEGORIES}
            />

            <Input
              label="Tags"
              placeholder="fantasy, dragon, castle (comma separated)"
              leftIcon={<Tag className="w-5 h-5" />}
              hint="Separate tags with commas"
              {...register('tags')}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-300 transition-colors"
          >
            <Sliders className="w-4 h-4" />
            {showAdvanced ? 'Hide' : 'Show'} description
          </button>

          {showAdvanced && (
            <Textarea
              label="Description (optional)"
              placeholder="Add notes or context about this prompt..."
              minRows={2}
              maxRows={4}
              error={errors.description?.message}
              {...register('description')}
            />
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Save Prompt
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={handleSubmit(async (data) => {
                await onSubmit(data);
                // After saving, redirect to generate with this prompt
              })}
              leftIcon={<Lightning className="w-5 h-5" weight="fill" />}
            >
              Save & Generate
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}


