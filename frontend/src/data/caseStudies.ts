export interface CaseStudyData {
  slug: string;
  title: string;
  client: string;
  industry: string;
  publishedDate: string;
  modifiedDate: string;
  seoTitle: string;
  seoDescription: string;
  heroImage: string;
  overview: string;
  challenge: string;
  solution: string;
  technologies: string[];
  results: { metric: string; label: string }[];
  gallery: string[];
  testimonial: {
    text: string;
    author: string;
    role: string;
  };
}

export const caseStudiesData: Record<string, CaseStudyData> = {
  'la-ferme-medina': {
    slug: 'la-ferme-medina',
    title: 'Transforming Direct Bookings for a Boutique Restaurant',
    client: 'La Ferme Medina',
    industry: 'Restaurant',
    publishedDate: '2026-06-10',
    modifiedDate: '2026-07-20',
    seoTitle: 'La Ferme Medina Case Study | Ayoub Erradi',
    seoDescription: 'Discover how we helped La Ferme Medina increase direct reservations by 120% with a custom website and local SEO strategy.',
    heroImage: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    overview: 'La Ferme Medina is a premier dining destination in the heart of Marrakech. They needed a digital presence that reflected their unique ambiance while driving more direct table reservations.',
    challenge: 'The restaurant relied heavily on third-party booking platforms, which ate into their profit margins. Their existing website was outdated, not mobile-friendly, and failed to rank for local searches like "best restaurants in Marrakech Medina".',
    solution: 'We completely redesigned their website with a mobile-first approach, integrating a seamless direct booking widget. We implemented a robust local SEO strategy, optimizing their Google Business Profile and targeting high-intent dining keywords.',
    technologies: ['WordPress', 'Custom Theme', 'SEO Optimization', 'Reservation System API'],
    results: [
      { metric: '+120%', label: 'Direct Reservations' },
      { metric: '-35%', label: 'Third-Party Commissions' },
      { metric: 'Top 3', label: 'Google Local Pack Ranking' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    ],
    testimonial: {
      text: "The new website completely changed our business. We're fully booked most nights entirely through our own site, saving us thousands in commission fees.",
      author: 'Management Team',
      role: 'La Ferme Medina'
    }
  },
  'riad-inn-medina': {
    slug: 'riad-inn-medina',
    title: 'Scaling Luxury Hospitality with Digital Excellence',
    client: 'Riad Inn Medina',
    industry: 'Hospitality',
    publishedDate: '2026-06-12',
    modifiedDate: '2026-07-20',
    seoTitle: 'Riad Inn Medina Case Study | Ayoub Erradi',
    seoDescription: 'See how Riad Inn Medina boosted international bookings and brand visibility through our custom WordPress and SEO solutions.',
    heroImage: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    overview: 'Riad Inn Medina offers a luxury Moroccan experience. They sought to elevate their brand to attract high-end international travelers and reduce OTA dependency.',
    challenge: 'Despite a stunning physical location, their digital presence was lackluster. They suffered from slow page loads, a confusing booking flow, and poor visibility in key European markets.',
    solution: 'We built a high-performance WordPress site featuring immersive photography, a frictionless direct booking engine, and multilingual SEO targeting travelers from France, the UK, and Spain.',
    technologies: ['WordPress', 'Multilingual Setup', 'Performance Optimization', 'PMS Integration'],
    results: [
      { metric: '+85%', label: 'Organic Traffic' },
      { metric: '40%', label: 'Increase in Direct Bookings' },
      { metric: '< 1.5s', label: 'Page Load Speed' }
    ],
    gallery: [
      'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    ],
    testimonial: {
      text: "Our international visibility skyrocketed. The seamless booking experience has made it incredibly easy for guests to reserve directly with us.",
      author: 'Owner',
      role: 'Riad Inn Medina'
    }
  },
  'real-estate-lead-generation': {
    slug: 'real-estate-lead-generation',
    title: 'Automating Lead Generation for Assafaa Bayt',
    client: 'Assafaa Bayt Immobilier',
    industry: 'Real Estate',
    publishedDate: '2026-06-14',
    modifiedDate: '2026-07-20',
    seoTitle: 'Real Estate Lead Generation Case Study | Ayoub Erradi',
    seoDescription: 'How we transformed a real estate agency\'s digital presence to generate 200+ qualified buyer leads per month.',
    heroImage: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    overview: 'Assafaa Bayt Immobilier is a leading real estate agency needing a modern platform to showcase properties and capture high-quality buyer and seller leads.',
    challenge: 'Their agents spent too much time fielding calls from unqualified leads. Their website lacked advanced filtering, making it hard for users to find relevant properties.',
    solution: 'We developed a custom real estate portal with advanced search filters, map integration, and automated lead capture funnels that qualify prospects before they reach an agent.',
    technologies: ['React', 'Custom Map Integration', 'CRM API', 'Advanced Filtering'],
    results: [
      { metric: '200+', label: 'Qualified Leads/Month' },
      { metric: '3x', label: 'User Time on Site' },
      { metric: '60%', label: 'Drop in Unqualified Calls' }
    ],
    gallery: [
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    ],
    testimonial: {
      text: "The quality of leads has improved dramatically. Our agents are now spending their time closing deals rather than answering basic questions.",
      author: 'Sales Director',
      role: 'Assafaa Bayt Immobilier'
    }
  }
};
