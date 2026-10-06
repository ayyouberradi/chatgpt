import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { SEOHead, generateBreadcrumbSchema, generateCaseStudySchema } from '../components/seo/SEOHead';
import { useData } from '../lib/dataContext';

export default function CaseStudiesPage() {
  const { caseStudies } = useData();
  const activeCaseStudies = caseStudies.filter(cs => cs.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  const [activeCase, setActiveCase] = useState(activeCaseStudies[0]);
  const { theme } = useTheme();

  useEffect(() => {
    if (activeCaseStudies.length > 0 && !activeCase) {
      setActiveCase(activeCaseStudies[0]);
    }
  }, [activeCaseStudies, activeCase]);

  if (!activeCase) return null;

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="pt-20">
      <SEOHead
        title="Case Studies"
        description="Explore detailed case studies of successful website projects for hotels, riads, restaurants, and real estate businesses across Morocco."
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Case Studies', url: '/case-studies' },
          ]),
          ...caseStudies.map((cs) => generateCaseStudySchema({
            id: cs.id,
            title: cs.title,
            description: cs.challenge,
            industry: cs.industry,
          })),
        ]}
      />

      {/* Hero Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <span className="text-sm text-muted uppercase tracking-wider mb-4 block">Case Studies</span>
            <h1 className="heading-lg mb-6">Real Results, Real Businesses</h1>
            <p className="text-xl text-secondary leading-relaxed">Explore detailed case studies showcasing how I\'ve helped businesses transform their digital presence and achieve measurable growth.</p>
          </motion.div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-3">
            {caseStudies.map((cs) => (
              <motion.button
                key={cs.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCase(cs)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeCase.id === cs.id ? 'text-white' : 'text-secondary hover:text-primary'}`}
                style={{ backgroundColor: activeCase.id === cs.id ? 'var(--accent)' : 'var(--muted)', border: activeCase.id === cs.id ? 'none' : '1px solid var(--border)' }}
              >
                {cs.title}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Active Case Study */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--text-muted)' }}>{activeCase.industry}</span>
                    {activeCase.year && <span className="text-sm text-muted">{activeCase.year}</span>}
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-6">{activeCase.title}</h2>
                  {activeCase.location && <p className="text-secondary mb-6">{activeCase.location}</p>}
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <img src={activeCase.gallery?.[0] || activeCase.heroImage} alt={activeCase.title} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Challenge */}
              <div className="mb-16">
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--accent)' }}>The Challenge</h3>
                <p className="text-secondary leading-relaxed">{activeCase.challenge}</p>
              </div>

              {/* Strategy / Solution */}
              {(activeCase.strategy || activeCase.solution) && (
                <div className="mb-16">
                  <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--accent)' }}>{activeCase.strategy ? 'The Strategy' : 'The Solution'}</h3>
                  <p className="text-secondary leading-relaxed">{activeCase.strategy || activeCase.solution}</p>
                </div>
              )}

              {/* Execution / Technologies */}
              {(activeCase.execution || activeCase.technologies) && (
                <div className="mb-16">
                  <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--accent)' }}>{activeCase.execution ? 'The Execution' : 'Technologies Used'}</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeCase.execution || activeCase.technologies)?.map((item: string, index: number) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-4 rounded-xl"
                        style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}
                      >
                        <ChevronRight className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                        <span className="text-sm">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {activeCase.results && activeCase.results.length > 0 && (
                <div className="mb-16 p-8 rounded-2xl" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <h3 className="text-xl font-semibold mb-8" style={{ color: 'var(--accent)' }}>The Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {activeCase.results.map((result: any) => (
                      <div key={result.label} className="text-center">
                        <div className="text-4xl lg:text-5xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>{result.metric}</div>
                        <div className="text-sm text-muted">{result.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {activeCase.gallery && activeCase.gallery.length > 0 && (
                <div className="mb-16">
                  <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--accent)' }}>Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeCase.gallery.map((img: string, index: number) => (
                      <div key={index} className="aspect-video rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                        <img src={img} alt={`${activeCase.title} gallery ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Testimonial */}
              {activeCase.testimonial && (
                <div className="p-8 rounded-2xl" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                  <blockquote className="text-xl lg:text-2xl font-light italic mb-6 text-secondary">"{activeCase.testimonial.text || (activeCase.testimonial as any).content}"</blockquote>
                  <div>
                    <p className="font-semibold">{activeCase.testimonial.author}</p>
                    <p className="text-sm text-muted">{activeCase.testimonial.role}, {activeCase.client}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32" style={{ background: theme === 'light' ? 'linear-gradient(to bottom, var(--background), var(--muted), var(--background))' : 'linear-gradient(to bottom, var(--background), var(--surface-elevated), var(--background))' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="heading-md mb-6">Want Similar Results?</h2>
            <p className="text-secondary mb-8 max-w-2xl mx-auto">Let's discuss how I can help transform your online presence and achieve measurable growth.</p>
            <Link to="/contact">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary group">
                Start Your Project
                <ArrowUpRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.main>
  );
}
