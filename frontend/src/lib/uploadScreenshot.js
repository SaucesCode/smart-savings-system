import { supabase } from "./supabaseClient";

/**
 * Uploads a GCash screenshot to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadScreenshot(file, userId) {
  const ext = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("screenshots")
    .upload(fileName, file, { upsert: false });

  if (error) throw new Error("Upload failed: " + error.message);

  const { data } = supabase.storage.from("screenshots").getPublicUrl(fileName);

  return data.publicUrl;
}
