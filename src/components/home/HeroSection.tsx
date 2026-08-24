import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  id: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  media_type: 'image' | 'video';
  media_url: string;
  video_url: string;
  button_text_ar: string;
  button_text_en: string;
  button_link: string;
}

export function HeroSection() {
  const { language } = useI18n();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  // التبديل التلقائي كل 5 ثواني
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`;
  };

  const getVimeoEmbedUrl = (url: string) => {
    const videoId = url.split('/').pop();
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1`;
  };

  if (loading) {
    return (
      <div className="h-[600px] bg-gray-200 animate-pulse" />
    );
  }

  if (slides.length === 0) {
    return (
      <div className="h-[600px] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {language === 'ar' ? 'مرحباً بكم' : 'Welcome'}
          </h1>
          <p className="text-xl">
            {language === 'ar' ? 'اكتشف مجموعتنا الجديدة' : 'Discover our new collection'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Media */}
          <div className="absolute inset-0">
            {slide.media_type === 'image' ? (
              <img
                src={slide.media_url}
                alt={language === 'ar' ? slide.title_ar : slide.title_en}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full">
                {slide.video_url?.includes('youtube') ? (
                  <iframe
                    src={getYouTubeEmbedUrl(slide.video_url)}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; muted"
                    title="Hero Video"
                  />
                ) : slide.video_url?.includes('vimeo') ? (
                  <iframe
                    src={getVimeoEmbedUrl(slide.video_url)}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; muted"
                    title="Hero Video"
                  />
                ) : null}
              </div>
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 flex items-center">
            <div className="text-white max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6">
                {language === 'ar' ? slide.title_ar : slide.title_en || slide.title_ar}
              </h1>
              <p className="text-lg md:text-xl mb-6 md:mb-8">
                {language === 'ar' ? slide.subtitle_ar : slide.subtitle_en || slide.subtitle_ar}
              </p>
              {slide.button_link && (
                <Link
                  to={slide.button_link}
                  className="inline-flex items-center gap-2 bg-[#B8956E] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#9e7d58] transition-colors"
                >
                  {language === 'ar' ? slide.button_text_ar : slide.button_text_en || slide.button_text_ar}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8 md:w-10' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}