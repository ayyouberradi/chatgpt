import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { SEOHead, generateBreadcrumbSchema, generateArticleSchema } from '../components/seo/SEOHead';

const categories = ['All', 'WordPress', 'SEO', 'Hotels', 'Restaurants', 'Real Estate', 'Digital Marketing'];

const articles = [
  {
    id: 'hotel-website-best-practices',
    title: 'Hotel Website Best Practices: A Complete Guide for 2024',
    excerpt: 'Learn the essential elements every hotel website needs to drive direct bookings and reduce OTA dependency.',
    category: 'Hotels',
    readTime: '8 min',
    date: '2024-01-15',
    author: 'Ayoub Erradi',
    featured: true,
    image: 'https://images.pexels.com/photos-164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'wordpress-security-guide',
    title: 'WordPress Security: Protecting Your Website from Common Threats',
    excerpt: 'Essential security measures every WordPress site owner should implement to protect their business.',
    category: 'WordPress',
    readTime: '10 min',
    date: '2024-01-10',
    author: 'Ayoub Erradi',
    featured: false,
    image: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'local-seo-hotels',
    title: 'Local SEO for Hotels: Dominating Your Market Search Results',
    excerpt: 'How hotels can optimize their online presence to appear in local search results and attract more guests.',
    category: 'SEO',
    readTime: '7 min',
    date: '2024-01-05',
    author: 'Ayoub Erradi',
    featured: false,
    image: 'https://images.pexels.com/photos/261136/pexels-photo-261136.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'restaurant-website-mistakes',
    title: '5 Common Restaurant Website Mistakes That Cost You Customers',
    excerpt: 'Avoid these website pitfalls that drive potential customers away from your restaurant.',
    category: 'Restaurants',
    readTime: '6 min',
    date: '2023-12-28',
    author: 'Ayoub Erradi',
    featured: false,
    image: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'real-estate-lead-generation',
    title: 'Real Estate Website Lead Generation: A Strategic Approach',
    excerpt: 'How to design your real estate website to capture and nurture quality leads.',
    category: 'Real Estate',
    readTime: '9 min',
    date: '2023-12-20',
    author: 'Ayoub Erradi',
    featured: false,
    image: 'https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'wordpress-performance-optimization',
    title: 'WordPress Speed Optimization: Complete Guide for Fast Sites',
    excerpt: 'Technical strategies to make your WordPress website load faster and improve user experience.',
    category: 'WordPress',
    readTime: '12 min',
    date: '2023-12-15',
    author: 'Ayoub Erradi',
    featured: true,
    image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'content-marketing-hospitality',
    title: 'Content Marketing Strategies for Hospitality Businesses',
    excerpt: 'How hotels and riads can use content to attract more visitors and build brand loyalty.',
    category: 'Digital Marketing',
    readTime: '8 min',
    date: '2023-12-10',
    author: 'Ayoub Erradi',
    featured: false,
    image: 'https://images.pexels.com/photos/3182813/pexels-photo-3182813.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 'booking-engine-integration',
    title: 'Choosing the Right Booking Engine for Your Hotel Website',
    excerpt: 'A comprehensive comparison of booking engine solutions for hotels and accommodation providers.',
    category: 'Hotels',
    readTime: '11 min',
    date: '2023-12-05',
    author: 'Ayoub Erradi',
    featured: false,
    image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function InsightsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const { theme } = useTheme();

  const filteredArticles = articles.filter((article) => {
    if (activeCategory === 'All') return true;
    return article.category === activeCategory;
  });

  const featuredArticles = articles.filter((a) => a.featured);

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="pt-20">
      <SEOHead
        title="Insights"
        description="Expert articles on website development, SEO strategies, and digital marketing for hotels, restaurants, and real estate businesses."
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Insights', url: '/insights' },
          ]),
          ...filteredArticles.map((article) => generateArticleSchema({
            id: `https://ayouberradi.com/insights/${article.id}#article`,
            title: article.title,
            description: article.excerpt,
            url: `https://ayouberradi.com/insights/${article.id}`,
            publishedDate: article.date,
            image: article.image,
          })),
        ]}
      />

      {/* Hero Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <span className="text-sm text-muted uppercase tracking-wider mb-4 block">Insights</span>
            <h1 className="heading-lg mb-6">Expert Knowledge & Strategies</h1>
            <p className="text-xl text-secondary leading-relaxed">Articles, guides and insights on WordPress, SEO, and digital growth for hospitality and real estate businesses.</p>
          </motion.div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && activeCategory === 'All' && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-6">
              {featuredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/insights/${article.id}`}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="group relative overflow-hidden rounded-2xl h-full"
                      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                    >
                      <div className="aspect-video overflow-hidden">
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-8">
                        <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--text-muted)' }}>{article.category}</span>
                        <h2 className="text-2xl font-bold mt-4 mb-3 group-hover:text-primary transition-colors">{article.title}</h2>
                        <p className="text-secondary mb-4">{article.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{article.readTime}</span></div>
                          <div className="flex items-center gap-1"><User className="w-3.5 h-3.5" /><span>{article.author}</span></div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filter Section */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === category ? 'text-white' : 'text-secondary hover:text-primary'}`}
                style={{ backgroundColor: activeCategory === category ? 'var(--accent)' : 'var(--muted)', border: activeCategory === category ? 'none' : '1px solid var(--border)' }}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredArticles.filter(a => !a.featured || activeCategory !== 'All').map((article, index) => (
                <motion.div
                  key={article.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link to={`/insights/${article.id}`}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="group relative overflow-hidden rounded-2xl h-full"
                      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                    >
                      <div className="aspect-video overflow-hidden">
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-6">
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--text-muted)' }}>{article.category}</span>
                        <h3 className="text-lg font-semibold mt-3 mb-2 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                        <p className="text-secondary text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{article.readTime}</span></div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32" style={{ background: theme === 'light' ? 'linear-gradient(to bottom, var(--background), var(--muted), var(--background))' : 'linear-gradient(to bottom, var(--background), var(--surface-elevated), var(--background))' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="heading-md mb-6">Need Help Implementing These Strategies?</h2>
            <p className="text-secondary mb-8 max-w-2xl mx-auto">Let's work together to apply these insights and grow your business.</p>
            <Link to="/contact">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary group">
                Schedule a Consultation
                <ArrowUpRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.main>
  );
}
