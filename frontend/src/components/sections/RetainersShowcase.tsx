import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../../lib/dataContext';

export default function RetainersShowcase() {
  const { retainers } = useData();
  const activeRetainers = retainers.filter(r => r.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section className="py-24 lg:py-32 relative" id="retainers">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Monthly Growth Plans</h2>
          <p className="section-subtitle mx-auto mt-4">
            Ongoing support and growth for your digital presence.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {activeRetainers.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.isHighlighted ? 'scale-105 z-10' : ''
              }`}
              style={{
                backgroundColor: plan.isHighlighted
                  ? 'var(--accent)'
                  : 'var(--card)',
                color: plan.isHighlighted
                  ? 'var(--accent-foreground)'
                  : 'var(--foreground)',
                border: plan.isHighlighted
                  ? '2px solid var(--accent)'
                  : '1px solid var(--border)',
              }}
            >
              {/* Popular badge */}
              {plan.isHighlighted && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold rounded-full"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-foreground)',
                  }}
                >
                  Best Value
                </motion.div>
              )}

              {/* Plan name */}
              <h3 className="text-xl font-semibold mb-2">
                {plan.name}
              </h3>

              {/* Description */}
              <p className="text-sm mb-6" style={{ opacity: plan.isHighlighted ? 0.7 : 0.7 }}>
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ opacity: plan.isHighlighted ? 1 : 0.6 }}
                    />
                    <span className="text-sm" style={{ opacity: plan.isHighlighted ? 0.8 : 0.7 }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-full font-medium transition-colors duration-300"
                  style={{
                    backgroundColor: plan.isHighlighted
                      ? 'var(--accent-foreground)'
                      : 'var(--muted)',
                    color: plan.isHighlighted
                      ? 'var(--accent)'
                      : 'var(--foreground)',
                  }}
                >
                  {plan.cta}
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link to="/retainers" className="btn-secondary">
            Compare Plans
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
