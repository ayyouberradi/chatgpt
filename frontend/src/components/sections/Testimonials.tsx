import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useData } from '../../lib/dataContext';

export default function Testimonials() {
  const { testimonials } = useData();
  const activeTestimonials = testimonials.filter((t: any) => t.isActive).sort((a: any, b: any) => a.displayOrder - b.displayOrder);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const { theme } = useTheme();

  const next = () => {
    if (activeTestimonials.length === 0) return;
    setDirection(1);
    setCurrent((prev: number) => (prev + 1) % activeTestimonials.length);
  };

  const prev = () => {
    if (activeTestimonials.length === 0) return;
    setDirection(-1);
    setCurrent((prev: number) => (prev - 1 + activeTestimonials.length) % activeTestimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  const testimonial = activeTestimonials[current];

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: theme === 'light'
            ? 'linear-gradient(to bottom, var(--background), var(--muted), var(--background))'
            : 'linear-gradient(to bottom, var(--background), var(--surface-elevated), var(--background))'
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">What Clients Say</h2>
        </motion.div>

        {/* Testimonial Slider */}
        <div className="relative">
          {/* Quote icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            <Quote className="w-8 h-8 text-muted" />
          </motion.div>

          {/* Testimonial content */}
          <div className="relative h-[300px] flex items-center">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute inset-0 text-center px-8"
              >
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-xl md:text-2xl font-light leading-relaxed mb-8 max-w-2xl mx-auto italic text-primary">
                  "{testimonial.content}"
                </blockquote>

                {testimonial.resultMetric && (
                  <div className="mb-6 inline-flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20">
                    <span className="text-accent font-bold text-lg">{testimonial.resultMetric}</span>
                  </div>
                )}

                {/* Author */}
                <div>
                  <div className="text-lg font-semibold mb-1">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-secondary">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prev}
              className="w-12 h-12 rounded-full flex items-center justify-center text-secondary hover:text-primary transition-colors"
              style={{ border: '1px solid var(--border)' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* Dots */}
            <div className="flex gap-2">
              {activeTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > current ? 1 : -1);
                    setCurrent(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === current ? 'w-6' : ''
                  }`}
                  style={{
                    backgroundColor: index === current
                      ? 'var(--foreground)'
                      : 'var(--border)',
                  }}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={next}
              className="w-12 h-12 rounded-full flex items-center justify-center text-secondary hover:text-primary transition-colors"
              style={{ border: '1px solid var(--border)' }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
