"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkle,
  Lightning,
  Sliders,
  Image as ImageIcon,
  ArrowRight,
  Star,
  Copy,
  Check,
  Article,
  MagnifyingGlass,
  Plus,
  CaretDown,
} from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, Input, Spinner, Badge, Modal } from "@/components/ui";
import api from "@/services/api";
import { GeneratedImage, Prompt } from "@/types";
import classNames from "classnames";

const PRESETS = [
  { width: 512, height: 512, label: "1:1 Square" },
  { width: 768, height: 512, label: "3:2 Landscape" },
  { width: 512, height: 768, label: "2:3 Portrait" },
  { width: 1024, height: 576, label: "16:9 Wide" },
  { width: 576, height: 1024, label: "9:16 Tall" },
];

export default function GeneratePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Prompts state
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [promptSearch, setPromptSearch] = useState("");
  const [showPromptSelector, setShowPromptSelector] = useState(false);

  // Generation settings state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(30);
  const [cfgScale, setCfgScale] = useState(7);
  const [seed, setSeed] = useState<number | undefined>(undefined);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchPrompts = useCallback(async () => {
    setIsLoadingPrompts(true);
    try {
      const response = await api.getPrompts({
        limit: 100,
        sortBy: "updatedAt",
        sortOrder: "DESC",
      });
      setPrompts(response.data);
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    } finally {
      setIsLoadingPrompts(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPrompts();
    }
  }, [isAuthenticated, fetchPrompts]);

  const filteredPrompts = prompts.filter(
    (prompt) =>
      prompt.title.toLowerCase().includes(promptSearch.toLowerCase()) ||
      prompt.content.toLowerCase().includes(promptSearch.toLowerCase())
  );

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowPromptSelector(false);
    setPromptSearch("");
  };

  const handleGenerate = async () => {
    if (!selectedPrompt) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await api.generateImage({
        prompt: selectedPrompt.content,
        negativePrompt: selectedPrompt.negativePrompt,
        promptId: selectedPrompt.id,
        settings: {
          width,
          height,
          steps,
          cfgScale,
          seed,
        },
      });

      setGeneratedImage(response.data);
    } catch (error) {
      console.error("Failed to generate image:", error);
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

  const selectPreset = (preset: (typeof PRESETS)[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
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
          Select a prompt and let AI bring it to life
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <div className="space-y-5">
              {/* Prompt Selector */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  Select Prompt
                </label>

                {/* Selected Prompt Display / Selector Trigger */}
                <button
                  type="button"
                  onClick={() => setShowPromptSelector(true)}
                  className={classNames(
                    "w-full text-left p-4 rounded-xl border transition-all",
                    selectedPrompt
                      ? "bg-surface-800/50 border-primary-500/30 hover:border-primary-500/50"
                      : "bg-surface-900/50 border-surface-700 hover:border-surface-600"
                  )}
                >
                  {selectedPrompt ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-surface-100">
                          {selectedPrompt.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="neutral" size="sm">
                            {selectedPrompt.category}
                          </Badge>
                          <CaretDown className="w-4 h-4 text-surface-400" />
                        </div>
                      </div>
                      <p className="text-sm text-surface-400 line-clamp-2">
                        {selectedPrompt.content}
                      </p>
                      {selectedPrompt.negativePrompt && (
                        <p className="text-xs text-surface-500 mt-2 line-clamp-1">
                          <span className="text-danger-400">Negative:</span>{" "}
                          {selectedPrompt.negativePrompt}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center">
                          <Article className="w-5 h-5 text-surface-500" />
                        </div>
                        <div>
                          <span className="text-surface-300 block">
                            Choose a prompt
                          </span>
                          <span className="text-sm text-surface-500">
                            Select from your saved prompts
                          </span>
                        </div>
                      </div>
                      <CaretDown className="w-5 h-5 text-surface-400" />
                    </div>
                  )}
                </button>

                {/* No prompts message */}
                {!isLoadingPrompts && prompts.length === 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-surface-800/50 border border-surface-700 text-center">
                    <p className="text-surface-400 text-sm mb-3">
                      You don&apos;t have any prompts yet
                    </p>
                    <Link href="/prompts/new">
                      <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                        Create Your First Prompt
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

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
                        width === preset.width && height === preset.height
                          ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                          : "bg-surface-800 text-surface-400 border border-surface-700 hover:border-surface-600"
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
                {showAdvanced ? "Hide" : "Show"} advanced settings
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
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                  />

                  <Input
                    label="Height"
                    type="number"
                    min={256}
                    max={2048}
                    step={64}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                  />

                  <Input
                    label="Steps"
                    type="number"
                    min={1}
                    max={150}
                    hint="More steps = better quality, slower"
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                  />

                  <Input
                    label="CFG Scale"
                    type="number"
                    min={1}
                    max={30}
                    step={0.5}
                    hint="How closely to follow the prompt"
                    value={cfgScale}
                    onChange={(e) => setCfgScale(Number(e.target.value))}
                  />

                  <Input
                    label="Seed (optional)"
                    type="number"
                    placeholder="Random"
                    hint="Use same seed for reproducible results"
                    value={seed || ""}
                    onChange={(e) =>
                      setSeed(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>
              )}

              <Button
                type="button"
                fullWidth
                size="lg"
                isLoading={isGenerating}
                disabled={!selectedPrompt}
                onClick={handleGenerate}
                leftIcon={
                  isGenerating ? undefined : (
                    <Lightning className="w-5 h-5" weight="fill" />
                  )
                }
              >
                {isGenerating
                  ? "Generating..."
                  : selectedPrompt
                  ? "Generate Image"
                  : "Select a Prompt First"}
              </Button>
            </div>
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
              {generatedImage && <Badge variant="success">Completed</Badge>}
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
                    {selectedPrompt
                      ? "Click Generate to create your image"
                      : "Select a prompt to get started"}
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
                    {copied ? "Copied!" : "Copy Prompt"}
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

      {/* Prompt Selector Modal */}
      <Modal
        isOpen={showPromptSelector}
        onClose={() => {
          setShowPromptSelector(false);
          setPromptSearch("");
        }}
        title="Select a Prompt"
        description="Choose from your saved prompts"
      >
        <div className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search prompts..."
            value={promptSearch}
            onChange={(e) => setPromptSearch(e.target.value)}
            leftIcon={<MagnifyingGlass className="w-5 h-5" />}
          />

          {/* Prompts List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoadingPrompts ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : filteredPrompts.length > 0 ? (
              filteredPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleSelectPrompt(prompt)}
                  className={classNames(
                    "w-full text-left p-4 rounded-xl border transition-all hover:border-primary-500/50",
                    selectedPrompt?.id === prompt.id
                      ? "bg-primary-500/10 border-primary-500/30"
                      : "bg-surface-800/50 border-surface-700"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-surface-100">
                      {prompt.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {prompt.isFavorite && (
                        <Star
                          className="w-4 h-4 text-warning-400"
                          weight="fill"
                        />
                      )}
                      <Badge variant="neutral" size="sm">
                        {prompt.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-surface-400 line-clamp-2">
                    {prompt.content}
                  </p>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <Article className="w-12 h-12 text-surface-600 mx-auto mb-3" />
                <p className="text-surface-400">
                  {promptSearch
                    ? "No prompts match your search"
                    : "No prompts found"}
                </p>
                {!promptSearch && (
                  <Link href="/prompts/new" className="inline-block mt-3">
                    <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                      Create Prompt
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Quick Create Link */}
          {filteredPrompts.length > 0 && (
            <div className="pt-2 border-t border-surface-700">
              <Link
                href="/prompts/new"
                className="flex items-center justify-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors py-2"
              >
                <Plus className="w-4 h-4" />
                Create New Prompt
              </Link>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
