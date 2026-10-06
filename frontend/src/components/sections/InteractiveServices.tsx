import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Layers, TrendingUp, Wrench, Palette, Camera, ArrowRight, Check, Users, Megaphone, Key } from 'lucide-react';
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

const serviceImages = [
  'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2091510/pexels-photo-2091510.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export default function InteractiveServices() {
  const { services } = useData();
  const activeServices = services.filter(s => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const service = activeServices[activeServiceIndex];
  const Icon = iconMap[service?.icon || 'code'] || Code;

  return (
    <section className="py-24 lg:py-32" id="interactive-services">
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
            Comprehensive digital solutions tailored to your needs.
          </p>
        </motion.div>

        {/* Interactive Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Services List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            {activeServices.map((svc, index) => {
              const SvcIcon = iconMap[svc.icon] || Code;
              const isActive = activeServiceIndex === index;

              return (
                <motion.button
                  key={svc.id}
                  whileHover={{ x: 8 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setActiveServiceIndex(index)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-500 ${
                    isActive ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? 'var(--accent-foreground)' : 'var(--foreground)',
                    border: isActive ? 'none' : '1px solid var(--border)',
                    ...(isActive && { ['--tw-ring-color' as string]: 'var(--accent)' }),
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                      style={{
                        backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--muted)',
                        border: isActive ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      <SvcIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{svc.title}</h3>
                      <p
                        className="text-sm mt-1 line-clamp-1"
                        style={{ opacity: 0.7 }}
                      >
                        {svc.description}
                      </p>
                    </div>
                    <motion.div
                      animate={{ x: isActive ? 0 : -8, opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div
              className="sticky top-32 rounded-3xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              {/* Image */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeServiceIndex}
                    src={serviceImages[activeServiceIndex % serviceImages.length]}
                    alt={service.title}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, var(--background), transparent 50%)',
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeServiceIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm text-muted uppercase tracking-wider">
                        Service {(activeServiceIndex + 1).toString().padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                    <p className="text-secondary mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-3 mb-8">
                      {service.features.slice(0, 4).map((feature, idx) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                          >
                            <Check className="w-4 h-4" />
                          </div>
                          <span className="text-sm text-secondary">{feature}</span>
                        </motion.div>
                      ))}
                      {service.features.length > 4 && (
                        <p className="text-sm text-muted ml-9">
                          +{service.features.length - 4} more features
                        </p>
                      )}
                    </div>

                    <Link to={`/services#${service.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary group"
                      >
                        Learn More
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
