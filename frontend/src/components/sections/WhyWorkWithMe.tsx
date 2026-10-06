import { motion } from 'framer-motion';
import { Code, Wrench, TrendingUp, Camera } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useData } from '../../lib/dataContext';

const iconMap: Record<string, React.ElementType> = {
  code: Code,
  wrench: Wrench,
  'trending-up': TrendingUp,
  camera: Camera,
};

export default function WhyWorkWithMe() {
  const { theme } = useTheme();
  const { benefits } = useData();
  const activeBenefits = benefits.filter(b => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section
      className="py-24 lg:py-32"
      style={{
        background: theme === 'light'
          ? 'linear-gradient(to bottom, var(--background), var(--muted), var(--background))'
          : 'linear-gradient(to bottom, var(--background), var(--surface-elevated), var(--background))'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm text-muted uppercase tracking-wider mb-4"
          >
            Why Choose Me
          </motion.span>
          <h2 className="section-title">
            More Than a Developer
          </h2>
          <p className="section-subtitle mx-auto mt-4">
            A complete digital partner for your business growth.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {activeBenefits.map((benefit, index) => {
              const Icon = iconMap[benefit.icon] || Code;
              return (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="group text-center"
                >
                <motion.div
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Icon className="w-7 h-7 text-secondary group-hover:text-primary transition-colors" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-3">
                  {benefit.title}
                </h3>
                <p className="text-secondary text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
