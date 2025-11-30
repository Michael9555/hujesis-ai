"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Article,
  ArrowLeft,
  PencilSimple,
  Trash,
  Star,
  Copy,
  Lightning,
  Clock,
  Sparkle,
  Tag,
  Sliders,
  FloppyDisk,
  X,
} from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import {
  Button,
  Card,
  Input,
  Textarea,
  Select,
  Spinner,
  Badge,
  Modal,
} from "@/components/ui";
import { promptSchema, PromptFormData } from "@/utils/validation";
import api from "@/services/api";
import { Prompt, PromptCategory } from "@/types";
import { format } from "date-fns";
import classNames from "classnames";

const CATEGORIES: { value: PromptCategory; label: string }[] = [
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
  { value: "abstract", label: "Abstract" },
  { value: "fantasy", label: "Fantasy" },
  { value: "scifi", label: "Sci-Fi" },
  { value: "anime", label: "Anime" },
  { value: "realistic", label: "Realistic" },
  { value: "artistic", label: "Artistic" },
  { value: "other", label: "Other" },
];

export default function PromptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const promptId = params.promptId as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [category, setCategory] = useState<PromptCategory>("other");
  const [showDescription, setShowDescription] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PromptFormData>({
    resolver: yupResolver(promptSchema),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchPrompt = async () => {
      if (!promptId || !isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.getPrompt(promptId);
        setPrompt(response.data);
        setCategory(response.data.category);
        setShowDescription(!!response.data.description);
        reset({
          title: response.data.title,
          content: response.data.content,
          negativePrompt: response.data.negativePrompt || "",
          description: response.data.description || "",
          category: response.data.category,
          tags: response.data.tags?.join(", ") || "",
        });
      } catch (err) {
        console.error("Failed to fetch prompt:", err);
        setError(
          "Failed to load prompt. It may not exist or you may not have permission to view it."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, [promptId, isAuthenticated, reset]);

  const handleToggleFavorite = async () => {
    if (!prompt) return;
    try {
      const response = await api.togglePromptFavorite(prompt.id);
      setPrompt(response.data);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleDuplicate = async () => {
    if (!prompt) return;
    try {
      const response = await api.duplicatePrompt(prompt.id);
      router.push(`/prompts/${response.data.id}`);
    } catch (err) {
      console.error("Failed to duplicate prompt:", err);
    }
  };

  const handleDelete = async () => {
    if (!prompt) return;
    try {
      await api.deletePrompt(prompt.id);
      router.push("/prompts");
    } catch (err) {
      console.error("Failed to delete prompt:", err);
    }
  };

  const onSubmit = async (data: PromptFormData) => {
    if (!prompt) return;

    try {
      const tags = data.tags
        ?.split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const response = await api.updatePrompt(prompt.id, {
        title: data.title,
        content: data.content,
        negativePrompt: data.negativePrompt || undefined,
        description: data.description || undefined,
        category: category,
        tags: tags?.length ? tags : undefined,
      });

      setPrompt(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update prompt:", err);
    }
  };

  const handleCancelEdit = () => {
    if (prompt) {
      reset({
        title: prompt.title,
        content: prompt.content,
        negativePrompt: prompt.negativePrompt || "",
        description: prompt.description || "",
        category: prompt.category,
        tags: prompt.tags?.join(", ") || "",
      });
      setCategory(prompt.category);
    }
    setIsEditing(false);
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-surface-400 hover:text-surface-100 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <Card className="text-center py-16">
          <Article className="w-16 h-16 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-100 mb-2">
            Prompt not found
          </h3>
          <p className="text-surface-400 mb-6">
            {error ||
              "The prompt you are looking for does not exist or has been deleted."}
          </p>
          <Link href="/prompts">
            <Button>View All Prompts</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/prompts")}
          className="flex items-center gap-2 text-surface-400 hover:text-surface-100 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Prompts
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Article className="w-8 h-8 text-primary-400" weight="fill" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-surface-100">
                {isEditing ? "Edit Prompt" : prompt.title}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-surface-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(new Date(prompt.createdAt), "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Sparkle className="w-4 h-4" />
                  {prompt.usageCount} uses
                </span>
              </div>
            </div>
          </div>

          {!isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                className={classNames(
                  "p-2.5 rounded-xl border transition-all",
                  prompt.isFavorite
                    ? "bg-warning-500/10 border-warning-500/30 text-warning-400"
                    : "bg-surface-900/50 border-surface-700 text-surface-400 hover:border-surface-600"
                )}
              >
                <Star
                  className="w-5 h-5"
                  weight={prompt.isFavorite ? "fill" : "regular"}
                />
              </button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<PencilSimple className="w-4 h-4" />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Title"
              placeholder="Give your prompt a memorable title"
              error={errors.title?.message}
              {...register("title")}
            />

            <Textarea
              label="Prompt Content"
              placeholder="A majestic dragon flying over a medieval castle at sunset, highly detailed, cinematic lighting, 4k, artstation..."
              minRows={4}
              maxRows={10}
              error={errors.content?.message}
              {...register("content")}
            />

            <Textarea
              label="Negative Prompt (optional)"
              placeholder="blurry, low quality, distorted, ugly, bad anatomy..."
              minRows={2}
              maxRows={4}
              error={errors.negativePrompt?.message}
              {...register("negativePrompt")}
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
                {...register("tags")}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowDescription(!showDescription)}
              className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-300 transition-colors"
            >
              <Sliders className="w-4 h-4" />
              {showDescription ? "Hide" : "Show"} description
            </button>

            {showDescription && (
              <Textarea
                label="Description (optional)"
                placeholder="Add notes or context about this prompt..."
                minRows={2}
                maxRows={4}
                error={errors.description?.message}
                {...register("description")}
              />
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelEdit}
                leftIcon={<X className="w-5 h-5" />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!isDirty}
                leftIcon={<FloppyDisk className="w-5 h-5" />}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <>
          {/* View Mode */}
          <div className="space-y-6">
            {/* Category & Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral">{prompt.category}</Badge>
              {prompt.tags && prompt.tags.length > 0 && (
                <>
                  {prompt.tags.map((tag) => (
                    <Badge key={tag} variant="primary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </>
              )}
            </div>

            {/* Main Content */}
            <Card>
              <h3 className="text-sm font-medium text-surface-400 mb-2">
                Prompt
              </h3>
              <p className="text-surface-100 whitespace-pre-wrap leading-relaxed">
                {prompt.content}
              </p>
            </Card>

            {prompt.negativePrompt && (
              <Card>
                <h3 className="text-sm font-medium text-surface-400 mb-2">
                  Negative Prompt
                </h3>
                <p className="text-surface-300 whitespace-pre-wrap leading-relaxed">
                  {prompt.negativePrompt}
                </p>
              </Card>
            )}

            {prompt.description && (
              <Card>
                <h3 className="text-sm font-medium text-surface-400 mb-2">
                  Description
                </h3>
                <p className="text-surface-300 whitespace-pre-wrap leading-relaxed">
                  {prompt.description}
                </p>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <h3 className="text-sm font-medium text-surface-400 mb-4">
                Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="accent"
                  leftIcon={<Lightning className="w-5 h-5" weight="fill" />}
                  onClick={() => {
                    // Could navigate to generate page with this prompt
                    console.log("Generate with prompt");
                  }}
                >
                  Generate Image
                </Button>
                <Button
                  variant="secondary"
                  leftIcon={<Copy className="w-4 h-4" />}
                  onClick={handleDuplicate}
                >
                  Duplicate
                </Button>
                <Button
                  variant="danger"
                  leftIcon={<Trash className="w-4 h-4" />}
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Delete
                </Button>
              </div>
            </Card>

            {/* Metadata */}
            <Card className="bg-surface-900/30">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-surface-500 block mb-1">Created</span>
                  <span className="text-surface-200">
                    {format(new Date(prompt.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div>
                  <span className="text-surface-500 block mb-1">Updated</span>
                  <span className="text-surface-200">
                    {format(new Date(prompt.updatedAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div>
                  <span className="text-surface-500 block mb-1">
                    Usage Count
                  </span>
                  <span className="text-surface-200">{prompt.usageCount}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Prompt"
        description="This action cannot be undone."
      >
        <p className="text-surface-300 mb-6">
          Are you sure you want to delete &quot;{prompt.title}&quot;? This will
          permanently remove the prompt and all associated data.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
