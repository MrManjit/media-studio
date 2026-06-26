// import { API_URL } from "@/config";
// import { Media } from "@/types/media";
import { API_URL } from "../config";
import type { Media } from "../types/media";

export async function getMedia(): Promise<Media[]> {
  const response = await fetch(`${API_URL}/media/`);

  if (!response.ok) {
    throw new Error("Failed to fetch media");
  }

  return response.json();
}

export async function toggleFavorite(id: string) {
  const response = await fetch(
    `${API_URL}/media/${id}/favorite/`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update favorite");
  }

  return response.json();
}

export async function moveToTrash(id: string) {
  const response = await fetch(
    `${API_URL}/media/${id}/`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to move media to trash");
  }

  return response.json();
}

export async function restoreMedia(id: string) {
  const response = await fetch(
    `${API_URL}/media/${id}/restore/`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to restore media");
  }

  return response.json();
}

export async function permanentlyDeleteMedia(id: string) {
  const response = await fetch(
    `${API_URL}/media/${id}/permanent/`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to permanently delete media");
  }

  return response.json();
}