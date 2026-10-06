import { motion } from 'framer-motion';
import { Code, TrendingUp, Wrench, Users, Megaphone, Camera, Check, ArrowRight, ChevronDown, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { SEOHead, generateFAQSchema, generateServiceSchema, generateBreadcrumbSchema } from '../components/seo/SEOHead';
import { useData } from '../lib/dataContext';

const iconMap: Record<string, React.ElementType> = {
  code: Code,
  'trending-up': TrendingUp,
  wrench: Wrench,
  users: Users,
  megaphone: Megaphone,
  camera: Camera,
  key: Key,
};

const faqs = [
  { question: 'How long does a typical website project take?', answer: 'Most WordPress websites are delivered within 2-4 weeks, depending on complexity. Landing pages can often be completed in 1 week.' },
  { question: 'Do you offer hosting and domain services?', answer: 'Yes, I can help you set up hosting and domains, though I recommend my clients own their accounts.' },
  { question: 'What happens if I need changes after the project is complete?', answer: 'All projects include a 30-day support period. For ongoing updates, my retainer plans offer monthly maintenance and optimization.' },
  { question: 'Can you work with existing websites?', answer: 'Absolutely. I can help optimize, fix, or redesign existing WordPress sites.' },
  { question: 'What\'s your process for starting a new project?', answer: 'We start with a free consultation, then I provide a detailed proposal. Once approved, we begin with wireframes and design, followed by development and launch.' },
];

export default function ServicesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { theme } = useTheme();
  const { services } = useData();
  const activeServices = services.filter(s => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="pt-20">
      <SEOHead
        title="Services"
        description="Complete digital solutions including website development, Airbnb management, SEO, website maintenance, paid ads, and content creation with transparent MAD pricing."
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Services', url: '/services' },
          ]),
          generateFAQSchema(faqs),
          ...activeServices.map(generateServiceSchema),
        ]}
      />

      {/* Hero Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <span className="text-sm text-muted uppercase tracking-wider mb-4 block">Services</span>
            <h1 className="heading-lg mb-6">Complete Digital Solutions</h1>
            <p className="text-xl text-secondary leading-relaxed">Services include website development from 3,000 MAD, maintenance from 400 MAD per month, and ongoing SEO or listing management from 2,500 MAD per month.</p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {activeServices.map((service, index) => {
              const Icon = iconMap[service.icon] || Code;
              return (
                <motion.div
                  key={service.id}
                  id={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="scroll-mt-24"
                >
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="card p-8 h-full flex flex-col"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                        <Icon className="w-7 h-7 text-secondary" />
                      </div>
                      <span className="text-sm text-muted uppercase tracking-wider">Service {(index + 1).toString().padStart(2, '0')}</span>
                    </div>

                    <h3 className="text-2xl font-bold mb-3">{service.title}</h3>

                    <p className="text-secondary text-sm leading-relaxed mb-6">{service.description}</p>

                    <div className="flex-1">
                      <ul className="space-y-3 mb-8">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3 text-sm">
                            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                            <span className="text-secondary">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link to="/contact">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full btn-primary group"
                      >
                        {service.cta || 'Get Started'}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </Link>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 lg:py-32" style={{ background: theme === 'light' ? 'linear-gradient(to bottom, var(--background), var(--muted), var(--background))' : 'linear-gradient(to bottom, var(--background), var(--surface-elevated), var(--background))' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">How I Work</h2>
            <p className="section-subtitle mx-auto mt-4">A proven process for successful projects.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Discovery', desc: 'Understanding your goals, audience, and requirements.' },
              { step: '02', title: 'Strategy', desc: 'Creating a roadmap with clear objectives and timeline.' },
              { step: '03', title: 'Execution', desc: 'Building your solution with regular updates.' },
              { step: '04', title: 'Launch & Growth', desc: 'Deploying and optimizing for ongoing success.' },
            ].map((item, index) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }} className="card p-8 text-center">
                <span className="text-4xl font-bold text-muted">{item.step}</span>
                <h3 className="text-lg font-semibold mt-4 mb-2">{item.title}</h3>
                <p className="text-secondary text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle mx-auto mt-4">Common questions about working together.</p>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full text-left card p-6 flex items-start justify-between gap-4">
                  <span className="font-medium">{faq.question}</span>
                  <motion.div animate={{ rotate: openFaq === index ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-5 h-5 text-muted flex-shrink-0" /></motion.div>
                </button>
                <motion.div initial={false} animate={{ height: openFaq === index ? 'auto' : 0, opacity: openFaq === index ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <p className="text-secondary p-6 pt-0">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32" style={{ background: theme === 'light' ? 'linear-gradient(to bottom, var(--background), var(--muted), var(--background))' : 'linear-gradient(to bottom, var(--background), var(--surface-elevated), var(--background))' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="heading-md mb-6">Ready to Get Started?</h2>
            <p className="text-secondary mb-8 max-w-2xl mx-auto">Let's discuss your project and find the perfect solution.</p>
            <Link to="/contact">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary group">
                Get a Free Consultation
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.main>
  );
}
