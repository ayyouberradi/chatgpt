import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Mail } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { trackWhatsAppClick } from '../../lib/analytics';

export default function FinalCTA() {
  const { theme } = useTheme();

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: theme === 'light'
              ? 'linear-gradient(to bottom, var(--background), var(--muted), var(--background))'
              : 'linear-gradient(to bottom, var(--background), var(--surface-elevated), var(--background))'
          }}
        />
        {/* Animated gradient orb */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--muted)' }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="heading-lg mb-6"
        >
          Let's Build Something Great Together
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-lg text-secondary mb-12 max-w-2xl mx-auto"
        >
          Ready to transform your digital presence? Let's discuss your project and create something exceptional.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="/book?channel=whatsapp&source=final_cta"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('final_cta')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary text-base px-8 py-4 group"
          >
            <MessageCircle className="mr-2 w-5 h-5" />
            WhatsApp
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.a>

          <motion.a
            href="mailto:contact@ayouberradi.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary text-base px-8 py-4"
          >
            <Mail className="mr-2 w-5 h-5" />
            Email
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
