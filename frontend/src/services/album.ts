import { API_URL } from "../config";
import type { Album, AlbumDetail } from "../types/album";

export async function getAlbums(): Promise<Album[]> {
  const response = await fetch(`${API_URL}/media/albums/`);

  if (!response.ok) {
    throw new Error("Failed to fetch albums");
  }

  return response.json();
}

export async function getAlbum(
  id: string
): Promise<AlbumDetail> {
  const response = await fetch(
    `${API_URL}/media/albums/${id}/`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch album");
  }

  return response.json();
}

export async function createAlbum(
  name: string,
  description: string
) {
  const response = await fetch(
    `${API_URL}/media/albums/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create album");
  }

  return response.json();
}

export async function deleteAlbum(id: string) {
  const response = await fetch(
    `${API_URL}/media/albums/${id}/`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete album");
  }

  return response.json();
}

export async function bulkAddMediaToAlbum(
  albumId: string,
  mediaIds: string[]
) {
  const response = await fetch(
    `${API_URL}/media/albums/${albumId}/bulk-add/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        media_ids: mediaIds,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add media");
  }

  return response.json();
}

export async function removeMediaFromAlbum(
  albumId: string,
  mediaId: string
) {
  const response = await fetch(
    `${API_URL}/media/albums/${albumId}/remove-media/${mediaId}/`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove media");
  }

  return response.json();
}