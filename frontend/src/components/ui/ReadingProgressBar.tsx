import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function ReadingProgressBar() {
  const [isVisible, setIsVisible] = useState(false);
  const progress = useMotionValue(0);
  const progressSpring = useSpring(progress, { damping: 30, stiffness: 200 });
  const location = useLocation();

  // Pages where reading progress should be shown
  const progressPages = ['/portfolio/', '/about', '/services'];
  const showProgress = progressPages.some((page) => location.pathname.includes(page.split('/')[1]) || location.pathname === page);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progress.set(Math.min(100, Math.max(0, scrollProgress)));

      // Show progress bar after scrolling past the hero
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [progress]);

  if (!showProgress) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="h-full"
        style={{
          width: progressSpring,
          backgroundColor: 'var(--accent)',
        }}
      />
    </motion.div>
  );
}
