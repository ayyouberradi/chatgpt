import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './hooks/useTheme';
import { DataProvider } from './lib/dataContext';
import { AuthProvider } from './lib/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/ui/WhatsAppButton';
import ReadingProgressBar from './components/ui/ReadingProgressBar';
import Analytics from './components/Analytics';

// Helper to retry dynamic imports when chunks fail to load (common after deployments)
const lazyRetry = function(componentImport: () => Promise<any>) {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error: any) {
      // If it's a dynamic import error (chunk not found), reload the page to get the new chunks
      if (error?.message?.includes('Failed to fetch dynamically imported module')) {
        window.location.reload();
      }
      throw error;
    }
  });
};

// Lazy load pages for performance
const HomePage = lazyRetry(() => import('./pages/HomePage'));
const AboutPage = lazyRetry(() => import('./pages/AboutPage'));
const ServicesPage = lazyRetry(() => import('./pages/ServicesPage'));
const PortfolioPage = lazyRetry(() => import('./pages/PortfolioPage'));
const ProjectDetailsPage = lazyRetry(() => import('./pages/ProjectDetailsPage'));
const CaseStudiesPage = lazyRetry(() => import('./pages/CaseStudiesPage'));
const BookingPage = lazyRetry(() => import('./pages/BookingPage'));
const ContactPage = lazyRetry(() => import('./pages/ContactPage'));
const IndustryPage = lazyRetry(() => import('./pages/IndustryPage'));
const CaseStudyPage = lazyRetry(() => import('./pages/CaseStudyPage'));

// Lazy load admin pages
const AdminLogin = lazyRetry(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazyRetry(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazyRetry(() => import('./pages/admin/Dashboard'));
const ServicesAdmin = lazyRetry(() => import('./pages/admin/ServicesAdmin'));
const ProjectsAdmin = lazyRetry(() => import('./pages/admin/ProjectsAdmin'));
const TestimonialsAdmin = lazyRetry(() => import('./pages/admin/TestimonialsAdmin'));
const RetainersAdmin = lazyRetry(() => import('./pages/admin/RetainersAdmin'));
const PackagesAdmin = lazyRetry(() => import('./pages/admin/PackagesAdmin'));
const SkillsAdmin = lazyRetry(() => import('./pages/admin/SkillsAdmin'));
const ClientsAdmin = lazyRetry(() => import('./pages/admin/ClientsAdmin'));
const CaseStudiesAdmin = lazyRetry(() => import('./pages/admin/CaseStudiesAdmin'));
const AboutAdmin = lazyRetry(() => import('./pages/admin/AboutAdmin'));
const SettingsAdmin = lazyRetry(() => import('./pages/admin/SettingsAdmin'));
const MediaAdmin = lazyRetry(() => import('./pages/admin/MediaAdmin'));
import { ProtectedRoute } from './components/admin/ProtectedRoute';

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
    <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Page transition wrapper with blur effect
const pageVariants = {
  initial: {
    opacity: 0,
    filter: 'blur(10px)',
    y: 10,
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
  },
  exit: {
    opacity: 0,
    filter: 'blur(10px)',
    y: -10,
  },
};

const pageTransition = {
  type: 'tween' as const,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  duration: 0.35,
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

// Layout component that uses useLocation
const Layout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="services" element={<ServicesAdmin />} />
            <Route path="projects" element={<ProjectsAdmin />} />
            <Route path="testimonials" element={<TestimonialsAdmin />} />
            <Route path="retainers" element={<RetainersAdmin />} />
            <Route path="packages" element={<PackagesAdmin />} />
            <Route path="skills" element={<SkillsAdmin />} />
            <Route path="clients" element={<ClientsAdmin />} />
            <Route path="case-studies" element={<CaseStudiesAdmin />} />
            <Route path="about" element={<AboutAdmin />} />
            <Route path="media" element={<MediaAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
          </Route>
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <ReadingProgressBar />
      <Header />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
            <Route path="/services" element={<PageWrapper><ServicesPage /></PageWrapper>} />
            <Route path="/portfolio" element={<PageWrapper><PortfolioPage /></PageWrapper>} />
            <Route path="/portfolio/:id" element={<PageWrapper><ProjectDetailsPage /></PageWrapper>} />
            <Route path="/case-studies" element={<PageWrapper><CaseStudiesPage /></PageWrapper>} />
            <Route path="/case-studies/:slug" element={<PageWrapper><CaseStudyPage /></PageWrapper>} />
            <Route path="/book" element={<PageWrapper><BookingPage /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
            <Route path="/industries/:slug" element={<PageWrapper><IndustryPage /></PageWrapper>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <Footer />
      {location.pathname !== '/book' && <WhatsAppButton />}
    </div>
  );
};

import ScrollTracker from './components/ScrollTracker';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <Analytics />
            <ScrollTracker />
            <Layout />
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
