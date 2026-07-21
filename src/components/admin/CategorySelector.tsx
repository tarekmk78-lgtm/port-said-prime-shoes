import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';

interface CategorySelectorProps {
  value: string | null;
  onChange: (id: string | null) => void;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const { language } = useI18n();
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (value) {
      const cat = categories.find(c => c.id === value);
      setSelected(cat);
    } else {
      setSelected(null);
    }
  }, [value, categories]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, name_ar')
      .order('name');
    setCategories(data || []);
  };

  if (selected) {
    return (
      <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex-1">
          <p className="font-medium text-sm">
            {language === 'ar' ? selected.name_ar : selected.name}
          </p>
        </div>
        <button
          onClick={() => onChange(null)}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          {language === 'ar' ? 'إزالة' : 'Remove'}
        </button>
      </div>
    );
  }

  return (
    <select
      value=""
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-200 rounded"
    >
      <option value="">
        {language === 'ar' ? 'اختر فئة...' : 'Select a category...'}
      </option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {language === 'ar' ? cat.name_ar : cat.name}
        </option>
      ))}
    </select>
  );
}