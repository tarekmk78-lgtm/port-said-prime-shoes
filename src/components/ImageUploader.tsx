import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  folder?: string;
}

export function ImageUploader({ onUpload, currentImage, folder = 'hero-images' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📁 بدء عملية الرفع:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      folder: folder,
    });

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('يرجى اختيار صورة فقط (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجا');
      return;
    }

    setUploading(true);

    try {
      // إنشاء اسم فريد للملف
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}.${fileExt}`;

      console.log('📤 الرفع إلى bucket:', 'product-images');
      console.log('📝 مسار الملف:', fileName);

      // محاولة الرفع
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('❌ خطأ في الرفع:', uploadError);
        throw uploadError;
      }

      console.log('✅ تم الرفع بنجاح:', data);

      // الحصول على الرابط العام
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      console.log('🔗 الرابط العام:', urlData.publicUrl);

      setPreview(urlData.publicUrl);
      onUpload(urlData.publicUrl);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في رفع الصورة:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      toast.error(`فشل في رفع الصورة: ${errorMessage}`);
    } finally {
      setUploading(false);
      // إعادة تعيين input للسماح برفع نفس الملف مرة أخرى
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = () => {
    setPreview('');
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="معاينة الصورة"
            className="w-full h-64 object-cover rounded-lg border border-gray-200"
            onError={() => {
              console.error('❌ فشل تحميل المعاينة:', preview);
            }}
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="إزالة الصورة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#B8956E] transition-colors bg-gray-50"
        >
          {uploading ? (
            <Loader2 className="h-12 w-12 text-[#B8956E] animate-spin" />
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">اضغط لرفع صورة</p>
              <p className="text-gray-400 text-sm mt-1">JPG, PNG, WebP (أقل من 5 ميجا)</p>
            </>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}