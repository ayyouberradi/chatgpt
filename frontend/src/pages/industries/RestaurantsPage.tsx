import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SEOHead, defaultSchemas } from '../../components/seo/SEOHead';
import { useData } from '../../lib/dataContext';
import { ArrowRight, CheckCircle2, Utensils } from 'lucide-react';
import Testimonials from '../../components/sections/Testimonials';
import FinalCTA from '../../components/sections/FinalCTA';

export default function RestaurantsPage() {
  const { projects } = useData();
  const restaurantProjects = projects.filter(p => p.industry === 'Restaurant');

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SEOHead
        title="Web Design & Local SEO for Restaurants in Marrakech"
        description="Attract more diners with a beautiful restaurant website, online reservations, and local SEO designed for restaurants and cafes in Marrakech."
        schemas={defaultSchemas}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--background)] z-10" />
          <img 
            src="https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=2000" 
            alt="Fine dining restaurant" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Turn Website Visitors into <br/>
              <span className="text-[var(--accent)]">Diners at Your Table.</span>
            </h1>
            <p className="text-xl text-[var(--foreground-muted)] mb-10">
              Custom web design, digital menus, table reservation systems, and local SEO to ensure your Marrakech restaurant is fully booked every night.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-full font-medium hover:scale-105 transition-transform flex items-center gap-2"
              >
                Get a Free Proposal <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
              <Utensils className="w-10 h-10 text-[var(--accent)] mb-4" />
              <h3 className="text-xl font-bold mb-3">Digital Menus & Ordering</h3>
              <p className="text-[var(--foreground-muted)]">Beautifully designed digital menus that load instantly and drive appetite, with optional online ordering.</p>
            </div>
            <div className="p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
              <CheckCircle2 className="w-10 h-10 text-[var(--accent)] mb-4" />
              <h3 className="text-xl font-bold mb-3">Table Reservations</h3>
              <p className="text-[var(--foreground-muted)]">Integrate powerful reservation systems directly into your website to secure bookings 24/7.</p>
            </div>
            <div className="p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
              <CheckCircle2 className="w-10 h-10 text-[var(--accent)] mb-4" />
              <h3 className="text-xl font-bold mb-3">Google Local Optimization</h3>
              <p className="text-[var(--foreground-muted)]">Dominate "restaurants near me" searches in Marrakech and capture tourists looking for authentic dining.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      {restaurantProjects.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12">Our Restaurant Clients</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {restaurantProjects.slice(0, 4).map(project => (
                <div key={project.id} className="group relative overflow-hidden rounded-2xl aspect-video bg-[var(--surface-elevated)]">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                    <p className="text-white/80">{project.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Testimonials />
      <FinalCTA />
    </motion.main>
  );
}