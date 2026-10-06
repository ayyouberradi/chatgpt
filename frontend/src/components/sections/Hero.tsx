import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, MessageCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import AvailabilityStatus from '../ui/AvailabilityStatus';
import { useData } from '../../lib/dataContext';
import { trackWhatsAppClick, trackCTAClick } from '../../lib/analytics';

export default function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const { projects } = useData();
  const excludedHomepagePreviewProjects = ['la-ferme-medina', 'riad-inn-medina', 'neryo-hotels'];
  const activeProjects = projects.filter((p: any) => p.isActive).sort((a: any, b: any) => a.displayOrder - b.displayOrder);
  const homepagePreviewProjects = activeProjects
    .filter((project: any) => !excludedHomepagePreviewProjects.includes(project.id))
    .slice(0, 3);

  const springConfig = { damping: 50, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [2, -2]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-2, 2]), springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--muted)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--muted)' }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Radial glow behind content */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--muted) 0%, transparent 70%)',
            opacity: 0.3,
          }}
        />
      </div>

      {/* Grid lines - reduced opacity */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(to right, var(--foreground) 1px, transparent 1px),
            linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }} />
      </div>

      <div
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32 text-center"
        style={{ perspective: 1000 }}
      >
        <motion.div
          style={{ rotateX, rotateY }}
          className="will-change-transform"
        >
          {/* Label above headline */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-block text-sm text-muted uppercase tracking-[0.3em] mb-6 font-medium"
          >
            Digital Solutions Expert
          </motion.span>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <h1 className="heading-xl mb-6">
              <span className="block">
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.15, duration: 0.8 }}
                >
                  Build.
                </motion.span>
              </span>
              <span className="block">
                <motion.span
                  className="inline-block text-secondary"
                  initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.25, duration: 0.8 }}
                >
                  Fix.
                </motion.span>
              </span>
              <span className="block">
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.35, duration: 0.8 }}
                >
                  Grow.
                </motion.span>
              </span>
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8 }}
            className="text-lg md:text-xl lg:text-xl max-w-3xl mx-auto mb-8 text-balance text-secondary leading-relaxed font-medium"
          >
            Digital Growth Partner for Hotels, Riads, Restaurants & Real Estate Businesses
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10 max-w-4xl mx-auto"
          >
            {[
              { label: '50+', sub: 'Projects Delivered' },
              { label: '5+', sub: 'Years Experience' },
              { label: '24h', sub: 'Response Time' },
              { label: 'Global', sub: 'Clients Across Morocco & Int.' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-primary">{stat.label}</span>
                <span className="text-sm text-secondary">{stat.sub}</span>
              </div>
            ))}
          </motion.div>

          {/* Availability Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            className="flex justify-center mb-12"
          >
            <AvailabilityStatus compact />
          </motion.div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link to="/contact" onClick={() => trackCTAClick('hero_consultation')}>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary text-base px-8 py-4 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Get a Free Consultation
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </Link>
          <Link to="/portfolio" onClick={() => trackCTAClick('hero_portfolio')}>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary text-base px-8 py-4 group"
            >
              View Portfolio
              <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </motion.button>
          </Link>
          <motion.a
            href="https://wa.me/212708295518"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('hero_button')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary text-base px-8 py-4 group flex items-center"
          >
            <MessageCircle className="mr-2 w-5 h-5" />
            Chat on WhatsApp
          </motion.a>
        </motion.div>

        {/* Featured Projects Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          {homepagePreviewProjects.map((project: any, index: number) => (
            <Link key={project.id} to={`/portfolio/${project.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative rounded-xl overflow-hidden"
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    fetchPriority="high"
                    loading="eager"
                    decoding="sync"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs text-gray-400 mb-1">{project.tags[0]}</p>
                  <p className="text-sm font-medium text-white">{project.title}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full flex items-start justify-center p-2"
          style={{ border: '2px solid var(--border)' }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--foreground)' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
