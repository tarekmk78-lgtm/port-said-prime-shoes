import React, { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  bucket: 'product-images' | 'category-images' | 'site-media';
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
}

/**
 * Uploads files directly to Supabase Storage and returns their public URLs.
 * Requires the storage buckets + RLS policies from migration 003 to be applied.
 */
export function ImageUploader({ bucket, value, onChange, multiple = true, label }: ImageUploaderProps) {
  const { language } = useI18n();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const uploaded: string[] = [];

      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      onChange(multiple ? [...value, ...uploaded] : uploaded);
      toast.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(
        error.message?.includes('not found')
          ? (language === 'ar'
              ? 'لم يتم إنشاء حافظة التخزين بعد — راجع ملف migrations/003_storage.sql'
              : 'Storage bucket not found yet — run migrations/003_storage.sql first')
          : (language === 'ar' ? 'فشل رفع الصورة' : 'Image upload failed')
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

      <div className="flex flex-wrap gap-3 mb-3">
        {value.map((url, i) => (
          <div key={url + i} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 group">
            <img loading="lazy" decoding="async" src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-5 w-5 mb-1" />
              <span className="text-[10px]">{language === 'ar' ? 'إضافة' : 'Add'}</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <p className="text-xs text-gray-400 flex items-center gap-1.5">
        <Upload className="h-3 w-3" />
        {language === 'ar' ? 'JPG, PNG حتى 5MB لكل صورة' : 'JPG, PNG up to 5MB each'}
      </p>
    </div>
  );
}
