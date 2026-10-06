import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Building, Utensils, Home, ShoppingCart, Stethoscope, Scale } from 'lucide-react';
import { trackCTAClick } from '../../lib/analytics';

const industries = [
  {
    title: 'Hotels & Riads',
    description: 'Direct booking engines and stunning visuals.',
    icon: Building,
    link: '/industries/hotels-riads'
  },
  {
    title: 'Restaurants',
    description: 'Digital menus and reservation systems.',
    icon: Utensils,
    link: '/industries/restaurants'
  },
  {
    title: 'Real Estate',
    description: 'Property portals and lead generation.',
    icon: Home,
    link: '/industries/real-estate'
  },
  {
    title: 'E-commerce',
    description: 'WooCommerce optimization and scaling.',
    icon: ShoppingCart,
    link: '/industries/ecommerce'
  },
  {
    title: 'Medical Clinics',
    description: 'Patient booking and local authority.',
    icon: Stethoscope,
    link: '/industries/medical'
  },
  {
    title: 'Law Firms',
    description: 'High-value case generation and SEO.',
    icon: Scale,
    link: '/industries/lawyers'
  }
];

export default function IndustriesGrid() {
  return (
    <section className="py-24 lg:py-32 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent mb-6"
          >
            <span className="text-sm font-medium">Specialized Expertise</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          >
            Industries We Transform
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-secondary leading-relaxed"
          >
            We don't believe in one-size-fits-all. Discover tailored digital solutions designed for the specific challenges of your industry.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  to={ind.link}
                  onClick={() => trackCTAClick(`industry_${ind.title.toLowerCase()}`)}
                  className="group block p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col"
                >
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">{ind.title}</h3>
                  <p className="text-secondary mb-6 flex-grow">{ind.description}</p>
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent mt-auto">
                    View Solutions <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}