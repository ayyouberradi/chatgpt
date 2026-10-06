// src/lib/analytics.ts

// Type definitions for global objects
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: any;
    _fbq: any;
    clarity: any;
  }
}

// @ts-ignore
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
// @ts-ignore
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
// @ts-ignore
const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;

/**
 * Initialize all analytics scripts
 * This is GDPR friendly as it can be called conditionally based on user consent
 */
export const initAnalytics = () => {
  // Initialize Google Analytics 4
  if (GA_MEASUREMENT_ID && !window.gtag) {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true, // GDPR friendly
      send_page_view: false, // We'll handle this manually for SPA
    });
  }

  // Initialize Meta Pixel
  if (META_PIXEL_ID && !window.fbq) {
    // @ts-ignore
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
  }

  // Initialize Microsoft Clarity
  if (CLARITY_PROJECT_ID && !window.clarity) {
    // @ts-ignore
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", CLARITY_PROJECT_ID);
  }
};

/**
 * Track a page view across all platforms
 */
export const trackPageView = (url: string) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
  
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Reusable event tracking for specific actions
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
};

/**
 * Track WhatsApp Button Clicks
 */
export const trackWhatsAppClick = (location: string) => {
  if (window.gtag) {
    window.gtag('event', 'whatsapp_click', {
      event_category: 'engagement',
      event_label: location,
    });
  }
  if (window.fbq) {
    window.fbq('trackCustom', 'WhatsAppClick', { location });
  }
};

/**
 * Track Contact Form Interactions
 */
export const trackContactForm = (action: 'Started' | 'Submitted' | 'Success' | 'Error') => {
  if (window.gtag) {
    window.gtag('event', `form_${action.toLowerCase()}`, {
      event_category: 'form',
      event_label: 'Contact Form',
    });
    
    if (action === 'Success') {
      window.gtag('event', 'generate_lead', {
        currency: 'USD',
        value: 100,
      });
    }
  }
  
  if (window.fbq) {
    if (action === 'Success') {
      window.fbq('track', 'Lead');
    } else {
      window.fbq('trackCustom', `ContactForm${action}`);
    }
  }
};

/**
 * Track CTA Button Clicks
 */
export const trackCTAClick = (ctaName: string) => {
  if (window.gtag) {
    window.gtag('event', 'cta_click', {
      event_category: 'engagement',
      event_label: ctaName,
    });
  }
};

/**
 * Track Content Views
 */
export const trackContentView = (contentType: 'portfolio' | 'case_study', contentId: string) => {
  if (window.gtag) {
    window.gtag('event', 'content_view', {
      content_type: contentType,
      content_id: contentId,
    });
  }
};

/**
 * Track Scroll Depth
 */
export const trackScrollDepth = (depth: number) => {
  if (window.gtag) {
    window.gtag('event', 'scroll_depth', {
      event_category: 'engagement',
      event_label: `${depth}%`,
      value: depth,
    });
  }
};
