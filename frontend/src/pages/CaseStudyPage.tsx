import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { SEOHead, generateArticleSchema } from '../components/seo/SEOHead';
import FinalCTA from '../components/sections/FinalCTA';
import { useData } from '../lib/dataContext';

export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { caseStudies } = useData();

  const data = caseStudies.find((cs: any) => cs.slug === slug || cs.id === slug);

  useEffect(() => {
    if (!data) {
      navigate('/case-studies', { replace: true });
    }
  }, [data, navigate]);

  if (!data) return null;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SEOHead
        title={data.seoTitle}
        description={data.seoDescription}
        type="article"
        schemas={[
          generateArticleSchema({
            id: `https://ayouberradi.com/case-studies/${data.slug}#article`,
            title: data.title,
            description: data.overview || data.challenge,
            url: `https://ayouberradi.com/case-studies/${data.slug}`,
            publishedDate: data.publishedDate || `${data.year || '2026'}-01-01`,
            modifiedDate: data.modifiedDate,
            image: data.heroImage,
          }),
        ]}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--background)]/80 to-[var(--background)] z-10" />
          <img 
            src={data.heroImage}
            alt={data.title}
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20">
          <Link to="/case-studies" className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-8 transition-colors">
            <ArrowLeft size={20} /> Back to Case Studies
          </Link>
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-sm font-medium">
                {data.client}
              </span>
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-medium">
                {data.industry}
              </span>
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            >
              {data.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-secondary leading-relaxed"
            >
              {data.overview}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Results Banner */}
      <section className="py-12 border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
            {data.results.map((result, i) => (
              <div key={i} className="pt-6 md:pt-0 md:px-8 first:pt-0 first:px-0 text-center md:text-left">
                <p className="text-4xl lg:text-5xl font-bold text-accent mb-2">{result.metric}</p>
                <p className="text-secondary font-medium uppercase tracking-wider text-sm">{result.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge & Solution */}
      <section className="py-24 bg-[var(--surface-muted)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">The Challenge</h2>
              <p className="text-secondary text-lg leading-relaxed mb-8">
                {data.challenge}
              </p>
              <h3 className="text-xl font-bold mb-4">Technologies Used</h3>
              <div className="flex flex-wrap gap-3">
                {(data.technologies || []).map((tech, i) => (
                  <span key={i} className="px-4 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">The Solution</h2>
              <p className="text-secondary text-lg leading-relaxed mb-8">
                {data.solution}
              </p>
              <div className="p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                <blockquote className="text-xl font-medium leading-relaxed mb-6">
                  "{data.testimonial.text}"
                </blockquote>
                <div>
                  <p className="font-bold">{data.testimonial.author}</p>
                  <p className="text-secondary text-sm">{data.testimonial.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {data.gallery && data.gallery.length > 0 && (
        <section className="py-24 bg-[var(--surface)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">Project Gallery</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {data.gallery.map((img, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg">
                  <img src={img} alt={`${data.client} showcase ${i + 1}`} className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <FinalCTA />
    </motion.main>
  );
}
