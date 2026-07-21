import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';
import { SiteSettings } from '../types';

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const FALLBACK_WHATSAPP = '+20123456789';

function applyTheme(settings: any) {
  if (!settings) return;

  const root = document.documentElement;

  if (settings.primary_color)    root.style.setProperty('--color-primary',    settings.primary_color);
  if (settings.secondary_color)  root.style.setProperty('--color-secondary',  settings.secondary_color);
  if (settings.accent_color)     root.style.setProperty('--color-accent',     settings.accent_color);
  if (settings.background_color) root.style.setProperty('--color-background', settings.background_color);

  if (settings.font_family) {
    root.style.setProperty('--font-family', settings.font_family);
    document.body.style.fontFamily = `'${settings.font_family}', sans-serif`;
  }

  if (settings.animation_speed) {
    const speedMap: Record<string, string> = {
      slow:   '0.6s',
      medium: '0.3s',
      fast:   '0.15s',
    };
    root.style.setProperty('--animation-speed', speedMap[settings.animation_speed] || '0.3s');
  }

  if (settings.enable_animations === false) {
    root.style.setProperty('--animation-speed', '0s');
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Error fetching settings:', error);
        setSettings(null);
        return;
      }
      
      const settingsData = data && data.length > 0 ? data[0] : null;
      console.log('Settings loaded from Supabase:', settingsData);
      setSettings(settingsData);
      applyTheme(settingsData);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: fetchSettings }}>
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

export function useWhatsAppNumber() {
  const { settings } = useSettings();
  return (settings as any)?.whatsapp_number || FALLBACK_WHATSAPP;
}