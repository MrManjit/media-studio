import { Media } from "./media";

export interface Album {
  id: string;
  name: string;
  description: string;
  media_count: number;

  cover_image: string | null;
  cover_image_url: string | null;

  created_at: string;
  updated_at: string;
}

export interface AlbumDetail extends Album {
  media: Media[];
}