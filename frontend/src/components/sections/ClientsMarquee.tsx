import { motion } from 'framer-motion';
import { useData } from '../../lib/dataContext';

export default function ClientsMarquee() {
  const { clients } = useData();
  return (
    <section className="py-16 overflow-hidden" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="mb-8 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm text-muted uppercase tracking-wider"
        >
          Trusted By Businesses Across Morocco
        </motion.p>
      </div>

      <div className="relative mask-gradient">
        <motion.div
          className="flex gap-16 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Duplicate the clients to create seamless loop */}
          {[...clients.filter(c => c.isActive), ...clients.filter(c => c.isActive)].map((client, index) => (
            <div
              key={`${client.id}-${index}`}
              className="flex items-center gap-4 text-secondary hover:text-primary transition-colors min-w-max px-4"
            >
              {client.logo ? (
                <img 
                  src={client.logo} 
                  alt={client.name} 
                  className="h-10 w-auto object-contain brightness-0 dark:invert opacity-70 hover:opacity-100 transition-opacity duration-300" 
                />
              ) : (
                <span className="text-sm md:text-base font-medium">{client.name}</span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
