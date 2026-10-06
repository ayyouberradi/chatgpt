import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MessageCircle, ArrowRight } from 'lucide-react';
import { trackWhatsAppClick, trackCTAClick } from '../../lib/analytics';

export default function BookingSection() {
  const navigate = useNavigate();
  const handleWhatsApp = () => {
    trackWhatsAppClick('booking_section');
    navigate('/book?channel=whatsapp&source=booking_section');
  };

  const handleBooking = () => {
    trackCTAClick('book_discovery_call_booking_section');
    navigate('/book?source=booking_section');
  };

  return (
    <section className="py-24 bg-[var(--surface)] border-y border-[var(--border)] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto bg-[var(--surface-elevated)] rounded-3xl p-8 md:p-12 border border-[var(--border)] shadow-xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-6">
              <Calendar size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Book a Free 15-Minute Discovery Call
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Ready to transform your digital presence? Let's discuss your goals, current challenges, and see if we're a good fit to work together. No pressure, no hard sell.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleBooking}
                className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                Book a Call <ArrowRight size={20} />
              </button>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <span className="text-secondary font-medium hidden sm:block">OR</span>
                <button 
                  onClick={handleWhatsApp}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-all duration-300"
                  style={{ backgroundColor: '#25D366', color: 'white' }}
                >
                  <MessageCircle size={20} />
                  Contact on WhatsApp
                </button>
              </div>
            </div>

            <div className="mt-8 text-sm text-secondary flex items-center justify-center gap-6">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Time confirmed with you on WhatsApp
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}