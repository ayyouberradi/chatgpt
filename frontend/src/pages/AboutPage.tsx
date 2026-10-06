import { motion } from 'framer-motion';
import { ArrowRight, Download, Building, Home, Utensils, Coffee, Key, Map, Briefcase, Sparkles, Code, Palette, Share2, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { SEOHead, generateBreadcrumbSchema } from '../components/seo/SEOHead';
import AnimatedStats from '../components/ui/AnimatedStats';
import { useData } from '../lib/dataContext';

const iconMap: Record<string, React.ElementType> = {
  building: Building,
  home: Home,
  utensils: Utensils,
  coffee: Coffee,
  key: Key,
  map: Map,
  briefcase: Briefcase,
};

export default function AboutPage() {
  const { theme } = useTheme();
  const { skills, industries, stats, about } = useData();
  const activeSkills = skills.filter(s => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  const activeIndustries = industries.filter(i => i.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  const activeStats = stats.filter(s => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  const whyWorkWithMe = [
    {
      icon: Sparkles,
      title: "One Trusted Partner",
      description: "From development to design, marketing to content—everything you need in one place."
    },
    {
      icon: Code,
      title: "Premium Quality",
      description: "Over 10 years of experience delivering exceptional digital solutions that drive results."
    },
    {
      icon: Palette,
      title: "Creative Vision",
      description: "Combining technical excellence with creative storytelling that elevates your brand."
    },
    {
      icon: Share2,
      title: "Full-Service Marketing",
      description: "SEO, social media, and content that work together to grow your business."
    },
  ];

  const services = [
    { icon: Code, title: "Website Development", description: "Custom websites built for performance, conversions, and scalability." },
    { icon: Palette, title: "Design & Branding", description: "Graphic design and visual identity that sets you apart from competitors." },
    { icon: Camera, title: "Photo & Video", description: "Professional photography and video production that tells your story beautifully." },
    { icon: Share2, title: "Digital Marketing", description: "SEO, social media, and content strategies that drive real growth." },
  ];

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="pt-20">
      <SEOHead
        title="About - Ayoub Erradi"
        description="Premium Digital Solutions Expert based in Morocco. Specializing in digital strategy, website development, marketing, Airbnb support, and content creation for hospitality, real estate, and growing brands."
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'About', url: '/about' },
          ]),
        ]}
      />

      {/* SECTION 1: Personal Introduction */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <span className="text-sm uppercase tracking-wider mb-4 block" style={{ color: 'var(--accent)' }}>Digital Solutions Expert</span>
              <h1 className="heading-lg mb-6">{about.heroTitle}</h1>
              <h2 className="text-3xl font-semibold mb-6" style={{ color: 'var(--secondary)' }}>{about.heroSubtitle}</h2>
              <p className="text-xl text-secondary mb-6 leading-relaxed">
                For more than a decade, I've helped businesses transform their digital presence from ordinary to extraordinary.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                {about.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary group">
                    Book a Consultation<ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <a href="/cv.pdf" download>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary">
                    <Download className="mr-2 w-5 h-5" />Download My CV
                  </motion.button>
                </a>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <img src={about.heroImage} alt={about.heroTitle} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="absolute -z-10 -top-4 -right-4 w-full h-full rounded-3xl" style={{ border: '1px solid var(--border)' }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: My Story */}
      <section className="py-24 lg:py-32" style={{ background: theme === 'light' ? 'linear-gradient(to bottom, var(--background), var(--muted), var(--background))' : 'linear-gradient(to bottom, var(--background), var(--surface-elevated), var(--background))' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="text-sm uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>My Story</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4">{about.storyTitle}</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="space-y-6 text-lg leading-relaxed">
            <p className="text-secondary">{about.storyParagraph1}</p>
            <p className="text-secondary">{about.storyParagraph2}</p>
            <p className="text-secondary">{about.storyParagraph3}</p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: What I Do */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>What I Do</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4">Everything You Need in One Place.</h2>
            <p className="text-xl text-secondary mt-4 max-w-3xl mx-auto">
              No more coordinating multiple vendors. One partner, one process, one vision for your success.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <motion.div key={service.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="card p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--muted)' }}>
                  <service.icon className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-secondary text-sm">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Industries I Work With */}
      <section className="py-24 lg:py-32" style={{ background: theme === 'light' ? 'linear-gradient(to bottom, var(--background), var(--muted), var(--background))' : 'linear-gradient(to bottom, var(--background), var(--surface-elevated), var(--background))' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>Industries</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4">Sectors I Specialize In.</h2>
            <p className="text-xl text-secondary mt-4 max-w-3xl mx-auto">
              Deep experience in industries where visual appeal and digital presence are everything.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {activeIndustries.map((industry, index) => {
              const Icon = iconMap[industry.icon] || Briefcase;
              return (
                <motion.div key={industry.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05, duration: 0.5 }} whileHover={{ y: -5 }} className="text-center group">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <Icon className="w-7 h-7 text-secondary group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-medium">{industry.name}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Notable Clients */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-16 text-center">
            <p className="text-muted uppercase tracking-wider mb-8">Trusted By Industry Leaders</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-secondary font-medium">
              {useData().clients.filter(c => c.isActive).map((client, i) => (
                <span key={i} className="px-4 py-2 flex items-center gap-2 rounded-full" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                  {client.logo && <img src={client.logo} alt={client.name} className="h-6 w-auto object-contain brightness-0 dark:invert opacity-80" />}
                  {client.name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: My Experience & Expertise */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>Expertise</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4">Skills Built Over a Decade.</h2>
          </motion.div>
          <div className="space-y-8">
            {activeSkills.map((skill, index) => (
              <motion.div key={skill.id} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-muted text-sm">{skill.level}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${skill.level}%` }} viewport={{ once: true }} transition={{ delay: index * 0.1 + 0.2, duration: 1, ease: 'easeOut' }} className="h-full rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16">
            <AnimatedStats stats={activeStats} />
          </div>
        </div>
      </section>

      {/* SECTION 6: Why Clients Work With Me */}
      <section className="py-24 lg:py-32" style={{ background: theme === 'light' ? 'linear-gradient(to bottom, var(--background), var(--muted), var(--background))' : 'linear-gradient(to bottom, var(--background), var(--surface-elevated), var(--background))' }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>Why Me</span>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4">The Difference You'll Feel.</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {whyWorkWithMe.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="card p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-secondary">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Let's Work Together */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-sm uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>Let's Connect</span>
            <h2 className="heading-md mb-6">Ready to Transform Your Digital Presence?</h2>
            <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto">
              Whether you need a new website, better marketing, or stunning content—I'm here to help. Let's build something extraordinary together.
            </p>
            <Link to="/contact">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary group">
                Get Your Free Consultation<ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.main>
  );
}
