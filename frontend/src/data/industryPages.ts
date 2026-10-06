export interface IndustryData {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  heroSubtitle: string;
  heroImage: string;
  serviceOverview: string;
  painPoints: { title: string; description: string }[];
  solutions: { title: string; description: string }[];
  benefits: string[];
  faqs: { question: string; answer: string }[];
}

export const industryPagesData: Record<string, IndustryData> = {
  'hotels-riads': {
    slug: 'hotels-riads',
    title: 'Web Design & SEO for Hotels & Riads',
    seoTitle: 'Web Design & SEO for Hotels and Riads in Marrakech | Ayoub Erradi',
    seoDescription: 'Boost your direct bookings with a custom WordPress website, professional photography, and local SEO designed specifically for hotels and riads in Morocco.',
    heroSubtitle: 'Stop relying on OTAs. We build high-converting websites that drive direct bookings and showcase your unique hospitality experience.',
    heroImage: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    serviceOverview: 'We provide end-to-end digital solutions for the hospitality sector. From stunning visual design to robust booking engine integration, we ensure your property stands out in a crowded market.',
    painPoints: [
      { title: 'High OTA Commissions', description: 'Paying 15-25% commission on every booking eats into your profit margins.' },
      { title: 'Poor Online Visibility', description: 'Struggling to rank on Google for local hospitality searches.' },
      { title: 'Outdated Website', description: 'A slow, non-mobile-friendly site that fails to capture the true beauty of your property.' }
    ],
    solutions: [
      { title: 'Direct Booking Engine', description: 'Seamless integration with your preferred PMS to drive commission-free bookings.' },
      { title: 'Local SEO Strategy', description: 'Optimizing your site to capture high-intent travelers searching for stays in your area.' },
      { title: 'Immersive Visuals', description: 'Professional photography and video that instantly captivate potential guests.' }
    ],
    benefits: [
      'Increase direct booking revenue by up to 40%',
      'Enhance brand perception and trust',
      'Automate guest inquiries and reservations',
      'Outrank local competitors on search engines'
    ],
    faqs: [
      { question: 'Do you integrate with my existing PMS?', answer: 'Yes, we seamlessly integrate with popular systems like Cloudbeds, Mews, SiteMinder, and more.' },
      { question: 'How long does a new hotel website take?', answer: 'Typically 4 to 8 weeks, depending on the complexity and booking engine requirements.' }
    ]
  },
  'restaurants': {
    slug: 'restaurants',
    title: 'Digital Marketing & Web Design for Restaurants',
    seoTitle: 'Web Design & SEO for Restaurants in Marrakech | Ayoub Erradi',
    seoDescription: 'Attract more diners with a mouth-watering website, optimized local SEO, and a seamless online reservation system for your restaurant.',
    heroSubtitle: 'Turn website visitors into loyal diners with stunning menus, seamless reservations, and dominant local search visibility.',
    heroImage: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    serviceOverview: 'We help culinary businesses thrive online. Our solutions combine appetizing visuals with functional features like online ordering and table reservations.',
    painPoints: [
      { title: 'Empty Tables on Weekdays', description: 'Struggling to maintain consistent foot traffic outside of peak hours.' },
      { title: 'Hard-to-Read PDF Menus', description: 'Frustrating mobile experiences that drive potential customers away.' },
      { title: 'Invisible on Local Search', description: 'Missing out on "restaurants near me" searches.' }
    ],
    solutions: [
      { title: 'Interactive Digital Menus', description: 'Mobile-first, SEO-friendly menus that are easy to update and beautiful to browse.' },
      { title: 'Reservation Systems', description: 'Integrated booking widgets that make securing a table effortless.' },
      { title: 'Local SEO & Google Business', description: 'Dominating local map packs to capture hungry searchers.' }
    ],
    benefits: [
      'Increase table reservations by 30%+',
      'Eliminate third-party ordering fees',
      'Build a loyal customer database',
      'Showcase your culinary creations effectively'
    ],
    faqs: [
      { question: 'Can you set up online ordering?', answer: 'Yes, we can build custom online ordering systems to save you from high delivery app fees.' },
      { question: 'Do you provide food photography?', answer: 'Absolutely. We offer professional food and interior photography to make your site shine.' }
    ]
  },
  'real-estate': {
    slug: 'real-estate',
    title: 'Web Solutions for Real Estate Agencies',
    seoTitle: 'Web Design & SEO for Real Estate in Morocco | Ayoub Erradi',
    seoDescription: 'Generate qualified property leads with high-performance real estate websites featuring advanced search, IDX integration, and targeted SEO.',
    heroSubtitle: 'Showcase properties beautifully and generate high-quality leads with a custom-built real estate platform.',
    heroImage: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    serviceOverview: 'We build comprehensive real estate platforms designed to capture leads, display properties flawlessly, and establish your agency as a market leader.',
    painPoints: [
      { title: 'Low Quality Leads', description: 'Wasting time on inquiries from unqualified buyers.' },
      { title: 'Clunky Property Search', description: 'Visitors leaving because they cannot easily filter or find properties.' },
      { title: 'Manual Updates', description: 'Spending hours manually uploading listings instead of closing deals.' }
    ],
    solutions: [
      { title: 'Advanced Property Filters', description: 'Intuitive search interfaces that help buyers find exactly what they want.' },
      { title: 'Lead Generation Funnels', description: 'Strategic forms and lead magnets to capture buyer/seller information.' },
      { title: 'Automated CRM Integration', description: 'Connecting your website directly to your sales pipeline.' }
    ],
    benefits: [
      'Generate 2x more qualified buyer leads',
      'Reduce manual administrative work',
      'Build stronger trust with property sellers',
      'Dominate local real estate search terms'
    ],
    faqs: [
      { question: 'Do you support multi-agent portals?', answer: 'Yes, we can build systems where multiple agents can manage their own listings.' },
      { question: 'Can you integrate with our CRM?', answer: 'We connect seamlessly with HubSpot, Salesforce, and real estate specific CRMs.' }
    ]
  },
  'ecommerce': {
    slug: 'ecommerce',
    title: 'High-Converting E-commerce Solutions',
    seoTitle: 'E-commerce Web Design & WooCommerce Expert | Ayoub Erradi',
    seoDescription: 'Scale your online store with blazing-fast, secure, and conversion-optimized WooCommerce development and digital marketing.',
    heroSubtitle: 'Stop losing sales to abandoned carts. We build fast, secure, and highly optimized online stores that turn visitors into customers.',
    heroImage: 'https://images.pexels.com/photos/34577/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    serviceOverview: 'We specialize in scalable WooCommerce and bespoke e-commerce solutions. From payment gateways to inventory management, we cover it all.',
    painPoints: [
      { title: 'High Cart Abandonment', description: 'Customers leaving at checkout due to friction or slow loading times.' },
      { title: 'Poor Mobile Experience', description: 'Losing the majority of shoppers who browse on their phones.' },
      { title: 'Complex Management', description: 'Struggling to track inventory, shipping, and variations effectively.' }
    ],
    solutions: [
      { title: 'Frictionless Checkout', description: 'Optimized payment flows that make buying incredibly easy.' },
      { title: 'Speed Optimization', description: 'Sub-second page loads to keep shoppers engaged and buying.' },
      { title: 'E-commerce SEO', description: 'Optimizing product and category pages to rank for buying keywords.' }
    ],
    benefits: [
      'Increase average order value',
      'Recover lost sales automatically',
      'Scale to thousands of products seamlessly',
      'Secure, fast, and reliable shopping experience'
    ],
    faqs: [
      { question: 'Which platforms do you use?', answer: 'We primarily specialize in WooCommerce for ultimate flexibility and ownership.' },
      { question: 'Do you handle payment gateway integration?', answer: 'Yes, we integrate Stripe, PayPal, CMI, and local Moroccan payment solutions.' }
    ]
  },
  'medical': {
    slug: 'medical',
    title: 'Digital Solutions for Healthcare Professionals',
    seoTitle: 'Web Design & SEO for Clinics and Doctors | Ayoub Erradi',
    seoDescription: 'Grow your medical practice with a professional, trustworthy website and HIPAA-compliant appointment booking systems.',
    heroSubtitle: 'Build patient trust and streamline your practice with secure, professional web design and automated appointment booking.',
    heroImage: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    serviceOverview: 'We create professional online presences for clinics, dentists, and specialists, focusing on patient trust and operational efficiency.',
    painPoints: [
      { title: 'Phone Line Overload', description: 'Receptionists overwhelmed by basic appointment and inquiry calls.' },
      { title: 'Lack of Online Trust', description: 'Patients choosing competitors because their website looks more professional.' },
      { title: 'No Local Visibility', description: 'Failing to appear when patients search for doctors nearby.' }
    ],
    solutions: [
      { title: 'Automated Booking', description: 'Secure 24/7 online appointment scheduling systems.' },
      { title: 'Trust-Building Design', description: 'Clean, authoritative aesthetics highlighting your credentials and patient reviews.' },
      { title: 'Medical SEO', description: 'Targeted local SEO for specific treatments and specialties.' }
    ],
    benefits: [
      'Reduce administrative workload by 40%',
      'Attract new, high-value patients',
      'Improve patient satisfaction with easy booking',
      'Establish undeniable local authority'
    ],
    faqs: [
      { question: 'Are the booking systems secure?', answer: 'Yes, we prioritize data privacy and use secure, compliant scheduling tools.' },
      { question: 'Can you integrate patient intake forms?', answer: 'We can build secure digital forms for patients to fill out before their visit.' }
    ]
  },
  'lawyers': {
    slug: 'lawyers',
    title: 'Web Design & SEO for Law Firms',
    seoTitle: 'Law Firm Web Design & SEO Expert | Ayoub Erradi',
    seoDescription: 'Attract high-value legal clients with a commanding, professional website and targeted SEO for attorneys and law firms.',
    heroSubtitle: 'Command authority and attract premium clients with a sophisticated digital presence tailored for legal professionals.',
    heroImage: 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    serviceOverview: 'We build authoritative digital platforms for law firms, focusing on lead generation, local SEO, and establishing undeniable credibility.',
    painPoints: [
      { title: 'Fierce Local Competition', description: 'Struggling to stand out against established mega-firms in search results.' },
      { title: 'Low Quality Inquiries', description: 'Wasting billable hours filtering out irrelevant case requests.' },
      { title: 'Outdated Brand Image', description: 'A website that doesn\'t reflect the high caliber of your legal expertise.' }
    ],
    solutions: [
      { title: 'Practice Area SEO', description: 'Deep-dive SEO strategies targeting specific, high-value case types.' },
      { title: 'Lead Qualification Forms', description: 'Strategic intake funnels that pre-qualify potential clients.' },
      { title: 'Authoritative Branding', description: 'Premium design that communicates success, trust, and professionalism.' }
    ],
    benefits: [
      'Increase high-value case acquisitions',
      'Dominate niche practice area searches',
      'Save time with automated lead filtering',
      'Build long-term digital equity'
    ],
    faqs: [
      { question: 'Do you write the legal content?', answer: 'We provide SEO structure and guidelines, but we recommend your team reviews all legal copy for compliance.' },
      { question: 'How do we track ROI?', answer: 'We implement advanced tracking to show exactly which cases came from your website.' }
    ]
  }
};
