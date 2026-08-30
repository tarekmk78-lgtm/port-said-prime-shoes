import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';

interface SiteSettings {
  id?: string;
  site_name?: string;
  site_name_ar?: string;
  tagline?: string;
  tagline_ar?: string;
  logo_url?: string;
  favicon_url?: string;
  contact_email?: string;
  contact_phone?: string;
  whatsapp_number?: string;
  contact_address?: string;
  contact_address_en?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_youtube?: string;
  social_tiktok?: string;
  meta_title?: string;
  meta_title_ar?: string;
  meta_description?: string;
  meta_description_ar?: string;
  meta_keywords?: string;
  shipping_cost?: number;
  free_shipping_threshold?: number;
  tax_rate?: number;
  currency?: string;
  currency_symbol?: string;
  about_title_ar?: string;
  about_title_en?: string;
  about_subtitle_ar?: string;
  about_subtitle_en?: string;
  about_description_ar?: string;
  about_description_en?: string;
  about_image_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  font_family?: string;
  layout_style?: string;
  hero_layout?: string;
  grid_columns?: number;
  template_id?: string;
  enable_animations?: boolean;
  animation_speed?: string;
  banner_title_ar?: string;
  banner_title_en?: string;
  banner_link?: string;
  banner_image_url?: string;
  banner_is_active?: boolean;
  [key: string]: any;
}

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')  // ✅ تم التعديل من site_settings إلى settings
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      if (settings.id) {
        const { error } = await supabase
          .from('settings')  // ✅ تم التعديل
          .update({ ...newSettings, updated_at: new Date().toISOString() })
          .eq('id', settings.id);

        if (error) throw error;
        setSettings({ ...settings, ...newSettings });
      } else {
        const { data, error } = await supabase
          .from('settings')  // ✅ تم التعديل
          .insert([{ ...newSettings, created_at: new Date().toISOString() }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setSettings(data);
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}