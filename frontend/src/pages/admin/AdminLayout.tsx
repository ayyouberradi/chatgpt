import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Briefcase, Layers, Users, DollarSign, Scroll, Settings, Menu, X, Award, Building2, User, LogOut, Image as ImageIcon, FileText } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Projects', icon: Briefcase, path: '/admin/projects' },
  { name: 'Case Studies', icon: FileText, path: '/admin/case-studies' },
  { name: 'Services', icon: Layers, path: '/admin/services' },
  { name: 'Testimonials', icon: Users, path: '/admin/testimonials' },
  { name: 'Retainers', icon: DollarSign, path: '/admin/retainers' },
  { name: 'Packages', icon: Scroll, path: '/admin/packages' },
  { name: 'Skills', icon: Award, path: '/admin/skills' },
  { name: 'Clients', icon: Building2, path: '/admin/clients' },
  { name: 'About', icon: User, path: '/admin/about' },
  { name: 'Media', icon: ImageIcon, path: '/admin/media' },
  { name: 'SEO & Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--surface-elevated)', borderBottom: '1px solid var(--border)' }}>
        <span className="font-bold text-lg">Admin Dashboard</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className="w-72 h-screen hidden lg:flex lg:flex-col sticky top-0"
        style={{
          backgroundColor: 'var(--surface-elevated)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Desktop sidebar content */}
        <div className="p-6 pb-4 shrink-0">
          <Link to="/" className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>← Back to Site</Link>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 pt-0 no-scrollbar pb-24">
          <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? 'var(--accent-foreground)' : 'var(--foreground)',
                }}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
          </nav>
        </div>
        <div className="mt-auto p-6 pt-4 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left"
            style={{ color: 'var(--foreground)' }}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isMobileMenuOpen ? 0 : -300 }}
        className="fixed lg:hidden z-50 w-72 h-screen flex flex-col overflow-hidden"
        style={{
          backgroundColor: 'var(--surface-elevated)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <div className="p-6 pb-4 shrink-0">
          <Link to="/" className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>← Back to Site</Link>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 pt-0 no-scrollbar pb-24">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? 'var(--accent-foreground)' : 'var(--foreground)',
                  }}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-6 pt-4 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => {
              signOut();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left"
            style={{ color: 'var(--foreground)' }}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-10 pt-20 lg:pt-10 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
