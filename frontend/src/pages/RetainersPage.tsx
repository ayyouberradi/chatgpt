import { motion } from 'framer-motion';
import { ArrowRight, HelpCircle, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { SEOHead, generateFAQSchema, generateBreadcrumbSchema } from '../components/seo/SEOHead';
import { useData } from '../lib/dataContext';
import RetainersShowcase from '../components/sections/RetainersShowcase';



const faqs = [
  { question: 'What counts as a "minor change"?', answer: 'Minor changes include text updates, image replacements, small layout adjustments, and similar tasks that take less than 30 minutes.' },
  { question: 'Can I upgrade or downgrade my plan?', answer: 'Yes, you can change your plan at any time. Changes take effect at the start of the next billing cycle.' },
  { question: 'What\'s the billing cycle?', answer: 'Plans are billed monthly, on the same day each month starting from your signup date.' },
  { question: 'How quickly do you respond to requests?', answer: 'Response times depend on your plan. Website Care: 24-48 hrs, Growth: same-day, Digital Partner: within 4 hours.' },
  { question: 'What platforms do you support?', answer: 'All plans support WordPress and WooCommerce websites. For Digital Partner, I can also support other platforms.' },
];

export default function RetainersPage() {
  const { theme } = useTheme();
  const { comboPackages } = useData();
  const activeComboPackages = comboPackages.filter(p => p.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="pt-20">
      <SEOHead
        title="Retainers"
        description="Monthly growth plans for ongoing website support, maintenance, and optimization. Starting from 400 MAD/month with transparent pricing."
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Retainers', url: '/retainers' },
          ]),
          generateFAQSchema(faqs),
        ]}
      />

      {/* Hero Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <span className="text-sm text-muted uppercase tracking-wider mb-4 block">Retainers</span>
            <h1 className="heading-lg mb-6">Ongoing Growth & Support</h1>
            <p className="text-xl text-secondary leading-relaxed">Monthly plans designed to keep your website secure, optimized, and growing with your business.</p>
          </motion.div>
        </div>
      </section>

      {/* Monthly Growth Plans */}
      <RetainersShowcase />

      {/* Combo Packages Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">Combo Packages</h2>
            <p className="section-subtitle mx-auto mt-4">Bundle services and save with comprehensive digital packages.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {activeComboPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`relative rounded-3xl p-8 transition-all duration-300 ${pkg.isPopular ? 'scale-105 z-10' : ''}`}
                style={{
                  backgroundColor: pkg.isPopular ? 'var(--card)' : 'var(--card)',
                  border: pkg.isPopular ? '2px solid var(--accent)' : '1px solid var(--border)'
                }}
              >
                {pkg.isPopular && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 text-xs font-semibold rounded-full"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                  >
                    Most Popular
                  </motion.div>
                )}
                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-sm text-secondary mb-6">{pkg.description}</p>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                      <span className="text-sm text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-full font-medium transition-colors duration-300"
                    style={{
                      backgroundColor: pkg.isPopular ? 'var(--accent)' : 'var(--muted)',
                      color: pkg.isPopular ? 'var(--accent-foreground)' : 'var(--foreground)'
                    }}
                  >
                    {pkg.cta}
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 lg:py-32" style={{ background: theme === 'light' ? 'linear-gradient(to bottom, var(--background), var(--muted), var(--background))' : 'linear-gradient(to bottom, var(--background), var(--surface-elevated), var(--background))' }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle mx-auto mt-4">Common questions about monthly plans.</p>
          </motion.div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--muted)' }}>
                    <HelpCircle className="w-4 h-4 text-muted" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">{faq.question}</h3>
                    <p className="text-secondary text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="heading-md mb-6">Ready to Get Started?</h2>
            <p className="text-secondary mb-8 max-w-2xl mx-auto">Let's discuss which plan is right for your business.</p>
            <Link to="/contact">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary group">
                Schedule a Call
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.main>
  );
}
