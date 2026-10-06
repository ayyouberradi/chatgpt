import { motion } from 'framer-motion';
import Hero from '../components/sections/Hero';
import ClientsMarquee from '../components/sections/ClientsMarquee';
import InteractiveServices from '../components/sections/InteractiveServices';
import IndustriesGrid from '../components/sections/IndustriesGrid';
import WhyWorkWithMe from '../components/sections/WhyWorkWithMe';
import FeaturedWork from '../components/sections/FeaturedWork';
import WebsiteEmergency from '../components/sections/WebsiteEmergency';
import Testimonials from '../components/sections/Testimonials';
import BookingSection from '../components/sections/BookingSection';
import FinalCTA from '../components/sections/FinalCTA';
import HowCanIHelp from '../components/sections/HowCanIHelp';
import AnimatedStats from '../components/ui/AnimatedStats';
import { SEOHead } from '../components/seo/SEOHead';
import { useData } from '../lib/dataContext';

export default function HomePage() {
  const { stats } = useData();
  const activeStats = stats.filter((s: any) => s.isActive).sort((a: any, b: any) => a.displayOrder - b.displayOrder);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SEOHead />

      <Hero />
      <ClientsMarquee />

      {/* Stats Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatedStats stats={activeStats} />
        </div>
      </section>

      <HowCanIHelp />
      <InteractiveServices />
      <IndustriesGrid />
      <WhyWorkWithMe />
      <FeaturedWork />
      <WebsiteEmergency />
      <Testimonials />
      <BookingSection />
      <FinalCTA />
    </motion.main>
  );
}
