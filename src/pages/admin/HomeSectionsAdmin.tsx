import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { HomeSection } from '../../types';
import toast from 'react-hot-toast';

export function HomeSectionsAdmin() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<Partial<HomeSection> | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  async function fetchSections() {
    const { data, error } = await supabase
      .from('home_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      toast.error('Error fetching sections');
      console.error(error);
    } else {
      setSections(data || []);
    }
    setLoading(false);
  }

  async function handleSave(section: Partial<HomeSection>) {
    try {
      if (section.id) {
        // Update existing
        const { error } = await supabase
          .from('home_sections')
          .update({
            section_type: section.section_type,
            title: section.title,
            title_ar: section.title_ar,
            subtitle: section.subtitle,
            subtitle_ar: section.subtitle_ar,
            image_url: section.image_url,
            link_url: section.link_url,
            button_text: section.button_text,
            button_text_ar: section.button_text_ar,
            discount_percentage: section.discount_percentage,
            is_active: section.is_active,
            sort_order: section.sort_order,
            background_color: section.background_color,
            text_color: section.text_color,
            updated_at: new Date().toISOString(),
          })
          .eq('id', section.id);

        if (error) throw error;
        toast.success('Section updated successfully');
      } else {
        // Create new
        const { error } = await supabase
          .from('home_sections')
          .insert([{
            section_type: section.section_type,
            title: section.title,
            title_ar: section.title_ar,
            subtitle: section.subtitle,
            subtitle_ar: section.subtitle_ar,
            image_url: section.image_url,
            link_url: section.link_url,
            button_text: section.button_text,
            button_text_ar: section.button_text_ar,
            discount_percentage: section.discount_percentage,
            is_active: section.is_active !== false,
            sort_order: section.sort_order || 0,
            background_color: section.background_color || '#ffffff',
            text_color: section.text_color || '#000000',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);

        if (error) throw error;
        toast.success('Section created successfully');
      }
      
      fetchSections();
      setEditingSection(null);
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Error saving section');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const { error } = await supabase
        .from('home_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Section deleted successfully');
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Error deleting section');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Home Page Sections</h1>
        <button
          onClick={() => setEditingSection({})}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add New Section
        </button>
      </div>

      {/* Edit/Create Form */}
      {editingSection && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {editingSection.id ? 'Edit Section' : 'Add New Section'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Section Type</label>
              <select
                value={editingSection.section_type || ''}
                onChange={(e) => setEditingSection({ ...editingSection, section_type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Type</option>
                <option value="category_men">Men's Category</option>
                <option value="category_women">Women's Category</option>
                <option value="promo_banner">Promotional Banner</option>
                <option value="featured_products">Featured Products</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title (English)</label>
              <input
                type="text"
                value={editingSection.title || ''}
                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
                placeholder="Men's Collection"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title (Arabic)</label>
              <input
                type="text"
                value={editingSection.title_ar || ''}
                onChange={(e) => setEditingSection({ ...editingSection, title_ar: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
                placeholder="مجموعة الرجال"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtitle (English)</label>
              <input
                type="text"
                value={editingSection.subtitle || ''}
                onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtitle (Arabic)</label>
              <input
                type="text"
                value={editingSection.subtitle_ar || ''}
                onChange={(e) => setEditingSection({ ...editingSection, subtitle_ar: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <input
                type="text"
                value={editingSection.image_url || ''}
                onChange={(e) => setEditingSection({ ...editingSection, image_url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Link URL</label>
              <input
                type="text"
                value={editingSection.link_url || ''}
                onChange={(e) => setEditingSection({ ...editingSection, link_url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
                placeholder="/shop?gender=men"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Button Text (English)</label>
              <input
                type="text"
                value={editingSection.button_text || ''}
                onChange={(e) => setEditingSection({ ...editingSection, button_text: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
                placeholder="Shop Now"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Button Text (Arabic)</label>
              <input
                type="text"
                value={editingSection.button_text_ar || ''}
                onChange={(e) => setEditingSection({ ...editingSection, button_text_ar: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
                placeholder="تسوق الآن"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Discount Percentage (%)</label>
              <input
                type="number"
                value={editingSection.discount_percentage || ''}
                onChange={(e) => setEditingSection({ ...editingSection, discount_percentage: parseInt(e.target.value) || null })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
                placeholder="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sort Order</label>
              <input
                type="number"
                value={editingSection.sort_order || 0}
                onChange={(e) => setEditingSection({ ...editingSection, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <input
                type="color"
                value={editingSection.background_color || '#ffffff'}
                onChange={(e) => setEditingSection({ ...editingSection, background_color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg px-2 py-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Text Color</label>
              <input
                type="color"
                value={editingSection.text_color || '#000000'}
                onChange={(e) => setEditingSection({ ...editingSection, text_color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg px-2 py-1"
              />
            </div>

            <div className="flex items-center md:col-span-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editingSection.is_active !== false}
                onChange={(e) => setEditingSection({ ...editingSection, is_active: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="is_active" className="ml-2 text-sm font-medium">Active (Show on homepage)</label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSave(editingSection)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Save Section
            </button>
            <button
              onClick={() => setEditingSection(null)}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Existing Sections ({sections.length})</h2>
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
            {section.image_url && (
              <img src={section.image_url} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-lg">
                {section.title_ar} {section.title && `/ ${section.title}`}
              </h3>
              <p className="text-sm text-gray-600 mb-1">Type: <span className="font-medium">{section.section_type}</span></p>
              <p className="text-sm text-gray-500">Order: {section.sort_order} {section.is_active ? '✅' : '❌'}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setEditingSection(section)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(section.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}