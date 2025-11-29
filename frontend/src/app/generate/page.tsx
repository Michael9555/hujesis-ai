'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Sparkle,
  Lightning,
  Sliders,
  Image as ImageIcon,
  ArrowRight,
  Star,
  Copy,
  Check,
} from '@phosphor-icons/react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Textarea, Input, Select, Spinner, Badge } from '@/components/ui';
import { generateImageSchema, GenerateImageFormData } from '@/utils/validation';
import api from '@/services/api';
import { GeneratedImage } from '@/types';

const SAMPLERS = [
  { value: 'Euler a', label: 'Euler a' },
  { value: 'Euler', label: 'Euler' },
  { value: 'DPM++ 2M', label: 'DPM++ 2M' },
  { value: 'DPM++ SDE', label: 'DPM++ SDE' },
  { value: 'DDIM', label: 'DDIM' },
];

const PRESETS = [
  { width: 512, height: 512, label: '1:1 Square' },
  { width: 768, height: 512, label: '3:2 Landscape' },
  { width: 512, height: 768, label: '2:3 Portrait' },
  { width: 1024, height: 576, label: '16:9 Wide' },
  { width: 576, height: 1024, label: '9:16 Tall' },
];

export default function GeneratePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GenerateImageFormData>({
    resolver: yupResolver(generateImageSchema),
    defaultValues: {
      prompt: '',
      negativePrompt: '',
      width: 512,
      height: 512,
      steps: 30,
      cfgScale: 7,
    },
  });

  const currentWidth = watch('width');
  const currentHeight = watch('height');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const onSubmit = async (data: GenerateImageFormData) => {
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await api.generateImage({
        prompt: data.prompt,
        negativePrompt: data.negativePrompt,
        settings: {
          width: data.width,
          height: data.height,
          steps: data.steps,
          cfgScale: data.cfgScale,
          seed: data.seed,
        },
      });

      setGeneratedImage(response.data);
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = () => {
    if (generatedImage?.promptUsed) {
      navigator.clipboard.writeText(generatedImage.promptUsed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectPreset = (preset: typeof PRESETS[0]) => {
    setValue('width', preset.width);
    setValue('height', preset.height);
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-surface-100 flex items-center gap-3">
          <Sparkle className="w-8 h-8 text-primary-400" weight="fill" />
          Generate Image
        </h1>
        <p className="text-surface-400 mt-1">
          Describe your vision and let AI bring it to life
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Textarea
                label="Prompt"
                placeholder="A majestic dragon flying over a medieval castle at sunset, highly detailed, cinematic lighting, 4k, artstation..."
                minRows={4}
                maxRows={8}
                error={errors.prompt?.message}
                {...register('prompt')}
              />

              <Textarea
                label="Negative Prompt (optional)"
                placeholder="blurry, low quality, distorted, ugly, bad anatomy..."
                minRows={2}
                maxRows={4}
                error={errors.negativePrompt?.message}
                {...register('negativePrompt')}
              />

              {/* Size Presets */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  Image Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => selectPreset(preset)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        currentWidth === preset.width && currentHeight === preset.height
                          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                          : 'bg-surface-800 text-surface-400 border border-surface-700 hover:border-surface-600'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-300 transition-colors"
              >
                <Sliders className="w-4 h-4" />
                {showAdvanced ? 'Hide' : 'Show'} advanced settings
              </button>

              {/* Advanced Settings */}
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Input
                    label="Width"
                    type="number"
                    min={256}
                    max={2048}
                    step={64}
                    error={errors.width?.message}
                    {...register('width', { valueAsNumber: true })}
                  />

                  <Input
                    label="Height"
                    type="number"
                    min={256}
                    max={2048}
                    step={64}
                    error={errors.height?.message}
                    {...register('height', { valueAsNumber: true })}
                  />

                  <Input
                    label="Steps"
                    type="number"
                    min={1}
                    max={150}
                    hint="More steps = better quality, slower"
                    error={errors.steps?.message}
                    {...register('steps', { valueAsNumber: true })}
                  />

                  <Input
                    label="CFG Scale"
                    type="number"
                    min={1}
                    max={30}
                    step={0.5}
                    hint="How closely to follow the prompt"
                    error={errors.cfgScale?.message}
                    {...register('cfgScale', { valueAsNumber: true })}
                  />

                  <Input
                    label="Seed (optional)"
                    type="number"
                    placeholder="Random"
                    hint="Use same seed for reproducible results"
                    {...register('seed', { valueAsNumber: true })}
                  />
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isGenerating}
                leftIcon={
                  isGenerating ? undefined : <Lightning className="w-5 h-5" weight="fill" />
                }
              >
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Preview Section */}
        <div>
          <Card className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-surface-400" />
                Preview
              </h2>
              {generatedImage && (
                <Badge variant="success">Completed</Badge>
              )}
            </div>

            <div className="aspect-square rounded-xl bg-surface-800/50 overflow-hidden relative">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Spinner size="xl" />
                  <p className="text-surface-400 mt-4 text-sm">
                    Creating your masterpiece...
                  </p>
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage.imageUrl}
                  alt="Generated image"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-surface-700/50 flex items-center justify-center mb-4">
                    <Sparkle className="w-8 h-8 text-surface-500" />
                  </div>
                  <p className="text-surface-400 text-sm">
                    Your generated image will appear here
                  </p>
                </div>
              )}
            </div>

            {generatedImage && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">
                    {generatedImage.width}×{generatedImage.height}
                  </Badge>
                  <Badge variant="neutral">
                    {generatedImage.generationTimeMs}ms
                  </Badge>
                  <Badge variant="neutral">
                    Seed: {generatedImage.generationSettings?.seed}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={copyPrompt}
                    leftIcon={
                      copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )
                    }
                  >
                    {copied ? 'Copied!' : 'Copy Prompt'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Star className="w-4 h-4" />}
                    onClick={() => api.toggleImageFavorite(generatedImage.id)}
                  >
                    Save to Favorites
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => router.push(`/gallery/${generatedImage.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}


