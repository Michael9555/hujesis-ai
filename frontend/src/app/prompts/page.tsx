'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Article,
  Plus,
  MagnifyingGlass,
  Star,
  DotsThree,
  Copy,
  Trash,
  Archive,
  Sparkle,
  Funnel,
} from '@phosphor-icons/react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Input, Select, Spinner, Badge, Modal } from '@/components/ui';
import api from '@/services/api';
import { Prompt, PromptCategory, PromptQueryParams } from '@/types';
import { format } from 'date-fns';
import classNames from 'classnames';

const CATEGORIES: { value: PromptCategory | ''; label: string }[] = [
  { value: '', label: 'All Categories' },
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

export default function PromptsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<PromptCategory | ''>('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const favParam = searchParams.get('isFavorite');
    if (favParam === 'true') {
      setShowFavorites(true);
    }
  }, [searchParams]);

  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: PromptQueryParams = {
        page,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      if (search) params.search = search;
      if (category) params.category = category;
      if (showFavorites) params.isFavorite = true;

      const response = await api.getPrompts(params);
      setPrompts(response.data);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, showFavorites]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPrompts();
    }
  }, [isAuthenticated, fetchPrompts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPrompts();
  };

  const handleToggleFavorite = async (prompt: Prompt, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.togglePromptFavorite(prompt.id);
      setPrompts(prompts.map(p => 
        p.id === prompt.id ? { ...p, isFavorite: !p.isFavorite } : p
      ));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDuplicate = async (prompt: Prompt) => {
    try {
      const response = await api.duplicatePrompt(prompt.id);
      setPrompts([response.data, ...prompts]);
    } catch (error) {
      console.error('Failed to duplicate prompt:', error);
    }
  };

  const handleArchive = async (prompt: Prompt) => {
    try {
      await api.archivePrompt(prompt.id);
      setPrompts(prompts.filter(p => p.id !== prompt.id));
    } catch (error) {
      console.error('Failed to archive prompt:', error);
    }
  };

  const handleDelete = async () => {
    if (!promptToDelete) return;
    try {
      await api.deletePrompt(promptToDelete.id);
      setPrompts(prompts.filter(p => p.id !== promptToDelete.id));
      setDeleteModalOpen(false);
      setPromptToDelete(null);
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-surface-100 flex items-center gap-3">
            <Article className="w-8 h-8 text-primary-400" weight="fill" />
            My Prompts
          </h1>
          <p className="text-surface-400 mt-1">
            Manage and organize your AI prompts
          </p>
        </div>
        <Link href="/prompts/new">
          <Button leftIcon={<Plus className="w-5 h-5" weight="bold" />}>
            New Prompt
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<MagnifyingGlass className="w-5 h-5" />}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={category}
              onChange={(val) => setCategory(val as PromptCategory | '')}
              options={CATEGORIES}
              className="w-40"
            />
            <button
              type="button"
              onClick={() => setShowFavorites(!showFavorites)}
              className={classNames(
                'px-4 py-3 rounded-xl border transition-all flex items-center gap-2',
                showFavorites
                  ? 'bg-warning-500/10 border-warning-500/30 text-warning-400'
                  : 'bg-surface-900/50 border-surface-700 text-surface-400 hover:border-surface-600'
              )}
            >
              <Star className="w-5 h-5" weight={showFavorites ? 'fill' : 'regular'} />
            </button>
            <Button type="submit" variant="secondary">
              <Funnel className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Prompts Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : prompts.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
              <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
                <Card variant="hover" className="h-full group">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="neutral" size="sm">
                      {prompt.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleToggleFavorite(prompt, e)}
                        className="p-1.5 rounded-lg hover:bg-surface-700 transition-colors"
                      >
                        <Star
                          className={classNames(
                            'w-5 h-5 transition-colors',
                            prompt.isFavorite ? 'text-warning-400' : 'text-surface-500'
                          )}
                          weight={prompt.isFavorite ? 'fill' : 'regular'}
                        />
                      </button>
                      <Menu as="div" className="relative">
                        <MenuButton
                          onClick={(e: React.MouseEvent) => e.preventDefault()}
                          className="p-1.5 rounded-lg hover:bg-surface-700 transition-colors text-surface-400"
                        >
                          <DotsThree className="w-5 h-5" weight="bold" />
                        </MenuButton>
                        <Transition
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <MenuItems className="absolute right-0 mt-1 w-48 rounded-xl bg-surface-800 border border-surface-700 shadow-xl py-1 z-10">
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDuplicate(prompt);
                                  }}
                                  className={classNames(
                                    'flex items-center gap-2 w-full px-4 py-2 text-sm',
                                    active ? 'bg-surface-700 text-surface-100' : 'text-surface-300'
                                  )}
                                >
                                  <Copy className="w-4 h-4" />
                                  Duplicate
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleArchive(prompt);
                                  }}
                                  className={classNames(
                                    'flex items-center gap-2 w-full px-4 py-2 text-sm',
                                    active ? 'bg-surface-700 text-surface-100' : 'text-surface-300'
                                  )}
                                >
                                  <Archive className="w-4 h-4" />
                                  Archive
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setPromptToDelete(prompt);
                                    setDeleteModalOpen(true);
                                  }}
                                  className={classNames(
                                    'flex items-center gap-2 w-full px-4 py-2 text-sm',
                                    active ? 'bg-danger-500/10 text-danger-400' : 'text-surface-300'
                                  )}
                                >
                                  <Trash className="w-4 h-4" />
                                  Delete
                                </button>
                              )}
                            </MenuItem>
                          </MenuItems>
                        </Transition>
                      </Menu>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-surface-100 mb-2 group-hover:text-primary-400 transition-colors">
                    {prompt.title}
                  </h3>
                  <p className="text-sm text-surface-400 line-clamp-3 mb-4">
                    {prompt.content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-surface-500">
                    <span>{format(new Date(prompt.createdAt), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1">
                      <Sparkle className="w-3 h-3" />
                      {prompt.usageCount} uses
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-surface-400">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="text-center py-16">
          <Article className="w-16 h-16 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-100 mb-2">
            No prompts found
          </h3>
          <p className="text-surface-400 mb-6">
            {search || category || showFavorites
              ? 'Try adjusting your filters'
              : 'Create your first prompt to get started'}
          </p>
          <Link href="/prompts/new">
            <Button leftIcon={<Plus className="w-5 h-5" />}>
              Create Prompt
            </Button>
          </Link>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPromptToDelete(null);
        }}
        title="Delete Prompt"
        description="This action cannot be undone."
      >
        <p className="text-surface-300 mb-6">
          Are you sure you want to delete &quot;{promptToDelete?.title}&quot;? This will also remove all associated data.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalOpen(false);
              setPromptToDelete(null);
            }}
          >
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


