export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 gradient-hero opacity-60 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2940"
            alt="Mahabaleshwar Hills"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hero Content */}
        <div className="container-custom relative z-20 text-center text-white animate-fade-in">
          <div className="relative z-10 text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              Experience Luxury in the Heart of Mahabaleshwar
            </h1>
            <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] font-medium">
              Discover unparalleled comfort and breathtaking views at Omkar Hotel
            </p>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="/book" className="btn-gold text-lg px-8 py-4">
                🏨 Book Your Stay
              </a>
              <a href="/book" className="btn-secondary text-lg px-8 py-4 bg-white/20 border-white/40 text-white hover:bg-white/30 backdrop-blur-sm">
                📸 Explore Rooms
              </a>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-20">
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-neutral-200">
              <div className="text-4xl font-bold text-brand-primary mb-1">25+</div>
              <div className="text-sm font-medium text-neutral-700">Premium Rooms</div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-neutral-200">
              <div className="text-4xl font-bold text-brand-secondary mb-1">4.9</div>
              <div className="text-sm font-medium text-neutral-700">Guest Rating</div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-neutral-200">
              <div className="text-4xl font-bold text-brand-primary mb-1">24/7</div>
              <div className="text-sm font-medium text-neutral-700">Room Service</div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-neutral-200">
              <div className="text-4xl font-bold text-brand-secondary mb-1">100%</div>
              <div className="text-sm font-medium text-neutral-700">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Room Types Section */}
      <section className="section bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-display font-bold mb-4 text-neutral-900">
              Our Premium Accommodations
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Choose from our carefully curated rooms designed for your comfort and relaxation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Deluxe Room */}
            <div className="card-interactive group">
              <div className="relative h-64 overflow-hidden rounded-t-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2940"
                  alt="Deluxe Room"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 z-20 text-white">
                  <h3 className="text-2xl font-display font-semibold">Deluxe Room</h3>
                  <p className="text-sm text-white/90">From ₹3,500/night</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-neutral-600 mb-4">
                  Luxurious room with stunning valley views and modern amenities
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm">🛏️ King Bed</span>
                  <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm">❄️ AC</span>
                  <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm">📶 WiFi</span>
                  <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm">🏔️ Valley View</span>
                </div>
                <button className="w-full btn-primary text-sm">View Details</button>
              </div>
            </div>

            {/* Suite */}
            <div className="card-interactive group">
              <div className="relative h-64 overflow-hidden rounded-t-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <div className="absolute top-4 right-4 z-20 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ Popular
                </div>
                <img
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2940"
                  alt="Suite"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 z-20 text-white">
                  <h3 className="text-2xl font-display font-semibold">Premium Suite</h3>
                  <p className="text-sm text-white/90">From ₹5,500/night</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-neutral-600 mb-4">
                  Spacious suite with separate living area and panoramic mountain views
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm">🛏️ King + Sofa Bed</span>
                  <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm">🛁 Jacuzzi</span>
                  <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm">🌄 Mountain View</span>
                </div>
                <button className="w-full btn-primary text-sm">View Details</button>
              </div>
            </div>

            {/* Family Room */}
            <div className="card-interactive group">
              <div className="relative h-64 overflow-hidden rounded-t-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1609766857041-ed402ea8069a?q=80&w=2940"
                  alt="Family Room"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 z-20 text-white">
                  <h3 className="text-2xl font-display font-semibold">Family Room</h3>
                  <p className="text-sm text-white/90">From ₹6,500/night</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-neutral-600 mb-4">
                  Perfect for families with multiple beds and entertainment options
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm">🛏️ Multiple Beds</span>
                  <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm">👨‍👩‍👧‍👦 Sleeps 5</span>
                  <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm">🍳 Kitchenette</span>
                </div>
                <button className="w-full btn-primary text-sm">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="section gradient-primary text-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-display font-bold mb-4">
              World-Class Amenities
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Everything you need for a perfect stay in Mahabaleshwar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-dark p-8 rounded-2xl text-center">
              <div className="text-5xl mb-4">🍳</div>
              <h3 className="text-xl font-semibold mb-2">Fine Dining</h3>
              <p className="text-white/80 text-sm">Multi-cuisine restaurant with local & international delicacies</p>
            </div>
            <div className="glass-dark p-8 rounded-2xl text-center">
              <div className="text-5xl mb-4">💆</div>
              <h3 className="text-xl font-semibold mb-2">Spa & Wellness</h3>
              <p className="text-white/80 text-sm">Relax and rejuvenate with our premium spa treatments</p>
            </div>
            <div className="glass-dark p-8 rounded-2xl text-center">
              <div className="text-5xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold mb-2">Airport Pickup</h3>
              <p className="text-white/80 text-sm">Convenient transportation from Pune Airport/Satara Station</p>
            </div>
            <div className="glass-dark p-8 rounded-2xl text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Activities</h3>
              <p className="text-white/80 text-sm">Trekking, sightseeing, and adventure tours</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-3xl font-display font-bold mb-4">Omkar Hotel</h3>
              <p className="text-neutral-400">
                Main Market Road, Mahabaleshwar<br />
                Maharashtra 412806, India
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="/rooms" className="hover:text-white transition-colors">Rooms</a></li>
                <li><a href="/amenities" className="hover:text-white transition-colors">Amenities</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-neutral-400">
                <li>📞 +91 12345 67890</li>
                <li>✉️ info@omkarhotel.com</li>
                <li className="pt-2">
                  <div className="flex gap-4">
                    <a href="#" className="hover:text-white transition-colors">Facebook</a>
                    <a href="#" className="hover:text-white transition-colors">Instagram</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400 text-sm">
            <p>&copy; 2025 Omkar Hotel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
