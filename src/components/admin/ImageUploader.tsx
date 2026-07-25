import React, { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { Upload, X, Loader2, ImagePlus, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// مكون الصورة القابلة للسحب
function SortableImage({
  url,
  index,
  onRemove,
}: {
  url: string;
  index: number;
  onRemove: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 group cursor-move"
    >
      <img
        loading="lazy"
        decoding="async"
        src={url}
        alt=""
        className="w-full h-full object-cover pointer-events-none"
      />
      
      {/* أيقونة السحب */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
      >
        <GripVertical className="h-5 w-5 text-white" />
      </div>

      {/* زر الحذف */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="absolute top-1 right-1 p-0.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        <X className="h-3 w-3" />
      </button>

      {/* رقم الترتيب */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
        {index + 1}
      </div>
    </div>
  );
}

interface ImageUploaderProps {
  bucket: 'product-images' | 'category-images' | 'site-media';
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
}

export function ImageUploader({
  bucket,
  value,
  onChange,
  multiple = true,
  label,
}: ImageUploaderProps) {
  const { language } = useI18n();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // إعدادات السحب والإفلات
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      toast.success(
        language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully'
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(
        error.message?.includes('not found')
          ? language === 'ar'
            ? 'لم يتم إنشاء حافظة التخزين بعد — راجع ملف migrations/003_storage.sql'
            : 'Storage bucket not found yet — run migrations/003_storage.sql first'
          : language === 'ar'
          ? 'فشل رفع الصورة'
          : 'Image upload failed'
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  // معالجة نهاية السحب
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((img) => img === active.id);
      const newIndex = value.findIndex((img) => img === over.id);
      const newOrder = arrayMove(value, oldIndex, newIndex);
      onChange(newOrder);
      
      toast.success(
        language === 'ar' ? 'تم تغيير ترتيب الصور' : 'Image order updated'
      );
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {/* عرض الصور مع السحب والإفلات */}
      {value.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">
            {language === 'ar'
              ? 'اسحب الصور لتغيير ترتيبها (الصورة الأولى هي الصورة الرئيسية)'
              : 'Drag images to reorder (first image is the main image)'}
          </p>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={value}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-3">
                {value.map((url, i) => (
                  <SortableImage
                    key={url}
                    url={url}
                    index={i}
                    onRemove={removeAt}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* زر إضافة صور جديدة */}
      <div className="flex flex-wrap gap-3">
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
              <span className="text-[10px]">
                {language === 'ar' ? 'إضافة' : 'Add'}
              </span>
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

      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-2">
        <Upload className="h-3 w-3" />
        {language === 'ar'
          ? 'JPG, PNG حتى 5MB لكل صورة • اسحب لتغيير الترتيب'
          : 'JPG, PNG up to 5MB each • Drag to reorder'}
      </p>
    </div>
  );
}