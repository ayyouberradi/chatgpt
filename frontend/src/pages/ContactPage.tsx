import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, MapPin, ChevronDown } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import MultiStepForm from '../components/ui/MultiStepForm';
import AvailabilityStatus from '../components/ui/AvailabilityStatus';
import { SEOHead, generateFAQSchema, contactPageSchema } from '../components/seo/SEOHead';
import { trackWhatsAppClick } from '../lib/analytics';

const faqs = [
  { question: 'How quickly will you respond to my inquiry?', answer: 'I typically respond within 24 hours on business days. For urgent requests, message me on WhatsApp for faster response.' },
  { question: 'What happens after I submit the form?', answer: 'I\'ll review your request and reach out for a free consultation call to discuss your project in detail.' },
  { question: 'Is the consultation really free?', answer: 'Yes! The initial consultation is completely free with no obligation. We\'ll discuss your needs and I\'ll provide recommendations.' },
  { question: 'Do you work with clients internationally?', answer: 'Absolutely. I work with clients worldwide. All communication can be done via email, video calls, and messaging.' },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { theme } = useTheme();

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="pt-20">
      <SEOHead
        title="Contact"
        description="Get in touch with Ayoub Erradi for digital solutions, Airbnb management, SEO, website development, and growth-focused website support. Free consultation available."
        schemas={[contactPageSchema, generateFAQSchema(faqs)]}
      />

      {/* Hero Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <span className="text-sm text-muted uppercase tracking-wider mb-4 block">Contact</span>
            <h1 className="heading-lg mb-6">Let's Work Together</h1>
            <p className="text-xl text-secondary leading-relaxed mb-8">Ready to transform your digital presence? Fill out the form and I'll get back to you within 24 hours.</p>
            <div className="flex justify-center">
              <AvailabilityStatus />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Multi-Step Form Section */}
      <section className="pb-24 lg:pb-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <MultiStepForm />
        </div>
      </section>

      {/* Direct Contact Section */}
      <section className="pb-24 lg:pb-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">Prefer Direct Contact?</h2>
            <p className="text-secondary">Reach out through any of these channels</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.a
              href="mailto:contact@ayouberradi.com"
              whileHover={{ y: -5 }}
              className="card p-8 text-center group"
            >
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                <Mail className="w-8 h-8 text-secondary group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-sm text-secondary">contact@ayouberradi.com</p>
            </motion.a>

            <motion.a
              href="https://wa.me/212708295518"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('contact_page')}
              whileHover={{ y: -5 }}
              className="card p-8 text-center group"
            >
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#25D36620', border: '1px solid #25D36630' }}>
                <MessageCircle className="w-8 h-8" style={{ color: '#25D366' }} />
              </div>
              <h3 className="font-semibold mb-2">WhatsApp</h3>
              <p className="text-sm text-secondary">+212 708 295518</p>
            </motion.a>

            <motion.div
              whileHover={{ y: -5 }}
              className="card p-8 text-center group"
            >
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                <MapPin className="w-8 h-8 text-secondary group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-sm text-secondary">Morocco</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 lg:py-32" style={{ background: theme === 'light' ? 'linear-gradient(to bottom, var(--background), var(--muted), var(--background))' : 'linear-gradient(to bottom, var(--background), var(--surface-elevated), var(--background))' }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">FAQ</h2>
            <p className="section-subtitle mx-auto mt-4">Common questions about working with me.</p>
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
    </motion.main>
  );
}
