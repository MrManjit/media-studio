export interface Media {
  id: string;
  original_filename: string;
  media_type: "image" | "video";
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  file_url: string;
  created_at: string;
  updated_at: string;

  is_favorite: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
}