import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { SEOHead, generateBreadcrumbSchema, generateFAQSchema } from '../components/seo/SEOHead';
import Testimonials from '../components/sections/Testimonials';
import FinalCTA from '../components/sections/FinalCTA';
import { industryPagesData } from '../data/industryPages';
import { useData } from '../lib/dataContext';

export default function IndustryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { projects } = useData();

  if (!slug || !industryPagesData[slug]) {
    return <Navigate to="/" replace />;
  }

  const data = industryPagesData[slug];
  
  // Try to find relevant portfolio items based on industry
  const relevantProjects = projects.filter((p: any) => {
    const pInd = p.industry.toLowerCase();
    if (slug === 'hotels-riads' && (pInd.includes('hotel') || pInd.includes('riad'))) return true;
    if (slug === 'restaurants' && pInd.includes('restaurant')) return true;
    if (slug === 'real-estate' && pInd.includes('real estate')) return true;
    return false;
  }).slice(0, 3);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SEOHead
        title={data.seoTitle}
        description={data.seoDescription}
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: data.title, url: `/industries/${slug}` },
          ]),
          generateFAQSchema(data.faqs),
        ]}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--background)] z-10" />
          <img 
            src={data.heroImage}
            alt={data.title}
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent mb-6"
            >
              <span className="text-sm font-medium">Industry Specific Solutions</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            >
              {data.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-secondary mb-8 leading-relaxed"
            >
              {data.heroSubtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                Get a Free Strategy Session
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Overview & Pain Points */}
      <section className="py-20 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Your Current Setup is Costing You Money</h2>
              <p className="text-secondary text-lg mb-8">
                {data.serviceOverview}
              </p>
              <div className="space-y-6">
                {data.painPoints.map((point, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                      <span className="font-bold">0{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{point.title}</h3>
                      <p className="text-secondary">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[var(--background)] p-8 rounded-2xl border border-[var(--border)]">
              <h3 className="text-2xl font-bold mb-8">Our Proven Solutions</h3>
              <div className="space-y-6">
                {data.solutions.map((solution, index) => (
                  <div key={index} className="flex gap-4">
                    <CheckCircle2 className="shrink-0 text-accent mt-1" size={24} />
                    <div>
                      <h4 className="font-bold text-lg mb-2">{solution.title}</h4>
                      <p className="text-secondary">{solution.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-12">What You Can Expect</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.benefits.map((benefit, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                <CheckCircle2 className="text-accent mx-auto mb-4" size={32} />
                <p className="font-medium text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Examples (if any) */}
      {relevantProjects.length > 0 && (
        <section className="py-20 bg-[var(--surface)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Success Stories in Your Industry</h2>
                <p className="text-secondary text-lg max-w-2xl">
                  See how we've helped similar businesses achieve their digital goals.
                </p>
              </div>
              <Link to="/portfolio" className="hidden md:flex items-center gap-2 text-accent hover:underline font-medium">
                View All Work <ArrowRight size={20} />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {relevantProjects.map((project, i) => (
                <Link key={i} to={`/portfolio/${project.id}`} className="group block">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{project.title}</h3>
                  <p className="text-secondary">{project.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-secondary text-lg">
              Everything you need to know about our services for your industry.
            </p>
          </div>
          <div className="space-y-4">
            {data.faqs.map((faq, i) => (
              <div 
                key={i} 
                className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--surface)]"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center font-bold text-lg"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.question}
                  <ChevronDown 
                    className={`transform transition-transform ${openFaq === i ? 'rotate-180' : ''}`} 
                    size={20} 
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-secondary">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <FinalCTA />
    </motion.main>
  );
}
