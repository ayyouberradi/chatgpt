import { useData } from '../../lib/dataContext';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { projects, services, testimonials, retainers, clients, resetData } = useData();

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: '📁' },
    { label: 'Services', value: services.length, icon: '⚡' },
    { label: 'Testimonials', value: testimonials.length, icon: '💬' },
    { label: 'Retainer Plans', value: retainers.length, icon: '💰' },
    { label: 'Clients', value: clients.length, icon: '👥' },
  ];

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Dashboard Overview
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/admin/projects" className="block p-4 rounded-xl hover:bg-surface-muted transition-colors border border-dashed">+ Add New Project</a>
            <a href="/admin/services" className="block p-4 rounded-xl hover:bg-surface-muted transition-colors border border-dashed">+ Add New Service</a>
            <a href="/admin/testimonials" className="block p-4 rounded-xl hover:bg-surface-muted transition-colors border border-dashed">+ Add New Testimonial</a>
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to reset all data? This will delete all your changes and restore defaults.')) {
                  resetData();
                }
              }} 
              className="w-full p-4 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              🔄 Reset All Data
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
          <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="p-3 rounded-xl bg-surface-muted">
                <div className="font-medium">{project.title}</div>
                <div className="text-sm text-muted-foreground">{project.category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
