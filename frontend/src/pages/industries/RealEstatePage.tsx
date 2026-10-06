import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SEOHead, defaultSchemas } from '../../components/seo/SEOHead';
import { useData } from '../../lib/dataContext';
import { ArrowRight, CheckCircle2, Home } from 'lucide-react';
import Testimonials from '../../components/sections/Testimonials';
import FinalCTA from '../../components/sections/FinalCTA';

export default function RealEstatePage() {
  const { projects } = useData();
  const realEstateProjects = projects.filter(p => p.industry === 'Real Estate');

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SEOHead
        title="Web Design & SEO for Real Estate Agencies in Morocco"
        description="High-converting property listing websites, CRM integrations, and SEO strategies for real estate agencies and developers in Marrakech and across Morocco."
        schemas={defaultSchemas}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--background)] z-10" />
          <img 
            src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=2000" 
            alt="Modern real estate property" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Sell More Properties with a <br/>
              <span className="text-[var(--accent)]">High-Converting Platform.</span>
            </h1>
            <p className="text-xl text-[var(--foreground-muted)] mb-10">
              Advanced property listing websites, lead generation systems, and SEO for real estate agencies in Marrakech looking to attract serious buyers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-full font-medium hover:scale-105 transition-transform flex items-center gap-2"
              >
                Discuss Your Project <ArrowRight size={20} />
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
              <Home className="w-10 h-10 text-[var(--accent)] mb-4" />
              <h3 className="text-xl font-bold mb-3">Advanced Property Search</h3>
              <p className="text-[var(--foreground-muted)]">Custom filtering, map integrations, and beautiful property detail pages that keep buyers engaged.</p>
            </div>
            <div className="p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
              <CheckCircle2 className="w-10 h-10 text-[var(--accent)] mb-4" />
              <h3 className="text-xl font-bold mb-3">CRM Integrations</h3>
              <p className="text-[var(--foreground-muted)]">Automatically capture leads and sync them directly to your preferred real estate CRM software.</p>
            </div>
            <div className="p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
              <CheckCircle2 className="w-10 h-10 text-[var(--accent)] mb-4" />
              <h3 className="text-xl font-bold mb-3">International SEO</h3>
              <p className="text-[var(--foreground-muted)]">Target foreign investors searching for properties in Marrakech with a multilingual, SEO-optimized platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      {realEstateProjects.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12">Real Estate Platforms Built</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {realEstateProjects.slice(0, 4).map(project => (
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