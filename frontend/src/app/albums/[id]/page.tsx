"use client";

import { useEffect, useState } from "react";

type Media = {
  id: string;
  original_filename: string;
  media_type: string;
  file_url: string;
};

type Album = {
  id: string;
  name: string;
  description: string;
  media_count: number;
  media: Media[];
};

export default function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [albumId, setAlbumId] = useState("");

  useEffect(() => {
    async function initialize() {
      const resolvedParams = await params;
      setAlbumId(resolvedParams.id);
      await loadAlbum(resolvedParams.id);
    }

    initialize();
  }, [params]);

  async function loadAlbum(id: string) {
    try {
      const response = await fetch(
        `http://localhost:8000/api/media/albums/${id}/`
      );
      const data = await response.json();
      setAlbum(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function removeFromAlbum(mediaId: string) {
    try {
      const response = await fetch(
        `http://localhost:8000/api/media/albums/${albumId}/remove-media/${mediaId}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await loadAlbum(albumId);
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (!album) {
    return (
      <main className="p-8">Loading Album...</main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">📁 {album.name}</h1>
      <p className="text-gray-500 mt-2">{album.description}</p>
      <p className="mt-2">{album.media_count} items</p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Album Media</h2>

      <div className="grid md:grid-cols-4 gap-4">
        {album.media?.length === 0 ? (
          <p>No media in this album.</p>
        ) : (
          album.media.map((item) => (
            <div key={item.id} className="border rounded p-2">
              {item.media_type === "image" ? (
                <img
                  src={item.file_url}
                  alt={item.original_filename}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="h-40 flex items-center justify-center text-5xl">
                  🎥
                </div>
              )}

              <button
                onClick={() => removeFromAlbum(item.id)}
                className="mt-2 text-red-600 underline"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
