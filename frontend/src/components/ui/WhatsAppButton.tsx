import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { trackWhatsAppClick } from '../../lib/analytics';

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const whatsappUrl = '/book?channel=whatsapp&source=floating_button';

  const handleClick = () => {
    trackWhatsAppClick('floating_button');
  };

  return (
    <motion.a
      href={whatsappUrl}
      rel="noopener noreferrer"
      onClick={handleClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-[#25D366] text-white rounded-full shadow-2xl shadow-green-500/20 group overflow-hidden"
    >
      <motion.div
        className="w-14 h-14 flex items-center justify-center relative"
        animate={{ backgroundColor: isHovered ? '#22c55e' : '#25D366' }}
      >
        <AnimatePresence mode="wait">
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-medium pr-4 whitespace-nowrap"
            >
              Chat on WhatsApp
            </motion.span>
          )}
        </AnimatePresence>
        <MessageCircle className="w-6 h-6" />
      </motion.div>
    </motion.a>
  );
}
