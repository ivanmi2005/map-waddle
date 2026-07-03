import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://laejlhdlxvdqrbjfdywd.supabase.co";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_ERVsvUdtmKBdk8OHCUCTGQ_ln80JKdD";

export const supabase = createClient(url, key);

export const IMAGES_BUCKET = "travel-images";

export function imageUrl(path: string | null): string | null {
  if (!path) return null;
  return supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadImage(blob: Blob): Promise<string> {
  const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "png";
  const path = `refs/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(path, blob, { contentType: blob.type || "image/png" });
  if (error) throw error;
  return path;
}
