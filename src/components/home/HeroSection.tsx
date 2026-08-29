import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface HeroSlide {
  id: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  media_type: 'image' | 'video';
  media_url: string;
  media_url_ar?: string; // ✅ إضافة صورة النسخة العربية
  media_url_en?: string; // ✅ إضافة صورة النسخة الإنجليزية
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
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, isPlaying]);

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

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`;
  };

  const getVimeoEmbedUrl = (url: string) => {
    const videoId = url.split('/').pop();
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1`;
  };

  // ✅ الدالة الذكية لاختيار الصورة بناءً على اللغة
  const getMediaUrl = (slide: HeroSlide) => {
    if (language === 'ar' && slide.media_url_ar) return slide.media_url_ar;
    if (language === 'en' && slide.media_url_en) return slide.media_url_en;
    return slide.media_url; // Fallback للصورة الافتراضية لو لم توجد صورة مخصصة
  };

  if (loading) {
    return (
      <div className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] bg-gray-200 animate-pulse" />
    );
  }

  if (slides.length === 0) {
    return (
      <div className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            {language === 'ar' ? 'مرحباً بكم' : 'Welcome'}
          </h1>
          <p className="text-sm sm:text-base md:text-lg">
            {language === 'ar' ? 'اكتشف مجموعتنا الجديدة' : 'Discover our new collection'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden group">
      {slides.map((slide, index) => {
        // ✅ تحديد الرابط الصحيح للصورة هنا
        const mediaUrl = getMediaUrl(slide);

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Media */}
            <div className="absolute inset-0">
              {slide.media_type === 'image' ? (
                <img
                  src={mediaUrl} // ✅ استخدام الرابط الديناميكي
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
              
              {/* ✅ Gradient ذكي حسب اللغة - يبرز النص */}
              <div 
                className={`absolute inset-0 ${
                  language === 'ar' 
                    ? 'bg-gradient-to-l from-black/80 via-black/50 to-transparent'  // عربي: gradient من اليمين
                    : 'bg-gradient-to-r from-black/80 via-black/50 to-transparent'  // إنجليزي: gradient من اليسار
                }`}
              />
            </div>

            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center">
              <div className={`text-white max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl ${
                language === 'ar' ? 'text-right ml-auto' : 'text-left mr-auto'
              }`}>
                <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight drop-shadow-2xl">
                  {language === 'ar' ? slide.title_ar : slide.title_en || slide.title_ar}
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-3 sm:mb-4 md:mb-6 lg:mb-8 line-clamp-2 drop-shadow-lg">
                  {language === 'ar' ? slide.subtitle_ar : slide.subtitle_en || slide.subtitle_ar}
                </p>
                {slide.button_link && (
                  <Link
                    to={slide.button_link}
                    className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#B8956E] text-white px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg font-semibold text-xs sm:text-sm md:text-base hover:bg-[#9e7d58] transition-colors shadow-lg"
                  >
                    {language === 'ar' ? slide.button_text_ar : slide.button_text_en || slide.button_text_ar}
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur rounded-full items-center justify-center hover:bg-white/30 transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur rounded-full items-center justify-center hover:bg-white/30 transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-white w-6 sm:w-8 md:w-10' 
                  : 'bg-white/50 w-1.5 sm:w-2'
              }`}
            />
          ))}
        </div>
      )}

      {/* Play/Pause Button */}
      {slides.length > 1 && (
        <button
          onClick={togglePlay}
          className="md:hidden absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 text-white" />
          ) : (
            <Play className="h-4 w-4 text-white" />
          )}
        </button>
      )}
    </div>
  );
}