import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Contact', path: '/contact' },
  ];

  const services = [
    'Airbnb Management',
    'Website Development',
    'Landing Pages',
    'SEO Optimization',
    'Website Fixes',
    'Graphic Design',
    'Photography',
  ];

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Facebook, href: '#', label: 'Facebook' },
  ];

  return (
    <footer
      className="relative"
      style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="text-xl font-bold tracking-tight mb-6"
              >
                <span style={{ color: 'var(--foreground)' }}>AYOUB</span>
                <span className="ml-1" style={{ color: 'var(--text-muted)' }}>ERRADI</span>
              </motion.div>
            </Link>
            <p className="text-secondary text-sm leading-relaxed mb-6 max-w-sm">
              Digital solutions for websites, SEO, content, and marketing, with support for hospitality, restaurants, Airbnb listings, and real estate businesses in Morocco and beyond.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-secondary hover:text-primary transition-colors"
                  style={{
                    backgroundColor: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-secondary text-sm hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <motion.span
                      initial={{ width: 0 }}
                      whileHover={{ width: 12 }}
                      className="h-px"
                      style={{ backgroundColor: 'var(--foreground)' }}
                    />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-6">Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-secondary text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:contact@ayouberradi.com"
                  className="flex items-center gap-3 text-secondary text-sm hover:text-primary transition-colors group"
                >
                  <Mail size={18} className="text-muted group-hover:text-primary transition-colors" />
                  contact@ayouberradi.com
                </a>
              </li>
              <li>
                <a
                  href="/book?channel=whatsapp&source=footer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-secondary text-sm hover:text-primary transition-colors group"
                >
                  <Phone size={18} className="text-muted group-hover:text-primary transition-colors" />
                  +212 708 295518
                </a>
              </li>
              <li>
                <span className="flex items-center gap-3 text-secondary text-sm">
                  <MapPin size={18} className="text-muted" />
                  Morocco
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className="mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-muted text-sm">
            &copy; {currentYear} Ayoub Erradi. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-muted text-sm hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted text-sm hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
