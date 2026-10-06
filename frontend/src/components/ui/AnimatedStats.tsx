import { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface StatProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  delay?: number;
}

function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(0);

  const spring = useSpring(0, { damping: 30, stiffness: 100 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  useEffect(() => {
    return display.on('change', (latest) => {
      setDisplayValue(latest);
    });
  }, [display]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{displayValue}{suffix}
    </span>
  );
}

function Stat({ value, suffix = '', prefix = '', label, delay = 0 }: StatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <motion.div
        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3"
        style={{ color: 'var(--foreground)' }}
        initial={{ scale: 0.5 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: delay + 0.2, type: 'spring', stiffness: 200 }}
      >
        <AnimatedNumber value={value} suffix={suffix} prefix={prefix} />
      </motion.div>
      <p className="text-sm text-muted">{label}</p>
    </motion.div>
  );
}

interface AnimatedStatsProps {
  stats?: Array<{ value: number; suffix?: string; prefix?: string; label: string }>;
}

const defaultStats = [
  { value: 20, suffix: '+', label: 'Projects Delivered' },
  { value: 10, suffix: '+', label: 'Years Creative Experience' },
  { value: 4, suffix: '+', label: 'Core Industries Served' },
  { value: 100, suffix: '%', label: 'Custom Solutions' },
];

export default function AnimatedStats({ stats = defaultStats }: AnimatedStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
      {stats.map((stat, index) => (
        <Stat
          key={stat.label}
          value={stat.value}
          suffix={stat.suffix}
          prefix={stat.prefix}
          label={stat.label}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}
