import { motion } from 'framer-motion';
import { Code, Layers, TrendingUp, Wrench, Palette, Camera, Users, Megaphone, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../../lib/dataContext';

const iconMap: Record<string, React.ElementType> = {
  code: Code,
  layers: Layers,
  'trending-up': TrendingUp,
  wrench: Wrench,
  palette: Palette,
  camera: Camera,
  users: Users,
  megaphone: Megaphone,
  key: Key,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default function ServicesGrid() {
  const { services } = useData();
  const activeServices = services.filter(s => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  return (
    <section className="py-24 lg:py-32 relative" id="services">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Services</h2>
          <p className="section-subtitle mx-auto">
            Comprehensive digital solutions to help your business grow.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {activeServices.map((service) => {
              const Icon = iconMap[service.icon] || Code;
              return (
                <motion.div key={service.id} variants={itemVariants}>
                <Link to={`/services#${service.id}`}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="card p-8 h-full group"
                  >
                    {/* Icon */}
                    <div
                      className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Icon className="w-6 h-6 text-secondary group-hover:text-primary transition-colors" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-secondary text-sm leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Features preview */}
                    <div className="flex flex-wrap gap-2">
                      {service.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            color: 'var(--text-muted)',
                            backgroundColor: 'var(--muted)',
                          }}
                        >
                          {feature}
                        </span>
                      ))}
                      {service.features.length > 3 && (
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            color: 'var(--text-muted)',
                            backgroundColor: 'var(--muted)',
                          }}
                        >
                          +{service.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link to="/services" className="btn-secondary">
            View All Services
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
