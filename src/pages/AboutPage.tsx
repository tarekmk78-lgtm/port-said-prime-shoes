import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { useSettings } from '../lib/settings-context';
import { ArrowRight, Heart, Leaf, Award, MapPin } from 'lucide-react';
import { useSEO } from '../lib/seo';

export function AboutPage() {
  const { language, isRTL } = useI18n();
  const { settings, loading } = useSettings();
  
  useSEO({
    title: language === 'ar' ? 'من نحن' : 'About Us',
    description:
      language === 'ar'
        ? 'بورسعيد برايم شوز - أحذية جلدية فاخرة من قلب بورسعيد'
        : "Port Said Prime Shoes - Premium leather footwear from the heart of Port Said",
    url: '/about',
  });

  const Arrow = () => <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />;

  const values = [
    {
      icon: Heart,
      title: language === 'ar' ? 'ثقة العميل' : 'Customer Trust',
      text: language === 'ar'
        ? 'نحن نؤمن بأن ثقة العميل هي العامل الاساسي فى النجاح'
        : 'We believe that customer trust is the key factor in success',
    },
    {
      icon: Leaf,
      title: language === 'ar' ? 'جلد طبيعي' : 'Genuine Leather',
      text: language === 'ar'
        ? 'احذيتنا جلد طبيعي عالية الجودة لذلك نحن متميزون لثقتكم بنا'
        : 'Our shoes are high-quality genuine leather, which is why we are distinguished for your trust in us',
    },
    {
      icon: Award,
      title: language === 'ar' ? 'جودة وأناقة' : 'Quality & Style',
      text: language === 'ar'
        ? 'مع التركيز الدائم على الجودة والراحة والأناقة'
        : 'With a constant focus on quality, comfort, and elegance',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8956E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero */}
      <section className="relative bg-ink overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[55vh]">
          <div className="relative z-10 flex items-center px-6 md:px-14 py-20">
            <div className="max-w-lg">
              <span className="eyebrow text-gold-light">
                {language === 'ar' 
                  ? (settings?.about_subtitle_ar || 'بورسعيد - منذ سنوات')
                  : (settings?.about_subtitle_en || 'Port Said - Since Years')}
              </span>
              <h1 className="font-display text-4xl md:text-5xl text-white mt-6 mb-6 leading-tight">
                {language === 'ar' 
                  ? (settings?.about_title_ar || 'من نحن')
                  : (settings?.about_title_en || 'About Us')}
              </h1>
              <p className="text-white/65 text-lg leading-relaxed">
                {language === 'ar'
                  ? (settings?.about_description_ar || 'بورسعيد برايم شوز بدات من قلب بورسعيد')
                  : (settings?.about_description_en || 'Port Said Prime Shoes started from the heart of Port Said')}
              </p>
            </div>
          </div>
          <div className="relative min-h-[30vh]">
            <img 
              loading="lazy" 
              decoding="async"
              src={settings?.about_image_url || 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=1200'}
              alt={language === 'ar' ? 'ورشة بورسعيد برايم شوز' : 'Port Said Prime Shoes workshop'}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-ink via-ink/10 to-transparent" />
          </div>
        </div>
        <div className="sole-curve" style={{ background: '#FAFAFA' }} />
      </section>

      {/* Story - المحتوى الجديد */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <span className="eyebrow justify-center">
            {language === 'ar' ? 'حكايتنا' : 'Our Story'}
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink mt-3 mb-6">
            {language === 'ar' 
              ? 'بورسعيد برايم شوز بدات من قلب بورسعيد' 
              : 'Port Said Prime Shoes Started from the Heart of Port Said'}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            {language === 'ar'
              ? 'نحن نؤمن بأن ثقة العميل هي العامل الاساسي فى النجاح, لذلك نسعى لتقديم أرقى أنواع الأحذية لعملائنا في بورسعيد ومصر'
              : "We believe that customer trust is the key factor in success, so we strive to provide the finest types of footwear to our customers in Port Said and Egypt"}
          </p>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            {language === 'ar'
              ? 'كل يوم نقدّم تشكيلة متنوعة من افضل وارقي موديلات الأحذية العالمية ، مع التركيز الدائم على الجودة والراحة والأناقة.'
              : 'Every day we offer a diverse collection of the best and most elegant global footwear models, with a constant focus on quality, comfort, and elegance.'}
          </p>
          <p className="text-gray-600 text-lg leading-relaxed font-medium">
            {language === 'ar'
              ? 'احذيتنا جلد طبيعي عالية الجودة لذلك نحن متميزون لثقتكم بنا'
              : 'Our shoes are high-quality genuine leather, which is why we are distinguished for your trust in us'}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-white border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <span className="eyebrow justify-center">
              {language === 'ar' ? 'قيمنا' : 'Our Values'}
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {values.map((v, i) => (
              <div key={i} className="text-center px-4">
                <div className="w-16 h-16 rounded-full border border-[#B8956E]/30 flex items-center justify-center mx-auto mb-5">
                  <v.icon className="w-7 h-7 text-[#B8956E]" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink mb-2">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location + CTA */}
      <section className="py-16 md:py-20 bg-ink">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <MapPin className="h-7 w-7 text-[#B8956E] mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-white mb-3">
            {language === 'ar' ? 'تفضّل بزيارتنا في بورسعيد' : 'Visit us in Port Said'}
          </h2>
          <p className="text-white/55 mb-8">
            {language === 'ar' ? 'بورسعيد، مصر' : 'Port Said, Egypt'}
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2.5 px-7 py-4 bg-[#B8956E] text-ink font-semibold rounded-sm hover:bg-[#D9BB96] transition-colors"
          >
            {language === 'ar' ? 'تسوق المجموعة' : 'Shop the collection'}
            <Arrow />
          </Link>
        </div>
      </section>
    </div>
  );
}