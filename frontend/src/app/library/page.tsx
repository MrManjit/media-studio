"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Media } from "../../types/media";
import MediaCard from "../../components/media/MediaCard";
import SelectionToolbar from "../../components/media/SelectionToolbar";
import AlbumSelectorModal from "../../components/media/AlbumSelectorModal";

import {
  getMedia,
  toggleFavorite as apiToggleFavorite,
  moveToTrash as apiMoveToTrash,
} from "../../services/media";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name A-Z" },
  { value: "small", label: "Smallest" },
  { value: "large", label: "Largest" },
] as const;

type FilterValue = (typeof FILTER_OPTIONS)[number]["value"];
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export default function LibraryPage() {
  const router = useRouter();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sort, setSort] = useState<SortValue>("newest");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [albumModalOpen, setAlbumModalOpen] = useState(false);

  const loadMedia = useCallback(async () => {
    try {
      const data = await getMedia();
      setMedia(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadMedia());
  }, [loadMedia]);

  const filteredMedia = useMemo(() => {
    return media
      .filter((item) => {
        const matchesSearch = item.original_filename
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesFilter = filter === "all" || item.media_type === filter;
        return matchesSearch && matchesFilter;
      })
      .slice()
      .sort((a, b) => {
        switch (sort) {
          case "oldest":
            return (
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
            );
          case "name":
            return a.original_filename.localeCompare(b.original_filename);
          case "small":
            return a.file_size - b.file_size;
          case "large":
            return b.file_size - a.file_size;
          default:
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
        }
      });
  }, [media, filter, search, sort]);

  const selectedCount = selectedIds.length;
  const selectedMedia = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return media.filter((item) => selectedSet.has(item.id));
  }, [media, selectedIds]);
  const canMakeCollage =
    selectedMedia.length >= 2 &&
    selectedMedia.every((item) => item.media_type === "image");
  const allFilteredSelected =
    filteredMedia.length > 0 &&
    filteredMedia.every((item) => selectedIds.includes(item.id));

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((mediaId) => mediaId !== id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(filteredMedia.map((item) => item.id));
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      setActionLoading(true);
      const result = await apiToggleFavorite(id);
      setMedia((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, is_favorite: result.is_favorite }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update favorite.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveToTrash = async (id: string) => {
    const confirmDelete = window.confirm("Move this media to Trash?");
    if (!confirmDelete) {
      return;
    }

    try {
      setActionLoading(true);
      await apiMoveToTrash(id);
      setMedia((current) => current.filter((item) => item.id !== id));
      setSelectedIds((current) => current.filter((mediaId) => mediaId !== id));
      if (previewMedia?.id === id) {
        setPreviewMedia(null);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to move media to trash.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreview = (mediaItem: Media) => {
    setPreviewMedia(mediaItem);
  };

  const handleAddToAlbum = () => {
    if (selectedCount === 0) {
      return;
    }
    setAlbumModalOpen(true);
  };

  const handleMakeCollage = () => {
    if (!canMakeCollage) {
      return;
    }

    router.push(`/collage?ids=${selectedMedia.map((item) => item.id).join(",")}`);
  };

  const handleCancelSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkFavorite = async () => {
    if (selectedCount === 0) {
      return;
    }

    try {
      setActionLoading(true);
      const results = await Promise.all(
        selectedIds.map(async (id) => {
          const result = await apiToggleFavorite(id);
          return { id, is_favorite: result.is_favorite };
        })
      );
      const favoriteMap = new Map(results.map((item) => [item.id, item.is_favorite]));
      setMedia((current) =>
        current.map((item) =>
          favoriteMap.has(item.id)
            ? { ...item, is_favorite: favoriteMap.get(item.id) ?? item.is_favorite }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to favorite selected media.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkTrash = async () => {
    if (selectedCount === 0) {
      return;
    }

    const confirmDelete = window.confirm("Move selected media to Trash?");
    if (!confirmDelete) {
      return;
    }

    try {
      setActionLoading(true);
      await Promise.all(selectedIds.map(async (id) => apiMoveToTrash(id)));
      setMedia((current) => current.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      setPreviewMedia(null);
    } catch (error) {
      console.error(error);
      alert("Failed to trash selected media.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAlbumSuccess = () => {
    setAlbumModalOpen(false);
    setSelectedIds([]);
  };

  if (loading) {
    return <main className="p-8">Loading media...</main>;
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">📁 Media Library</h1>
      <p className="text-gray-500 mt-2">{filteredMedia.length} items</p>

      <SelectionToolbar
        count={selectedCount}
        canMakeCollage={canMakeCollage}
        onAddToAlbum={handleAddToAlbum}
        onMakeCollage={handleMakeCollage}
        onFavorite={handleBulkFavorite}
        onTrash={handleBulkTrash}
        onCancel={handleCancelSelection}
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={handleSelectAll}
            className="border rounded-lg px-4 py-2 bg-slate-100 hover:bg-slate-200"
          >
            {allFilteredSelected ? "Deselect all" : "Select all"}
          </button>

          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterValue)}
            className="border rounded-lg px-4 py-2"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
            className="border rounded-lg px-4 py-2"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">
          {selectedCount > 0
            ? `${selectedCount} selected`
            : "Select items to act on them."}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {filteredMedia.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            selected={selectedIds.includes(item.id)}
            onSelect={toggleSelection}
            onPreview={handlePreview}
            onFavorite={() => handleToggleFavorite(item.id)}
            onTrash={() => handleMoveToTrash(item.id)}
          />
        ))}
      </div>

      {previewMedia && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-5xl w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-lg font-semibold">Preview</div>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex justify-center">
              {previewMedia.media_type === "image" ? (
                <img
                  src={previewMedia.file_url}
                  alt={previewMedia.original_filename}
                  className="max-h-[80vh] object-contain"
                />
              ) : (
                <video controls className="max-h-[80vh] w-full">
                  <source src={previewMedia.file_url} />
                </video>
              )}
            </div>
          </div>
        </div>
      )}

      <AlbumSelectorModal
        open={albumModalOpen}
        mediaIds={selectedIds}
        onClose={() => setAlbumModalOpen(false)}
        onSuccess={handleAlbumSuccess}
      />
    </main>
  );
}
