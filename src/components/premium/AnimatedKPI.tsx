import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { AnimatedKPIProps } from '@/types/premium.types';

const AnimatedKPI: React.FC<AnimatedKPIProps> = ({ 
  value, 
  label, 
  suffix = '',
  className = ''
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;
    
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [isInView, value]);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={`text-center ${className}`}
    >
      <div className="text-5xl font-bold text-[#B6FF00] mb-2">
        {count}{suffix}
      </div>
      <div className="text-white/70 text-sm uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
};

export default AnimatedKPI;
