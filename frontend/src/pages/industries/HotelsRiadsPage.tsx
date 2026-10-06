import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SEOHead, defaultSchemas } from '../../components/seo/SEOHead';
import { useData } from '../../lib/dataContext';
import { ArrowRight, CheckCircle2, Star } from 'lucide-react';
import Testimonials from '../../components/sections/Testimonials';
import FinalCTA from '../../components/sections/FinalCTA';

export default function HotelsRiadsPage() {
  const { projects } = useData();
  const hotelProjects = projects.filter(p => p.industry === 'Hotel' || p.industry === 'Riad');

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SEOHead
        title="Web Design & SEO for Hotels and Riads in Marrakech"
        description="Boost your direct bookings with a custom WordPress website, professional photography, and local SEO designed specifically for hotels and riads in Marrakech, Morocco."
        schemas={defaultSchemas}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--background)] z-10" />
          <img 
            src="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=2000" 
            alt="Luxury Riad in Marrakech" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Stop Relying on OTAs. <br/>
              <span className="text-[var(--accent)]">Increase Direct Bookings</span> for Your Riad.
            </h1>
            <p className="text-xl text-[var(--foreground-muted)] mb-10">
              Expert WordPress web design, local SEO, and professional photography for hotels and riads in Marrakech. Turn your website into your best booking channel.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-full font-medium hover:scale-105 transition-transform flex items-center gap-2"
              >
                Get a Free Consultation <ArrowRight size={20} />
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
              <CheckCircle2 className="w-10 h-10 text-[var(--accent)] mb-4" />
              <h3 className="text-xl font-bold mb-3">Direct Booking Engines</h3>
              <p className="text-[var(--foreground-muted)]">Seamless integration with your property management system to eliminate OTA commissions.</p>
            </div>
            <div className="p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
              <Star className="w-10 h-10 text-[var(--accent)] mb-4" />
              <h3 className="text-xl font-bold mb-3">Local SEO for Marrakech</h3>
              <p className="text-[var(--foreground-muted)]">Rank higher on Google when tourists search for "best riad in Marrakech" or "luxury hotel medina".</p>
            </div>
            <div className="p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
              <CheckCircle2 className="w-10 h-10 text-[var(--accent)] mb-4" />
              <h3 className="text-xl font-bold mb-3">Stunning Visuals</h3>
              <p className="text-[var(--foreground-muted)]">Professional photography and virtual tours that capture the unique atmosphere of your property.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12">Success Stories in Hospitality</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {hotelProjects.slice(0, 4).map(project => (
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

      <Testimonials />
      <FinalCTA />
    </motion.main>
  );
}