import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { SEOHead, generateBreadcrumbSchema, generateCaseStudySchema } from '../components/seo/SEOHead';
import { useData } from '../lib/dataContext';

const categories = ['All', 'Hotels & Riads', 'Restaurants & Cafés', 'Real Estate', 'Websites', 'Photography', 'Video Production'];

const projectCategories: Record<string, string> = {
  'la-ferme-medina': 'Restaurants & Cafés',
  'riad-inn-medina': 'Hotels & Riads',
  'neryo-hotels': 'Hotels & Riads',
  'eden-hills': 'Hotels & Riads',
  'assafa-bayt-immobilier': 'Real Estate',
  'groupe-nour': 'Websites',
  'longue-vie-hotel': 'Hotels & Riads',
  'apostrophe-dar-nachr': 'Hotels & Riads',
};

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const { theme } = useTheme();
  const { projects } = useData();

  const activeProjects = projects.filter(p => p.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  const filteredProjects = activeProjects.filter((project) => {
    if (activeCategory === 'All') return true;
    return (projectCategories[project.id] || 'Websites') === activeCategory;
  });

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="pt-20">
      <SEOHead
        title="Portfolio"
        description="Explore featured projects including websites, Airbnb-ready guest experiences, landing pages, and digital solutions for hotels, riads, restaurants, and businesses."
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Portfolio', url: '/portfolio' },
          ]),
          ...filteredProjects.map((p) => generateCaseStudySchema({
            id: p.id,
            title: p.title,
            description: p.description,
          })),
        ]}
      />
      {/* Hero Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <span className="text-sm text-muted uppercase tracking-wider mb-4 block">Portfolio</span>
            <h1 className="heading-lg mb-6">Featured Projects</h1>
            <p className="text-xl text-secondary leading-relaxed">This portfolio includes hospitality, restaurant, and real estate projects with measurable outcomes such as direct booking growth, stronger organic visibility, and higher lead volume.</p>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <motion.button key={category} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory(category)} className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === category ? 'text-white' : 'text-secondary hover:text-primary'}`} style={{ backgroundColor: activeCategory === category ? 'var(--accent)' : 'var(--muted)', border: activeCategory === category ? 'none' : '1px solid var(--border)' }}>
                {category}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div key={project.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.05, duration: 0.4 }}>
                  <Link to={`/portfolio/${project.id}`}>
                    <motion.div whileHover={{ y: -8 }} className="group overflow-hidden rounded-2xl transition-all duration-500" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <motion.img src={project.image} alt={project.title} className="w-full h-full object-cover" whileHover={{ scale: 1.08 }} transition={{ duration: 0.6 }} />
                        <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent 55%)' }} />
                        <span className="absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]" style={{ backgroundColor: 'rgba(255,255,255,0.88)', color: '#111827', backdropFilter: 'blur(8px)' }}>
                          {projectCategories[project.id] || 'Websites'}
                        </span>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileHover={{ opacity: 1, scale: 1 }} className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ backgroundColor: 'rgba(255,255,255,0.88)', color: '#111827', backdropFilter: 'blur(8px)' }}>
                          <Eye className="w-5 h-5" />
                        </motion.div>
                      </div>
                      <div className="p-6 lg:p-7">
                        <h3 className="text-xl lg:text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">{project.title}</h3>
                        <p className="text-secondary text-sm leading-relaxed mb-5 line-clamp-2">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {(project.services?.length ? project.services : project.tags).slice(0, 2).map((item) => (
                            <span key={item} className="text-xs px-3 py-1.5 rounded-full" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--muted)' }}>
                              {item}
                            </span>
                          ))}
                          {((project.services?.length ? project.services : project.tags).length > 2) && (
                            <span className="text-xs px-3 py-1.5 rounded-full" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--muted)' }}>
                              +{(project.services?.length ? project.services : project.tags).length - 2} more
                            </span>
                          )}
                        </div>
                        <motion.div initial={{ opacity: 0, y: 10 }} className="flex items-center gap-2 text-sm mt-5">
                          <span className="font-medium">View Project</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32" style={{ background: theme === 'light' ? 'linear-gradient(to bottom, var(--background), var(--muted), var(--background))' : 'linear-gradient(to bottom, var(--background), var(--surface-elevated), var(--background))' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="heading-md mb-6">Want Similar Results for Your Business?</h2>
            <p className="text-secondary mb-8 max-w-2xl mx-auto">Let's discuss how we can create a powerful online presence for your brand.</p>
            <Link to="/contact"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary group">Start Your Project<ArrowUpRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></motion.button></Link>
          </motion.div>
        </div>
      </section>
    </motion.main>
  );
}
