'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Floating Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isScrolled ? 'bg-amber-600' : 'bg-white/20 backdrop-blur-sm'
            }`}>
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className={`text-2xl font-serif font-bold transition-colors ${
              isScrolled ? 'text-stone-800' : 'text-white'
            }`}>
              Omkar Hotel
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#about" className={`font-medium transition-colors hover:text-amber-500 ${
              isScrolled ? 'text-stone-600' : 'text-white/90'
            }`}>About</Link>
            <Link href="#rooms" className={`font-medium transition-colors hover:text-amber-500 ${
              isScrolled ? 'text-stone-600' : 'text-white/90'
            }`}>Rooms</Link>
            <Link href="#amenities" className={`font-medium transition-colors hover:text-amber-500 ${
              isScrolled ? 'text-stone-600' : 'text-white/90'
            }`}>Amenities</Link>
            <Link href="#contact" className={`font-medium transition-colors hover:text-amber-500 ${
              isScrolled ? 'text-stone-600' : 'text-white/90'
            }`}>Contact</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="tel:+919876543210"
              className={`hidden sm:flex items-center gap-2 transition-colors ${
                isScrolled ? 'text-stone-600' : 'text-white/90'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-medium">+91 98765 43210</span>
            </Link>
            <Link 
              href="/book"
              className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                isScrolled 
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/25' 
                  : 'bg-white text-stone-800 hover:bg-amber-500 hover:text-white'
              }`}
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"
            alt="Luxury Hotel"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-400 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Premium Hospitality Experience</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              Welcome to
              <span className="block text-amber-400">Omkar Hotel</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience unparalleled luxury and comfort in the heart of the city. 
              Your perfect escape awaits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/book"
                className="group px-8 py-4 bg-amber-600 text-white rounded-full font-semibold text-lg hover:bg-amber-500 transition-all shadow-2xl shadow-amber-600/30 flex items-center justify-center gap-2"
              >
                Reserve Your Stay
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link 
                href="#rooms"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold text-lg hover:bg-white/20 transition-all border border-white/30"
              >
                Explore Rooms
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-20 pb-8">
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '50+', label: 'Luxury Rooms' },
                { value: '15+', label: 'Years of Excellence' },
                { value: '10K+', label: 'Happy Guests' },
                { value: '4.9', label: 'Guest Rating' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">{stat.value}</div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Quick Booking Bar */}
      <section className="relative -mt-20 z-10 px-6">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-500">Check-in</label>
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-stone-700 font-medium">Select Date</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-500">Check-out</label>
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-stone-700 font-medium">Select Date</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-500">Guests</label>
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-stone-700 font-medium">2 Adults</span>
              </div>
            </div>
            <Link 
              href="/book"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl font-semibold hover:from-amber-500 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/25 mt-auto"
            >
              <span>Check Availability</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Grid */}
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"
                    alt="Hotel Room"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80"
                    alt="Hotel Pool"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80"
                    alt="Hotel Dining"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80"
                    alt="Hotel Spa"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
              {/* Experience Badge */}
              <div className="absolute -bottom-6 -right-6 bg-amber-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-4xl font-bold">15+</div>
                <div className="text-amber-100 text-sm">Years of Excellence</div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:pl-8">
              <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-6">
                About Our Hotel
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-6 leading-tight">
                A Legacy of Luxury &
                <span className="text-amber-600"> Hospitality</span>
              </h2>
              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                Nestled in the heart of the city, Omkar Hotel has been a beacon of luxury and comfort for over 15 years. Our commitment to exceptional service and attention to detail has made us a preferred choice for discerning travelers.
              </p>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                From our elegantly appointed rooms to our world-class amenities, every aspect of your stay is designed to exceed expectations and create lasting memories.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[
                  { icon: '🏆', text: 'Award Winning' },
                  { icon: '🌟', text: 'Premium Service' },
                  { icon: '🍽️', text: 'Fine Dining' },
                  { icon: '💆', text: 'Luxury Spa' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-medium text-stone-700">{item.text}</span>
                  </div>
                ))}
              </div>

              <Link 
                href="/book"
                className="inline-flex items-center gap-2 px-8 py-4 bg-stone-800 text-white rounded-full font-semibold hover:bg-stone-700 transition-all"
              >
                Discover More
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-24 px-6 bg-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-6">
              Our Accommodations
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4">
              Luxurious <span className="text-amber-600">Rooms & Suites</span>
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Choose from our carefully curated selection of rooms, each designed to provide the ultimate comfort and luxury.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Standard Room',
                price: '₹2,500',
                image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
                features: ['Queen Bed', 'City View', 'Free WiFi', '24/7 Service'],
              },
              {
                name: 'Deluxe Room',
                price: '₹4,000',
                image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
                features: ['King Bed', 'Pool View', 'Mini Bar', 'Room Service'],
                popular: true,
              },
              {
                name: 'Premium Suite',
                price: '₹7,500',
                image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80',
                features: ['Living Area', 'Ocean View', 'Butler Service', 'Private Balcony'],
              },
            ].map((room, i) => (
              <div key={i} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {room.popular && (
                    <div className="absolute top-4 right-4 px-4 py-1 bg-amber-500 text-white text-sm font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-serif font-bold text-stone-800">{room.name}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-600">{room.price}</div>
                      <div className="text-stone-500 text-sm">/night</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {room.features.map((feature, j) => (
                      <span key={j} className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Link 
                    href="/book"
                    className="block w-full py-3 text-center bg-stone-800 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/book"
              className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700"
            >
              View All Rooms
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-24 px-6 bg-gradient-to-br from-stone-800 to-stone-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-6">
              Hotel Amenities
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              World-Class <span className="text-amber-400">Facilities</span>
            </h2>
            <p className="text-lg text-stone-300 max-w-2xl mx-auto">
              Discover a world of comfort and convenience with our premium amenities designed for your pleasure.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: '🏊', name: 'Swimming Pool', desc: 'Infinity pool' },
              { icon: '💆', name: 'Luxury Spa', desc: 'Full service' },
              { icon: '🍽️', name: 'Restaurant', desc: 'Multi-cuisine' },
              { icon: '🏋️', name: 'Fitness Center', desc: '24/7 access' },
              { icon: '📶', name: 'Free WiFi', desc: 'High-speed' },
              { icon: '🚗', name: 'Valet Parking', desc: 'Complimentary' },
            ].map((amenity, i) => (
              <div key={i} className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-amber-500/20 hover:border-amber-500/30 transition-all text-center">
                <div className="text-4xl mb-3">{amenity.icon}</div>
                <h3 className="font-semibold text-white mb-1">{amenity.name}</h3>
                <p className="text-stone-400 text-sm">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-6">
              Guest Reviews
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4">
              What Our <span className="text-amber-600">Guests Say</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Priya Sharma',
                location: 'Mumbai',
                text: 'An absolutely wonderful experience! The staff was incredibly attentive and the room was spotless. Will definitely return.',
                rating: 5,
              },
              {
                name: 'Rajesh Kumar',
                location: 'Delhi',
                text: 'The best hotel I\'ve stayed at in years. The amenities are top-notch and the restaurant serves amazing food.',
                rating: 5,
              },
              {
                name: 'Anita Patel',
                location: 'Bangalore',
                text: 'Perfect for both business and leisure. The location is excellent and the service is impeccable.',
                rating: 5,
              },
            ].map((review, i) => (
              <div key={i} className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-stone-600 mb-6 leading-relaxed">&quot;{review.text}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">{review.name}</div>
                    <div className="text-stone-500 text-sm">{review.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Ready for an Unforgettable Stay?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Book your room today and experience the finest hospitality at Omkar Hotel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/book"
              className="px-10 py-4 bg-white text-amber-600 rounded-full font-bold text-lg hover:bg-stone-100 transition-all shadow-xl"
            >
              Book Your Stay Now
            </Link>
            <Link 
              href="tel:+919876543210"
              className="px-10 py-4 bg-transparent text-white rounded-full font-bold text-lg border-2 border-white hover:bg-white hover:text-amber-600 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-stone-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">O</span>
                </div>
                <span className="text-2xl font-serif font-bold">Omkar Hotel</span>
              </div>
              <p className="text-stone-400 mb-6">
                Your home away from home. Experience luxury and comfort like never before.
              </p>
              <div className="flex gap-4">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                    <span className="sr-only">{social}</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {['About Us', 'Our Rooms', 'Amenities', 'Gallery', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-stone-400 hover:text-amber-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Services</h4>
              <ul className="space-y-3">
                {['Room Service', 'Restaurant', 'Spa & Wellness', 'Conference Hall', 'Airport Transfer'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-stone-400 hover:text-amber-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-stone-400">123 Hotel Street, City, State 400001</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+919876543210" className="text-stone-400 hover:text-amber-400 transition-colors">+91 98765 43210</a>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:info@omkarhotel.com" className="text-stone-400 hover:text-amber-400 transition-colors">info@omkarhotel.com</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-stone-500 text-sm">
              © {new Date().getFullYear()} Omkar Hotel. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-stone-500 hover:text-amber-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-stone-500 hover:text-amber-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-stone-500 hover:text-amber-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
