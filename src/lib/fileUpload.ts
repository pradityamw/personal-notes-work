import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface UploadResult {
  url: string;
  name: string;
  type: string;
  size: number;
}

/**
 * Uploads a file either to Supabase Storage ('project-files' bucket)
 * or converts to base64 Data URL for offline / local preview.
 */
export async function uploadProjectFile(file: File): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('project-files')
          .getPublicUrl(data.path);

        return {
          url: publicUrlData.publicUrl,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
        };
      } else if (error) {
        console.warn('Supabase storage upload error, falling back to local reader:', error.message);
      }
    } catch (err) {
      console.warn('Storage exception:', err);
    }
  }

  // Fallback: Convert to Base64 Data URL so local users can still preview & persist
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
      });
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
