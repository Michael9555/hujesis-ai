'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Images,
  MagnifyingGlass,
  Star,
  Trash,
  Download,
  Funnel,
  GridFour,
  Rows,
  X,
} from '@phosphor-icons/react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Select, Spinner, Badge, Modal } from '@/components/ui';
import api from '@/services/api';
import { GeneratedImage, ImageQueryParams, ImageStatus } from '@/types';
import { format } from 'date-fns';
import classNames from 'classnames';

const STATUS_OPTIONS: { value: ImageStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'processing', label: 'Processing' },
  { value: 'failed', label: 'Failed' },
];

export default function GalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<ImageStatus | ''>('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<GeneratedImage | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ImageQueryParams = {
        page,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      if (status) params.status = status;
      if (showFavorites) params.isFavorite = true;

      const response = await api.getImages(params);
      setImages(response.data);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, status, showFavorites]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchImages();
    }
  }, [isAuthenticated, fetchImages]);

  const handleToggleFavorite = async (image: GeneratedImage, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.toggleImageFavorite(image.id);
      setImages(images.map(img => 
        img.id === image.id ? { ...img, isFavorite: !img.isFavorite } : img
      ));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDelete = async () => {
    if (!imageToDelete) return;
    try {
      await api.deleteImage(imageToDelete.id);
      setImages(images.filter(img => img.id !== imageToDelete.id));
      setDeleteModalOpen(false);
      setImageToDelete(null);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.bulkDeleteImages(selectedIds);
      setImages(images.filter(img => !selectedIds.includes(img.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to bulk delete:', error);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const downloadImage = async (image: GeneratedImage, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download:', error);
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
            <Images className="w-8 h-8 text-accent-400" weight="fill" />
            Gallery
          </h1>
          <p className="text-surface-400 mt-1">
            Browse your generated images
          </p>
        </div>
        <Link href="/generate">
          <Button variant="accent">Generate New</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 flex-1">
            <Select
              value={status}
              onChange={(val) => setStatus(val as ImageStatus | '')}
              options={STATUS_OPTIONS}
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
              Favorites
            </button>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-surface-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={classNames(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'grid' ? 'bg-surface-700 text-surface-100' : 'text-surface-400'
                )}
              >
                <GridFour className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={classNames(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'list' ? 'bg-surface-700 text-surface-100' : 'text-surface-400'
                )}
              >
                <Rows className="w-5 h-5" />
              </button>
            </div>
            {selectedIds.length > 0 && (
              <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                Delete ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Images Grid/List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : images.length > 0 ? (
        <>
          <div
            className={classNames(
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                : 'space-y-4'
            )}
          >
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className={classNames(
                  'group cursor-pointer',
                  viewMode === 'grid'
                    ? 'aspect-square rounded-xl overflow-hidden relative bg-surface-800'
                    : 'glass-card-hover p-4 flex gap-4'
                )}
              >
                {viewMode === 'grid' ? (
                  <>
                    <img
                      src={image.thumbnailUrl || image.imageUrl}
                      alt="Generated"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-950/90 via-surface-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={
                              image.status === 'completed'
                                ? 'success'
                                : image.status === 'failed'
                                ? 'danger'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {image.status}
                          </Badge>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => handleToggleFavorite(image, e)}
                              className="p-1.5 rounded-lg bg-surface-800/80 hover:bg-surface-700 transition-colors"
                            >
                              <Star
                                className={classNames(
                                  'w-4 h-4',
                                  image.isFavorite ? 'text-warning-400' : 'text-surface-300'
                                )}
                                weight={image.isFavorite ? 'fill' : 'regular'}
                              />
                            </button>
                            <button
                              onClick={(e) => downloadImage(image, e)}
                              className="p-1.5 rounded-lg bg-surface-800/80 hover:bg-surface-700 transition-colors text-surface-300"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(image.id)}
                      onChange={() => toggleSelect(image.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2 left-2 w-4 h-4 rounded border-surface-600 bg-surface-800/80 text-primary-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    />
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-800 flex-shrink-0">
                      <img
                        src={image.thumbnailUrl || image.imageUrl}
                        alt="Generated"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-surface-400 line-clamp-2">
                            {image.promptUsed?.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={
                                image.status === 'completed'
                                  ? 'success'
                                  : image.status === 'failed'
                                  ? 'danger'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {image.status}
                            </Badge>
                            <span className="text-xs text-surface-500">
                              {image.width}×{image.height}
                            </span>
                            <span className="text-xs text-surface-500">
                              {format(new Date(image.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => handleToggleFavorite(image, e)}
                            className="p-2 rounded-lg hover:bg-surface-700 transition-colors"
                          >
                            <Star
                              className={classNames(
                                'w-5 h-5',
                                image.isFavorite ? 'text-warning-400' : 'text-surface-400'
                              )}
                              weight={image.isFavorite ? 'fill' : 'regular'}
                            />
                          </button>
                          <button
                            onClick={(e) => downloadImage(image, e)}
                            className="p-2 rounded-lg hover:bg-surface-700 transition-colors text-surface-400"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageToDelete(image);
                              setDeleteModalOpen(true);
                            }}
                            className="p-2 rounded-lg hover:bg-danger-500/10 transition-colors text-surface-400 hover:text-danger-400"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
          <Images className="w-16 h-16 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-100 mb-2">
            No images found
          </h3>
          <p className="text-surface-400 mb-6">
            {status || showFavorites
              ? 'Try adjusting your filters'
              : 'Generate your first image to get started'}
          </p>
          <Link href="/generate">
            <Button variant="accent">Generate Image</Button>
          </Link>
        </Card>
      )}

      {/* Image Preview Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        size="full"
        showCloseButton={false}
      >
        {selectedImage && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex items-center justify-center bg-surface-950 rounded-xl overflow-hidden">
              <img
                src={selectedImage.imageUrl}
                alt="Generated"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="w-full lg:w-80 space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    selectedImage.status === 'completed'
                      ? 'success'
                      : selectedImage.status === 'failed'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {selectedImage.status}
                </Badge>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 rounded-lg hover:bg-surface-700 transition-colors text-surface-400"
                >
                  <X className="w-5 h-5" weight="bold" />
                </button>
              </div>

              <div>
                <label className="text-xs text-surface-500 uppercase tracking-wider">Prompt</label>
                <p className="text-sm text-surface-200 mt-1">
                  {selectedImage.promptUsed}
                </p>
              </div>

              {selectedImage.negativePromptUsed && (
                <div>
                  <label className="text-xs text-surface-500 uppercase tracking-wider">Negative Prompt</label>
                  <p className="text-sm text-surface-400 mt-1">
                    {selectedImage.negativePromptUsed}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-surface-500 uppercase tracking-wider">Size</label>
                  <p className="text-sm text-surface-200">
                    {selectedImage.width}×{selectedImage.height}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-surface-500 uppercase tracking-wider">Steps</label>
                  <p className="text-sm text-surface-200">
                    {selectedImage.generationSettings?.steps || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-surface-500 uppercase tracking-wider">CFG Scale</label>
                  <p className="text-sm text-surface-200">
                    {selectedImage.generationSettings?.cfgScale || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-surface-500 uppercase tracking-wider">Seed</label>
                  <p className="text-sm text-surface-200">
                    {selectedImage.generationSettings?.seed || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs text-surface-500 uppercase tracking-wider">Created</label>
                <p className="text-sm text-surface-200">
                  {format(new Date(selectedImage.createdAt), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={(e) => handleToggleFavorite(selectedImage, e as unknown as React.MouseEvent)}
                  leftIcon={<Star className="w-4 h-4" weight={selectedImage.isFavorite ? 'fill' : 'regular'} />}
                >
                  {selectedImage.isFavorite ? 'Unfavorite' : 'Favorite'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={(e) => downloadImage(selectedImage, e as unknown as React.MouseEvent)}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setImageToDelete(null);
        }}
        title="Delete Image"
        description="This action cannot be undone."
      >
        <p className="text-surface-300 mb-6">
          Are you sure you want to delete this image?
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalOpen(false);
              setImageToDelete(null);
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


