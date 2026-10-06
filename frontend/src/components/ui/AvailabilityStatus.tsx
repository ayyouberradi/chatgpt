import { motion } from 'framer-motion';
import { Clock, Calendar, Users } from 'lucide-react';
import { useData } from '../../lib/dataContext';

type StatusType = 'available' | 'limited' | 'booking-next-month';

const statusConfig: Record<StatusType, { color: string; label: string; sublabel: string; emoji: string }> = {
  available: {
    color: '#22c55e',
    label: 'Currently Accepting New Projects',
    sublabel: 'Available for immediate start',
    emoji: '🟢',
  },
  limited: {
    color: '#eab308',
    label: 'Limited Availability',
    sublabel: 'Booking 2-3 weeks ahead',
    emoji: '🟡',
  },
  'booking-next-month': {
    color: '#ef4444',
    label: 'Booking For Next Month',
    sublabel: 'Current projects in progress',
    emoji: '🔴',
  },
};

interface AvailabilityStatusProps {
  compact?: boolean;
}

export default function AvailabilityStatus({ compact = false }: AvailabilityStatusProps) {
  const { availability } = useData();
  const currentStatus = statusConfig[availability.status];

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full"
        style={{
          backgroundColor: 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        <motion.div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: currentStatus.color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <span className="text-sm font-medium">{currentStatus.label}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl"
      style={{
        backgroundColor: 'var(--muted)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-start gap-4">
        <motion.div
          className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
          style={{ backgroundColor: currentStatus.color }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.6, 1],
            boxShadow: [
              `0 0 0 0 ${currentStatus.color}40`,
              `0 0 0 8px ${currentStatus.color}00`,
              `0 0 0 0 ${currentStatus.color}40`,
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-muted" />
            <span className="font-semibold">{currentStatus.label}</span>
          </div>
          <p className="text-sm text-secondary mb-4">{currentStatus.sublabel}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last updated: {new Date(availability.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {availability.showWaitingList && availability.status !== 'available' && (
            <motion.a
              href="#waiting-list"
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <Users className="w-4 h-4" />
              Join Waiting List
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
