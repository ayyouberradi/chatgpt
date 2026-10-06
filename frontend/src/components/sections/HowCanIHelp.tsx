import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Wrench, TrendingUp, Camera } from 'lucide-react';
import { useData } from '../../lib/dataContext';

const iconMap: Record<string, React.ElementType> = {
  globe: Globe,
  wrench: Wrench,
  'trending-up': TrendingUp,
  camera: Camera,
};

export default function HowCanIHelp() {
  const { helpOptions } = useData();
  
  const activeHelpOptions = helpOptions.filter(h => h.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  
  const helpOptionsWithIcons = activeHelpOptions.map((option) => ({
    ...option,
    icon: iconMap[option.icon] || Globe,
  }));
  
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">How Can I Help?</h2>
          <p className="section-subtitle mx-auto mt-4">
            Choose the service you need and let's get started.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpOptionsWithIcons.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link to={option.link}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="card p-8 h-full group relative overflow-hidden"
                  >
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Icon className="w-7 h-7 text-secondary group-hover:text-primary transition-colors" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {option.title}
                    </h3>

                    {/* Description */}
                    <p className="text-secondary text-sm leading-relaxed mb-6">
                      {option.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:text-accent transition-colors">
                      <span>{option.cta}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
