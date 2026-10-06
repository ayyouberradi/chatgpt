import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { request } from './http';
import { useAuth } from './AuthContext';
import { projects, services, testimonials, retainers, comboPackages, stats, clients, industries, benefits, helpOptions, skills as skillsData } from '../data/content';
import { caseStudiesData } from '../data/caseStudies';

export interface CaseStudy {
  publishedDate?: string;
  modifiedDate?: string;
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  location?: string;
  year?: string;
  seoTitle?: string;
  seoDescription?: string;
  heroImage?: string;
  overview?: string;
  challenge: string;
  strategy?: string;
  solution?: string;
  execution?: string[];
  technologies?: string[];
  results: { metric: string; label: string }[];
  gallery: string[];
  testimonial: {
    text: string;
    author: string;
    role: string;
  };
  displayOrder: number;
  isActive: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  startingPrice?: string;
  priceOptions?: Array<{ label: string; price: string }>;
  features: string[];
  cta: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  industry?: string;
  description: string;
  image: string;
  tags: string[];
  services?: string[];
  link?: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  resultMetric?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Retainer {
  id: string;
  name: string;
  price: string;
  currency: string;
  period: string;
  description: string;
  features: string[];
  isHighlighted: boolean;
  cta: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ComboPackage {
  id: string;
  name: string;
  price: string;
  currency: string;
  description: string;
  features: string[];
  isPopular: boolean;
  cta: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Stat {
  id: string;
  value: number;
  suffix: string;
  label: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Client {
  id: string;
  name: string;
  logo: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Industry {
  id: string;
  name: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

export interface HelpOption {
  id: string;
  icon: string;
  title: string;
  description: string;
  cta: string;
  link: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  displayOrder: number;
  isActive: boolean;
}

export interface SEOData {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  ogImage: string;
}

export interface AboutData {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  storyTitle: string;
  storyParagraph1: string;
  storyParagraph2: string;
  storyParagraph3: string;
}

export interface AvailabilityData {
  status: 'available' | 'limited' | 'booking-next-month';
  lastUpdated: string;
  showWaitingList: boolean;
}

interface DataContextType {
  services: Service[];
  projects: Project[];
  testimonials: Testimonial[];
  retainers: Retainer[];
  comboPackages: ComboPackage[];
  stats: Stat[];
  clients: Client[];
  industries: Industry[];
  benefits: Benefit[];
  helpOptions: HelpOption[];
  skills: Skill[];
  caseStudies: CaseStudy[];
  seo: SEOData;
  about: AboutData;
  availability: AvailabilityData;
  saveServices: (services: Service[]) => void;
  saveProjects: (projects: Project[]) => void;
  saveTestimonials: (testimonials: Testimonial[]) => void;
  saveRetainers: (retainers: Retainer[]) => void;
  saveComboPackages: (packages: ComboPackage[]) => void;
  saveStats: (stats: Stat[]) => void;
  saveClients: (clients: Client[]) => void;
  saveIndustries: (industries: Industry[]) => void;
  saveBenefits: (benefits: Benefit[]) => void;
  saveHelpOptions: (helpOptions: HelpOption[]) => void;
  saveSkills: (skills: Skill[]) => void;
  saveCaseStudies: (caseStudies: CaseStudy[]) => void;
  saveSEO: (seo: SEOData) => void;
  saveAbout: (about: AboutData) => void;
  saveAvailability: (availability: AvailabilityData) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSEO: SEOData = {
  siteTitle: "Ayoub Erradi - Digital Solutions Expert in Marrakech",
  siteDescription: "Digital solutions, Local SEO, website development, Airbnb management, and marketing services for hotels, riads, restaurants, and real estate businesses in Marrakech, Morocco.",
  siteKeywords: "Digital Solutions Expert Marrakech, Airbnb management Morocco, Local SEO Morocco, website design for hotels, riad marketing, restaurant web design, real estate websites Morocco",
  ogImage: "https://ayouberradi.com/og-image.jpg"
};

const defaultAbout: AboutData = {
  heroTitle: "I'm Ayoub Erradi.",
  heroSubtitle: "Building Brands That Connect & Convert.",
  heroDescription: "Based in Morocco, I combine digital strategy, website development, design, marketing, and content creation into one seamless, results-driven experience. No more juggling multiple freelancers or agencies—just one trusted partner dedicated to your growth.",
  heroImage: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800",
  storyTitle: "From Freelancer to Trusted Partner.",
  storyParagraph1: "It started over 10 years ago with a simple website for a local business. What began as a single project evolved into a deep passion for combining technology with creativity.",
  storyParagraph2: "Along the way, I realized something important: businesses don't need just a website. They need a complete digital ecosystem—one that looks beautiful, works flawlessly, and actually grows their business.",
  storyParagraph3: "That's why I've spent years mastering digital solutions across website development, graphic design, photography, video production, SEO, and digital marketing. It's why I can look at your business and see the whole picture."
};

const defaultAvailability: AvailabilityData = {
  status: 'available',
  lastUpdated: new Date().toISOString().split('T')[0],
  showWaitingList: false,
};

function transformContentToAdminTypes() {
  return {
    services: services.map((s, i) => ({
      ...s,
      id: s.id || `service-${i}`,
      displayOrder: i,
      isActive: true
    })),
    projects: projects.map((p, i) => ({
      ...p,
      id: p.id || `project-${i}`,
      slug: p.id || `project-${i}`,
      displayOrder: i,
      isFeatured: i === 0,
      isActive: true
    })),
    testimonials: testimonials.map((t, i) => ({
      ...t,
      id: t.id?.toString() || `testimonial-${i}`,
      displayOrder: i,
      isActive: true
    })),
    retainers: retainers.map((r, i) => ({
      ...r,
      id: r.id || `retainer-${i}`,
      isHighlighted: r.highlighted,
      displayOrder: i,
      isActive: true
    })),
    comboPackages: comboPackages.map((p, i) => ({
      ...p,
      id: p.id || `package-${i}`,
      isPopular: p.popular,
      displayOrder: i,
      isActive: true
    })),
    stats: stats.map((s, i) => ({
      ...s,
      id: `stat-${i}`,
      displayOrder: i,
      isActive: true
    })),
    clients: Array.isArray(clients) ? clients.map((c: any, i) => {
      if (typeof c === 'string') {
        return {
          id: `client-${i}`,
          name: c,
          logo: '',
          displayOrder: i,
          isActive: true,
        };
      }
      return c;
    }) : [],
    industries: industries.map((ind, i) => ({
      ...ind,
      id: `industry-${i}`,
      displayOrder: i,
      isActive: true
    })),
    benefits: benefits.map((b, i) => ({
      ...b,
      id: `benefit-${i}`,
      displayOrder: i,
      isActive: true
    })),
    helpOptions: helpOptions.map((h, i) => ({
      ...h,
      id: `help-${i}`,
      displayOrder: i,
      isActive: true
    })),
    skills: skillsData.map((s, i) => ({
      ...s,
      id: `skill-${i}`,
      displayOrder: i,
      isActive: true
    })),
    caseStudies: Object.values(caseStudiesData).map((cs, i) => ({
      ...cs,
      id: cs.slug,
      displayOrder: i,
      isActive: true
    }))
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState(transformContentToAdminTypes());
  const [seo, setSEO] = useState(defaultSEO);
  const [about, setAbout] = useState(defaultAbout);
  const [availability, setAvailability] = useState(defaultAvailability);
  const [saveError, setSaveError] = useState('');
  useEffect(() => {
    let cancelled = false;
    request('/settings').then(saved => {
      if (cancelled) return;
      if (saved.admin_data) setData(saved.admin_data);
      if (saved.seo_data) setSEO(saved.seo_data);
      if (saved.about_data) setAbout(saved.about_data);
      if (saved.availability_data) setAvailability(saved.availability_data);
    }).catch(error => { if (!cancelled) setSaveError(error.message); });
    return () => { cancelled = true; };
  }, [user?.id]);
  const persist = async (field: string, value: unknown) => {
    if (!user) { setSaveError('Please sign in to save changes.'); return; }
    try { await request('/settings', { method: 'PATCH', body: JSON.stringify({ [field]: value }) }); setSaveError(''); }
    catch (error) { setSaveError(`Changes could not be saved: ${(error as Error).message}`); throw error; }
  };
  const saveCollection = (field: string, value: unknown) => {
    request(`/settings/${field}`, { method: 'PUT', body: JSON.stringify({ value }) })
      .then(() => { setData((previous: any) => ({ ...previous, [field]: value })); setSaveError(''); })
      .catch(error => setSaveError(`Changes could not be saved: ${error.message}`));
  };
  const saveServices = (newServices: Service[]) => {
    saveCollection('services', newServices);
  };

  const saveProjects = (newProjects: Project[]) => {
    const normalizeListField = (value: unknown): string[] => {
      if (!Array.isArray(value)) return [];

      return value
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item, index, array) => array.indexOf(item) === index);
    };

    const normalizedProjects = newProjects.map((project) => ({
      ...project,
      tags: normalizeListField(project.tags),
      services: normalizeListField(project.services),
    }));

    saveCollection('projects', normalizedProjects);
  };

  const saveTestimonials = (newTestimonials: Testimonial[]) => {
    saveCollection('testimonials', newTestimonials);
  };

  const saveRetainers = (newRetainers: Retainer[]) => {
    saveCollection('retainers', newRetainers);
  };

  const saveComboPackages = (newPackages: ComboPackage[]) => {
    saveCollection('comboPackages', newPackages);
  };

  const saveStats = (newStats: Stat[]) => {
    saveCollection('stats', newStats);
  };

  const saveClients = (newClients: Client[]) => {
    saveCollection('clients', newClients);
  };

  const saveIndustries = (newIndustries: Industry[]) => {
    saveCollection('industries', newIndustries);
  };

  const saveBenefits = (newBenefits: Benefit[]) => {
    saveCollection('benefits', newBenefits);
  };

  const saveHelpOptions = (newHelpOptions: HelpOption[]) => {
    saveCollection('helpOptions', newHelpOptions);
  };

  const saveSkills = (newSkills: Skill[]) => {
    saveCollection('skills', newSkills);
  };

  const saveCaseStudies = (newCaseStudies: CaseStudy[]) => {
    saveCollection('caseStudies', newCaseStudies);
  };

  const saveSEO = (newSEO: SEOData) => {
    void persist('seo_data', newSEO).then(() => setSEO(newSEO)).catch(() => {});
  };

  const saveAbout = (newAbout: AboutData) => {
    void persist('about_data', newAbout).then(() => setAbout(newAbout)).catch(() => {});
  };

  const saveAvailability = (newAvailability: AvailabilityData) => {
    void persist('availability_data', newAvailability).then(() => setAvailability(newAvailability)).catch(() => {});
  };

  const resetData = () => {
    void persist('admin_data', transformContentToAdminTypes()).then(() => setData(transformContentToAdminTypes())).catch(() => {});
  };

  return (
    <DataContext.Provider
      value={{
        ...data,
        seo,
        about,
        availability,
        saveServices,
        saveProjects,
        saveTestimonials,
        saveRetainers,
        saveComboPackages,
        saveStats,
        saveClients,
        saveIndustries,
        saveBenefits,
        saveHelpOptions,
        saveSkills,
        saveCaseStudies,
        saveSEO,
        saveAbout,
        saveAvailability,
        resetData
      }}
    >
      {saveError && <div role="alert" className="fixed bottom-4 left-4 z-[100] max-w-md rounded-lg bg-red-700 p-4 text-white">{saveError}<button className="ml-4 underline" onClick={() => setSaveError('')}>Dismiss</button></div>}
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
