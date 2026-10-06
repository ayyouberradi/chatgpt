import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../../lib/dataContext';

const SITE_URL = 'https://ayouberradi.com';
const PERSON_ID = `${SITE_URL}#person`;
const ORGANIZATION_ID = `${SITE_URL}#organization`;
const WEBSITE_ID = `${SITE_URL}#website`;
const SHARED_JOB_TITLE = 'Digital Solutions Expert';
const SHARED_DESCRIPTION = 'Ayoub Erradi is a Digital Solutions Expert based in Morocco who provides website development, SEO, content production, and digital marketing for hotels, riads, restaurants, Airbnb hosts, and real estate businesses.';
const SHARED_SAME_AS = [
  'https://ma.linkedin.com/in/ayouberradi',
  'https://www.instagram.com/ayyouberradi/',
];

export const organizationSchema = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'Ayoub Erradi',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: SHARED_DESCRIPTION,
  founder: {
    '@id': PERSON_ID,
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'MA',
    addressRegion: 'Morocco',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+212-708-295518',
    contactType: 'customer service',
    email: 'contact@ayouberradi.com',
    availableLanguage: ['English', 'French', 'Arabic'],
  },
  sameAs: SHARED_SAME_AS,
};

export const personSchema = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Ayoub Erradi',
  url: SITE_URL,
  image: `${SITE_URL}/ayoub-erradi.jpg`,
  jobTitle: SHARED_JOB_TITLE,
  description: SHARED_DESCRIPTION,
  email: 'contact@ayouberradi.com',
  telephone: '+212-708-295518',
  worksFor: {
    '@id': ORGANIZATION_ID,
  },
  sameAs: SHARED_SAME_AS,
  knowsAbout: [
    'Website Development',
    'SEO Optimization',
    'Landing Pages',
    'WooCommerce',
    'Digital Marketing',
    'Web Design',
    'Photography',
    'Video Production',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'MA',
    addressRegion: 'Morocco',
  },
};

export const websiteSchema = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: 'Ayoub Erradi',
  url: SITE_URL,
  description: SHARED_DESCRIPTION,
  publisher: {
    '@id': ORGANIZATION_ID,
  },
  about: {
    '@id': PERSON_ID,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export const siteGraphSchema = {
  '@context': 'https://schema.org',
  '@graph': [organizationSchema, personSchema, websiteSchema],
};

export const generateServiceSchema = (service: {
  id: string;
  title: string;
  description: string;
  features: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}/services#${service.id}`,
  name: service.title,
  description: service.description,
  provider: {
    '@id': ORGANIZATION_ID,
  },
  areaServed: 'Worldwide',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Digital Services',
    itemListElement: service.features.map((feature) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: feature,
      },
    })),
  },
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const generateBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.url}`,
  })),
});

export const generateArticleSchema = (article: {
  id?: string;
  title: string;
  description: string;
  url: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  type?: 'Article' | 'BlogPosting';
}) => ({
  '@context': 'https://schema.org',
  '@type': article.type || 'BlogPosting',
  '@id': article.id || article.url,
  headline: article.title,
  description: article.description,
  author: {
    '@id': PERSON_ID,
  },
  publisher: {
    '@id': ORGANIZATION_ID,
  },
  datePublished: article.publishedDate,
  dateModified: article.modifiedDate || article.publishedDate,
  ...(article.image ? { image: article.image } : {}),
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': article.url,
  },
});

export const generateCaseStudySchema = (project: {
  id: string;
  title: string;
  description: string;
  client?: string;
  industry?: string;
  image?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  '@id': `${SITE_URL}/case-studies/${project.id}`,
  name: project.title,
  description: project.description,
  author: {
    '@id': PERSON_ID,
  },
  ...(project.client && { client: project.client }),
  ...(project.industry && { about: { '@type': 'Thing', name: project.industry } }),
  image: project.image,
});

// SEO Head Component - Injects schemas and meta tags
interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  schemas?: object[];
}

export function SEOHead({
  title,
  description,
  image,
  url,
  type = 'website',
  schemas = [],
}: SEOHeadProps) {
  const location = useLocation();
  const { seo } = useData();
  const fullTitle = title ? `${title} | Ayoub Erradi` : seo.siteTitle;
  const fullDescription = description || seo.siteDescription;
  const fullUrl = url || `${SITE_URL}${location.pathname}`;
  const fullImage = image || seo.ogImage;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Standard meta tags
    updateMeta('description', fullDescription);
    updateMeta('keywords', seo.siteKeywords);
    updateMeta('author', 'Ayoub Erradi');
    updateMeta('robots', 'index, follow');

    // Open Graph
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', fullDescription, true);
    updateMeta('og:type', type, true);
    updateMeta('og:url', fullUrl, true);
    updateMeta('og:image', fullImage, true);
    updateMeta('og:site_name', 'Ayoub Erradi', true);

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', fullDescription);
    updateMeta('twitter:image', fullImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    let siteGraphScript = document.getElementById('schema-site-graph') as HTMLScriptElement;
    if (!siteGraphScript) {
      siteGraphScript = document.createElement('script');
      siteGraphScript.id = 'schema-site-graph';
      siteGraphScript.type = 'application/ld+json';
      document.head.appendChild(siteGraphScript);
    }
    siteGraphScript.textContent = JSON.stringify(siteGraphSchema);

    schemas.forEach((schema, index) => {
      const scriptId = `schema-${index}-${location.pathname.replace(/\//g, '-')}`;
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    });

    return () => {
      schemas.forEach((_, index) => {
        const scriptId = `schema-${index}-${location.pathname.replace(/\//g, '-')}`;
        const script = document.getElementById(scriptId);
        if (script) {
          script.remove();
        }
      });
    };
  }, [fullTitle, fullDescription, fullUrl, fullImage, type, schemas, location.pathname]);

  return null;
}
export const defaultSchemas = [];

export const contactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Ayoub Erradi',
  description: 'Get in touch with Ayoub Erradi for digital solutions, SEO, Airbnb management, and website development.',
  url: `${SITE_URL}/contact`,
  mainEntity: {
    '@id': PERSON_ID,
  },
};
