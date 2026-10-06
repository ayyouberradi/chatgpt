import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Tag, Briefcase, Building2 } from 'lucide-react';
import { useData } from '../lib/dataContext';
import { SEOHead, generateCaseStudySchema, generateBreadcrumbSchema } from '../components/seo/SEOHead';

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useData();

  const project = projects.find((p: any) => p.id === id || p.slug === id);

  useEffect(() => {
    if (!project) {
      navigate('/portfolio');
    }
  }, [project, navigate]);

  if (!project) return null;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-24 pb-16 lg:pt-32 lg:pb-24"
    >
      <SEOHead
        title={`${project.title} - Project Case Study`}
        description={project.description}
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Portfolio', url: '/portfolio' },
            { name: project.title, url: `/portfolio/${project.id}` },
          ]),
          generateCaseStudySchema({
            id: project.id,
            title: project.title,
            description: project.description,
            image: project.image,
          }),
        ]}
      />

      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/portfolio"
          className="inline-flex items-center text-sm font-medium text-secondary hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Portfolio
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
              {project.category || 'Website'}
            </span>
            {project.industry && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: 'var(--muted)', color: 'var(--text-muted)' }}>
                <Building2 className="w-3.5 h-3.5" />
                {project.industry}
              </span>
            )}
          </div>
          <h1 className="heading-lg mb-6">{project.title}</h1>
          <p className="text-xl text-secondary leading-relaxed max-w-3xl">
            {project.description}
          </p>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-16 rounded-2xl overflow-hidden shadow-2xl"
          style={{ border: '1px solid var(--border)' }}
        >
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-auto object-cover"
          />
        </motion.div>

        {/* Project Meta Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 p-8 rounded-2xl" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          {project.services && project.services.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-semibold mb-4 text-primary">
                <Briefcase className="w-5 h-5 text-accent" />
                Services Provided
              </h3>
              <ul className="space-y-2 text-secondary">
                {project.services.map((service: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {project.tags && project.tags.length > 0 && (
            <div className="md:col-span-2">
              <h3 className="flex items-center gap-2 font-semibold mb-4 text-primary">
                <Tag className="w-5 h-5 text-accent" />
                Technologies & Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 rounded-md text-sm" style={{ backgroundColor: 'var(--muted)', color: 'var(--text-muted)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Link / CTA */}
        {project.link && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <a 
              href={project.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center"
            >
              Visit Live Project
              <ExternalLink className="w-5 h-5 ml-2" />
            </a>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
}
