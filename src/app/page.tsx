'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

// Custom hook for intersection observer animations
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Animation component wrapper
function FadeInSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, isInView } = useInView();
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${className}`}
      style={{
        transform: isInView ? 'translateY(0)' : 'translateY(60px)',
        opacity: isInView ? 1 : 0,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const heroImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1920&q=80',
  ];

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Hero image slideshow
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-[#3E362E]">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled 
          ? 'bg-[#3E362E]/95 backdrop-blur-xl shadow-2xl py-4' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 border-[#AC8968]/30 group-hover:border-[#AC8968] transition-all duration-500 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="Omkar Hotel"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-3xl font-serif font-normal text-[#C9A66B] tracking-[0.15em]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>OMKAR</span>
              <span className="block text-[10px] text-[#C9A66B]/70 tracking-[0.4em] uppercase mt-0.5">HOTEL</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-12">
            {['About', 'Rooms', 'Experience', 'Dining', 'Contact'].map((item, i) => (
              <Link 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="relative text-[#A69080] hover:text-[#AC8968] transition-colors duration-300 text-sm tracking-widest uppercase font-medium group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#AC8968] group-hover:w-full transition-all duration-500" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="tel:+919876543210"
              className="hidden md:flex items-center gap-2 text-[#A69080] hover:text-[#AC8968] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm tracking-wider">+91 98765 43210</span>
            </Link>
            <Link 
              href="/book"
              className="px-8 py-3 bg-[#865D36] text-white font-semibold text-sm tracking-widest uppercase hover:bg-[#AC8968] transition-all duration-500 hover:shadow-lg hover:shadow-[#865D36]/30 hover:-translate-y-0.5"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Cinematic Full Screen */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Slideshow */}
        {heroImages.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[2000ms]"
            style={{ opacity: currentSlide === i ? 1 : 0 }}
          >
            <Image
              src={img}
              alt="Luxury Hotel"
              fill
              className="object-cover scale-110"
              priority={i === 0}
            />
          </div>
        ))}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#3E362E]/80 via-[#3E362E]/40 to-[#3E362E]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3E362E]/60 via-transparent to-[#3E362E]/60" />
        
        {/* Animated Grain Texture */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />

        {/* Hero Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-5xl">
            {/* Animated Line */}
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-[#AC8968] to-transparent mx-auto mb-8 animate-pulse" />
            
            {/* Subtitle */}
            {isClient && (
              <p 
                className="text-[#AC8968] text-sm md:text-base tracking-[0.4em] uppercase mb-6 animate-fade-in-up"
                style={{ animationDelay: '300ms' }}
              >
                Welcome to Luxury
              </p>
            )}

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-white mb-6 leading-[1.1] tracking-tight">
              <span className="block overflow-hidden">
                <span className={`block ${isClient ? 'animate-slide-up' : ''}`} style={{ animationDelay: '500ms' }}>
                  Experience
                </span>
              </span>
              <span className="block overflow-hidden">
                <span className={`block text-[#AC8968] ${isClient ? 'animate-slide-up' : ''}`} style={{ animationDelay: '700ms' }}>
                  Timeless Elegance
                </span>
              </span>
            </h1>
            
            {/* Description */}
            {isClient && (
              <p 
                className="text-lg md:text-xl text-[#A69080] mb-12 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in-up"
                style={{ animationDelay: '900ms' }}
              >
                Where traditional hospitality meets contemporary luxury. 
                Discover a sanctuary of sophistication in the heart of the city.
              </p>
            )}

            {/* CTA Buttons */}
            {isClient && (
              <div 
                className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up"
                style={{ animationDelay: '1100ms' }}
              >
                <Link 
                  href="/book"
                  className="group relative px-12 py-5 bg-[#865D36] text-white overflow-hidden"
                >
                  <span className="relative z-10 text-sm tracking-[0.3em] uppercase font-medium flex items-center justify-center gap-3">
                    Reserve Your Stay
                    <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-[#AC8968] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
                <Link 
                  href="#rooms"
                  className="group px-12 py-5 border border-[#AC8968]/50 text-[#AC8968] hover:bg-[#AC8968]/10 transition-all duration-500"
                >
                  <span className="text-sm tracking-[0.3em] uppercase font-medium">Explore Rooms</span>
                </Link>
              </div>
            )}
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-3">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-12 h-1 transition-all duration-500 ${
                  currentSlide === i ? 'bg-[#AC8968]' : 'bg-[#A69080]/30'
                }`}
              />
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce-slow">
            <span className="text-[#A69080] text-xs tracking-[0.3em] uppercase">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-[#AC8968] to-transparent" />
          </div>
        </div>

        {/* Side Stats */}
        {isClient && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8">
            {[
              { value: '15+', label: 'Years' },
              { value: '50+', label: 'Rooms' },
              { value: '4.9', label: 'Rating' },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="text-right animate-fade-in-right"
                style={{ animationDelay: `${1300 + i * 200}ms` }}
              >
                <div className="text-3xl font-serif text-[#AC8968]">{stat.value}</div>
                <div className="text-xs text-[#A69080] tracking-widest uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 bg-[#3E362E]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Image Gallery */}
            <FadeInSection>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="relative h-80 overflow-hidden group">
                      <Image
                        src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"
                        alt="Luxury Suite"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-[#865D36]/0 group-hover:bg-[#865D36]/20 transition-colors duration-500" />
                    </div>
                    <div className="relative h-48 overflow-hidden group">
                      <Image
                        src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80"
                        alt="Pool"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-[#865D36]/0 group-hover:bg-[#865D36]/20 transition-colors duration-500" />
                    </div>
                  </div>
                  <div className="space-y-4 pt-12">
                    <div className="relative h-48 overflow-hidden group">
                      <Image
                        src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80"
                        alt="Restaurant"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-[#865D36]/0 group-hover:bg-[#865D36]/20 transition-colors duration-500" />
                    </div>
                    <div className="relative h-80 overflow-hidden group">
                      <Image
                        src="https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80"
                        alt="Spa"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-[#865D36]/0 group-hover:bg-[#865D36]/20 transition-colors duration-500" />
                    </div>
                  </div>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-8 -right-8 bg-[#865D36] text-white p-8 shadow-2xl">
                  <div className="text-5xl font-serif">15+</div>
                  <div className="text-sm tracking-widest uppercase mt-2 text-[#3E362E]">Years Excellence</div>
                </div>
              </div>
            </FadeInSection>

            {/* Content */}
            <div className="lg:pl-12">
              <FadeInSection delay={200}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-px bg-[#AC8968]" />
                  <span className="text-[#AC8968] text-sm tracking-[0.3em] uppercase">Our Story</span>
                </div>
              </FadeInSection>
              
              <FadeInSection delay={400}>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white mb-8 leading-tight">
                  A Legacy of
                  <span className="block text-[#AC8968]">Exceptional Hospitality</span>
                </h2>
              </FadeInSection>
              
              <FadeInSection delay={600}>
                <p className="text-lg text-[#A69080] mb-6 leading-relaxed">
                  For over 15 years, Omkar Hotel has been a sanctuary of refined luxury. 
                  Our commitment to excellence is reflected in every detail, from our 
                  meticulously designed spaces to our personalized service.
                </p>
                <p className="text-lg text-[#A69080] mb-10 leading-relaxed">
                  We believe in creating experiences that transcend the ordinary, 
                  where every moment becomes a cherished memory.
                </p>
              </FadeInSection>
              
              <FadeInSection delay={800}>
                <div className="grid grid-cols-2 gap-8 mb-12">
                  {[
                    { icon: '✦', label: 'Award Winning Service' },
                    { icon: '✦', label: 'World-Class Cuisine' },
                    { icon: '✦', label: 'Luxurious Spa' },
                    { icon: '✦', label: 'Prime Location' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-[#93785B]">
                      <span className="text-[#AC8968]">{item.icon}</span>
                      <span className="text-sm tracking-wider">{item.label}</span>
                    </div>
                  ))}
                </div>
              </FadeInSection>
              
              <FadeInSection delay={1000}>
                <Link 
                  href="#experience"
                  className="group inline-flex items-center gap-4 text-[#AC8968] hover:text-white transition-colors"
                >
                  <span className="text-sm tracking-[0.3em] uppercase">Discover More</span>
                  <div className="w-12 h-12 rounded-full border border-[#AC8968] flex items-center justify-center group-hover:bg-[#AC8968] group-hover:border-[#AC8968] transition-all duration-500">
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-32 px-6 bg-gradient-to-b from-[#3E362E] to-[#3E362E]/95">
        <div className="max-w-7xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-20">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-16 h-px bg-[#AC8968]" />
                <span className="text-[#AC8968] text-sm tracking-[0.3em] uppercase">Accommodations</span>
                <div className="w-16 h-px bg-[#AC8968]" />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white mb-6">
                Exquisite <span className="text-[#AC8968]">Rooms & Suites</span>
              </h2>
              <p className="text-lg text-[#A69080] max-w-2xl mx-auto">
                Each room is a masterpiece of design, offering the perfect blend of comfort and sophistication.
              </p>
            </div>
          </FadeInSection>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Classic Room',
                price: '₹2,500',
                image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
                features: ['32 sqm', 'City View', 'King Bed', 'Smart TV'],
                description: 'Elegant comfort with modern amenities'
              },
              {
                name: 'Deluxe Suite',
                price: '₹4,500',
                image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
                features: ['48 sqm', 'Garden View', 'Living Area', 'Mini Bar'],
                featured: true,
                description: 'Spacious luxury with premium touches'
              },
              {
                name: 'Presidential Suite',
                price: '₹8,500',
                image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80',
                features: ['85 sqm', 'Panoramic View', 'Butler Service', 'Private Terrace'],
                description: 'The pinnacle of refined living'
              },
            ].map((room, i) => (
              <FadeInSection key={i} delay={i * 200}>
                <div className={`group relative bg-[#3E362E] border border-[#93785B]/20 overflow-hidden transition-all duration-700 hover:border-[#AC8968]/50 ${room.featured ? 'lg:-mt-8 lg:mb-8' : ''}`}>
                  {room.featured && (
                    <div className="absolute top-6 right-6 z-10 px-4 py-2 bg-[#865D36] text-white text-xs tracking-widest uppercase">
                      Recommended
                    </div>
                  )}
                  
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3E362E] via-transparent to-transparent" />
                  </div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-serif text-white mb-2">{room.name}</h3>
                        <p className="text-[#A69080] text-sm">{room.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-serif text-[#AC8968]">{room.price}</div>
                        <div className="text-xs text-[#A69080] tracking-wider">per night</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mb-8">
                      {room.features.map((feature, j) => (
                        <span key={j} className="px-3 py-1 border border-[#93785B]/30 text-[#A69080] text-xs tracking-wider">
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <Link 
                      href="/book"
                      className="group/btn flex items-center justify-between w-full py-4 px-6 bg-transparent border border-[#AC8968]/50 text-[#AC8968] hover:bg-[#865D36] hover:border-[#865D36] hover:text-white transition-all duration-500"
                    >
                      <span className="text-sm tracking-widest uppercase">Book This Room</span>
                      <svg className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section - Full Width Image with Parallax */}
      <section id="experience" className="relative py-48 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&q=80"
            alt="Hotel Experience"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#3E362E]/85" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <FadeInSection>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-px bg-[#AC8968]" />
                <span className="text-[#AC8968] text-sm tracking-[0.3em] uppercase">The Experience</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white mb-8 leading-tight">
                Indulge in
                <span className="block text-[#AC8968]">World-Class Amenities</span>
              </h2>
              <p className="text-lg text-[#A69080] mb-12 leading-relaxed">
                From our infinity pool with panoramic views to our award-winning spa, 
                every amenity is designed to elevate your stay into an unforgettable journey.
              </p>
              
              <Link 
                href="/book"
                className="group inline-flex items-center gap-4 px-10 py-5 bg-[#865D36] text-white hover:bg-[#AC8968] transition-all duration-500"
              >
                <span className="text-sm tracking-[0.3em] uppercase">Plan Your Experience</span>
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </FadeInSection>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: '🏊', title: 'Infinity Pool', desc: 'Rooftop oasis with city views' },
                { icon: '💆', title: 'Luxury Spa', desc: 'Rejuvenating treatments' },
                { icon: '🍽️', title: 'Fine Dining', desc: 'World-class cuisine' },
                { icon: '🏋️', title: 'Fitness Center', desc: '24/7 premium equipment' },
              ].map((amenity, i) => (
                <FadeInSection key={i} delay={i * 150}>
                  <div className="group p-8 bg-[#3E362E]/80 backdrop-blur-sm border border-[#93785B]/20 hover:border-[#AC8968]/50 transition-all duration-500">
                    <span className="text-4xl mb-4 block">{amenity.icon}</span>
                    <h3 className="text-xl font-serif text-white mb-2">{amenity.title}</h3>
                    <p className="text-[#A69080] text-sm">{amenity.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="dining" className="py-32 px-6 bg-[#3E362E]">
        <div className="max-w-7xl mx-auto">
          <FadeInSection>
            <div className="text-center mb-20">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-16 h-px bg-[#AC8968]" />
                <span className="text-[#AC8968] text-sm tracking-[0.3em] uppercase">Testimonials</span>
                <div className="w-16 h-px bg-[#AC8968]" />
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-light text-white">
                Guest <span className="text-[#AC8968]">Experiences</span>
              </h2>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Priya Sharma', location: 'Mumbai', text: 'An absolutely magical experience. The attention to detail and warm hospitality made our anniversary truly special.' },
              { name: 'Rajesh Kumar', location: 'Delhi', text: 'The finest hotel I have ever stayed in. The staff anticipated our every need, and the suite was breathtaking.' },
              { name: 'Anita Desai', location: 'Bangalore', text: 'From the moment we arrived, we felt like royalty. The spa treatments were divine, and the dining was exceptional.' },
            ].map((review, i) => (
              <FadeInSection key={i} delay={i * 200}>
                <div className="p-10 bg-[#3E362E] border border-[#93785B]/20 hover:border-[#AC8968]/30 transition-all duration-500">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className="text-[#AC8968]">★</span>
                    ))}
                  </div>
                  <p className="text-[#A69080] mb-8 leading-relaxed italic">&ldquo;{review.text}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#865D36] rounded-full flex items-center justify-center text-white font-serif text-xl">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{review.name}</div>
                      <div className="text-[#A69080] text-sm">{review.location}</div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80"
            alt="Book Now"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#865D36]/90" />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-6">
          <FadeInSection>
            <div className="w-px h-20 bg-white/30 mx-auto mb-10" />
            <h2 className="text-4xl md:text-6xl font-serif font-light text-white mb-6 leading-tight">
              Begin Your Journey
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Let us create an experience you&apos;ll treasure forever. 
              Reserve your sanctuary of luxury today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/book"
                className="px-12 py-5 bg-white text-[#3E362E] font-semibold text-sm tracking-[0.3em] uppercase hover:bg-[#AC8968] hover:text-white transition-all duration-500"
              >
                Reserve Now
              </Link>
              <Link 
                href="tel:+919876543210"
                className="px-12 py-5 border-2 border-white text-white font-semibold text-sm tracking-[0.3em] uppercase hover:bg-white hover:text-[#3E362E] transition-all duration-500 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#3E362E] text-white py-20 px-6 border-t border-[#93785B]/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-16 mb-16">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border border-[#AC8968]/30">
                  <Image
                    src="/logo.png"
                    alt="Omkar Hotel"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="text-2xl font-serif font-normal text-[#C9A66B] tracking-[0.15em]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>OMKAR</span>
                  <span className="block text-[9px] text-[#C9A66B]/70 tracking-[0.4em] uppercase">HOTEL</span>
                </div>
              </div>
              <p className="text-[#A69080] mb-8 leading-relaxed">
                A sanctuary of luxury and refined hospitality in the heart of the city.
              </p>
              <div className="flex gap-4">
                {['FB', 'TW', 'IG', 'LI'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="w-10 h-10 border border-[#93785B]/30 flex items-center justify-center text-[#A69080] hover:bg-[#865D36] hover:border-[#865D36] hover:text-white transition-all duration-500 text-xs tracking-wider"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg mb-8 text-[#AC8968] tracking-wider">Explore</h4>
              <ul className="space-y-4">
                {['About Us', 'Accommodations', 'Dining', 'Spa & Wellness', 'Events'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[#A69080] hover:text-[#AC8968] transition-colors text-sm tracking-wider">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg mb-8 text-[#AC8968] tracking-wider">Services</h4>
              <ul className="space-y-4">
                {['Room Service', 'Concierge', 'Airport Transfer', 'Valet Parking', 'Laundry'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[#A69080] hover:text-[#AC8968] transition-colors text-sm tracking-wider">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg mb-8 text-[#AC8968] tracking-wider">Contact</h4>
              <ul className="space-y-4 text-[#A69080] text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-[#AC8968] mt-1">↳</span>
                  123 Luxury Lane, City Center, State 400001
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#AC8968]">↳</span>
                  <a href="tel:+919876543210" className="hover:text-[#AC8968] transition-colors">+91 98765 43210</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#AC8968]">↳</span>
                  <a href="mailto:stay@omkarhotel.com" className="hover:text-[#AC8968] transition-colors">stay@omkarhotel.com</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#93785B]/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#A69080] text-sm tracking-wider">
              © {new Date().getFullYear()} Omkar Hotel. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm tracking-wider">
              <a href="#" className="text-[#A69080] hover:text-[#AC8968] transition-colors">Privacy</a>
              <a href="#" className="text-[#A69080] hover:text-[#AC8968] transition-colors">Terms</a>
              <a href="#" className="text-[#A69080] hover:text-[#AC8968] transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0) translateX(-50%);
          }
          50% {
            transform: translateY(-10px) translateX(-50%);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 1s ease-out forwards;
          opacity: 0;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #3E362E;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #865D36;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #AC8968;
        }
      `}</style>
    </div>
  );
}
