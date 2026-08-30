import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { ChevronLeft, ChevronRight, Pause, Play, ShoppingBag } from 'lucide-react';

interface HeroSlide {
  id: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  media_type: 'image' | 'video';
  media_url: string;
  media_url_ar?: string;
  media_url_en?: string;
  video_url: string;
  button_text_ar: string;
  button_text_en: string;
  button_link: string;
  display_order: number;
  is_active: boolean;
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
    }, 6000);
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

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const togglePlay = () => setIsPlaying(!isPlaying);

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
    return slide.media_url;
  };

  if (loading) {
    return <div className="relative h-[280px] sm:h-[350px] md:h-[400px] lg:h-[450px] bg-gray-950" />;
  }

  if (slides.length === 0) {
    return (
      <div className="relative h-[280px] sm:h-[350px] md:h-[400px] lg:h-[450px] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
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

  const isAr = language === 'ar';

  return (
    <section className="relative h-[280px] sm:h-[350px] md:h-[400px] lg:h-[450px] bg-black overflow-hidden select-none">
      {/* Slides */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-0'
            }`}
          >
            {/* Media */}
            {slide.media_type === 'image' ? (
              <img
                src={getMediaUrl(slide)}
                alt={`Hero Slide ${index + 1}`}
                className="w-full h-full object-cover object-center pointer-events-none"
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
            
            {/* ✅ Gradient ذكي حسب اللغة */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 md:bg-gradient-to-b md:from-black/20 ${
              isAr 
                ? 'md:bg-gradient-to-l md:from-black/85 md:via-black/40 md:to-transparent' 
                : 'md:bg-gradient-to-r md:from-black/85 md:via-black/40 md:to-transparent'
            }`} />
          </div>
        ))}
      </div>

      {/* ✅ شريط علوي - شحن مجاني */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/30 backdrop-blur-[2px] py-2 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-4 text-white/90 text-[10px] md:text-xs tracking-wider">
            <span>
              {isAr ? 'شحن مجاني لجميع الطلبات | ضمان استرجاع 14 يوم' : 'Free Shipping on All Orders | 14-Day Return Guarantee'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 md:px-12 flex items-center pt-8 z-10">
        <div className={`w-full md:w-1/2 ${isAr ? 'text-right' : 'text-left'}`}>
          <p className="text-amber-500 text-[11px] md:text-sm font-bold uppercase mb-1 md:mb-2 tracking-widest">
            {isAr ? slides[currentSlide].subtitle_ar : slides[currentSlide].subtitle_en}
          </p>

          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2 md:mb-3 leading-tight drop-shadow-md">
            {isAr ? slides[currentSlide].title_ar : slides[currentSlide].title_en}
          </h1>

          <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-6">
            {slides[currentSlide].button_link && (
              <Link
                to={slides[currentSlide].button_link}
                className="inline-flex items-center gap-1.5 px-4 py-2 md:px-6 md:py-3 bg-amber-600 text-white text-xs md:text-sm rounded-md font-bold hover:bg-amber-700 transition-all shadow-lg active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {isAr ? slides[currentSlide].button_text_ar : slides[currentSlide].button_text_en}
              </Link>
            )}
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-4 py-2 md:px-6 md:py-3 bg-white/10 backdrop-blur-md text-white text-xs md:text-sm border border-white/20 rounded-md font-bold hover:bg-white/20 transition-all active:scale-95"
            >
              {isAr ? 'استكشف المجموعة' : 'Explore Collection'}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/10 hover:bg-black/40 border border-white/10 rounded-full text-white/60 hover:text-white transition-all transform active:scale-90"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/10 hover:bg-black/40 border border-white/10 rounded-full text-white/60 hover:text-white transition-all transform active:scale-90"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-amber-500 w-6' : 'bg-white/30 hover:bg-white/50 w-1.5'
                }`}
              />
            ))}
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="md:hidden absolute bottom-3 right-3 sm:right-4 z-20 p-2 bg-black/10 hover:bg-black/40 border border-white/10 rounded-full text-white/60 hover:text-white transition-all"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
        </>
      )}
    </section>
  );
}