import { useEffect } from 'react';
import { trackScrollDepth } from '../lib/analytics';

export default function ScrollTracker() {
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

      // We don't want to track every single percentage, let's track milestones
      const milestones = [25, 50, 75, 90, 100];
      const sessionTracked = JSON.parse(sessionStorage.getItem('scroll_tracked') || '[]');

      for (const milestone of milestones) {
        if (scrollPercentage >= milestone && !sessionTracked.includes(milestone)) {
          trackScrollDepth(milestone);
          sessionTracked.push(milestone);
          sessionStorage.setItem('scroll_tracked', JSON.stringify(sessionTracked));
        }
      }
    };

    // Reset scroll tracking on mount (new page view)
    sessionStorage.removeItem('scroll_tracked');

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}