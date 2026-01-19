import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { vibrate, HAPTIC_PATTERNS } from '@/lib/haptics';

interface MinerProps {
  color?: string;
  delay?: number;
  duration?: number;
  variant?: 'base' | 'farcaster' | 'xminer' | 'satoshi' | 'neon' | 'cyber' | 'quantum' | 'mech' | 'astro' | 'dark_matter' | 'cyberpunk' | 'plasma' | 'satoshi_comet' | 'satoshi_rocket';
  styleIndex?: number;
}

export const Miner = ({ color = "#00F0FF", delay = 0, duration = 0.8, variant = 'base', styleIndex = 0 }: MinerProps) => {
  useEffect(() => {
    const interval = setInterval(() => {
      vibrate(HAPTIC_PATTERNS.DRILL_HIT);
    }, duration * 1000);
    return () => clearInterval(interval);
  }, [duration]);

  const variantIndex = styleIndex % 3;

  const renderBody = () => {
    switch (variant) {
      case 'satoshi_rocket':
        return (
          <image href="/assets/character-rocket.svg" x="0" y="0" width="32" height="32" />
        );
      case 'farcaster':
        return (
          <>
             <rect x="10" y="10" width="12" height="14" rx="6" stroke={color} strokeWidth="2" fill="#0B1026" />
             <circle cx="16" cy="6" r="4" fill={color} />
             <path d="M12 24L11 30" stroke={color} strokeWidth="2" strokeLinecap="round" />
             <path d="M20 24L21 30" stroke={color} strokeWidth="2" strokeLinecap="round" />
             {variantIndex === 0 && <path d="M14 13H18" stroke="white" strokeWidth="2" />}
             {variantIndex === 1 && <path d="M13 12H19" stroke="white" strokeWidth="2" />}
             {variantIndex === 2 && <path d="M14 13H18" stroke="white" strokeWidth="1" />}
             <motion.circle cx="26" cy="6" r="3" fill={color} animate={{ y: [0, -2, 0], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.4, repeat: Infinity }} />
          </>
        );
      case 'xminer':
        return (
          <>
             <path d="M8 10L10 8H22L24 10V22L22 24H10L8 22V10Z" stroke={color} strokeWidth="2" fill="#111" />
             <rect x="13" y="3" width="6" height="6" stroke={color} fill="#333" />
             <path d="M10 24L8 31" stroke={color} strokeWidth="3" />
             <path d="M22 24L24 31" stroke={color} strokeWidth="3" />
             {variantIndex === 0 && <rect x="14" y="5" width="4" height="2" fill="red" />}
             {variantIndex === 1 && <rect x="13" y="5" width="6" height="2" fill="white" />}
             {variantIndex === 2 && <rect x="14" y="5" width="4" height="2" fill={color} />}
             <motion.path d="M12 6L20 14M20 6L12 14" stroke={color} strokeWidth="2" animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 0.9, repeat: Infinity }} />
          </>
        );
      case 'satoshi':
        return (
          <>
             <rect x="10" y="10" width="12" height="14" rx="1" stroke={color} strokeWidth="2" fill="#0B1026" />
             <path d="M16 2L13 6H19L16 2Z" fill={color} />
             <circle cx="16" cy="7" r="3" fill={color} />
             <path d="M12 24L9 30" stroke={color} strokeWidth="2" />
             <path d="M20 24L23 30" stroke={color} strokeWidth="2" />
             {variantIndex === 0 && <path d="M13 14L19 14" stroke="#00F0FF" strokeWidth="2" />}
             {variantIndex === 1 && <path d="M13 14L19 14" stroke="#FACC15" strokeWidth="2" />}
             {variantIndex === 2 && <path d="M13 14L19 14" stroke="#F97316" strokeWidth="2" />}
             {variantIndex === 0 && <motion.text x="16" y="19" textAnchor="middle" fontSize="6" fill="#FACC15" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>₿</motion.text>}
             {variantIndex === 1 && <motion.text x="16" y="19" textAnchor="middle" fontSize="6" fill="#FACC15" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>BTC</motion.text>}
             {variantIndex === 2 && <motion.text x="16" y="19" textAnchor="middle" fontSize="6" fill="#FACC15" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>SAT</motion.text>}
          </>
        );
      case 'neon':
        return (
          <>
            {/* Neon Driller - Glowing outline */}
            <rect x="10" y="10" width="12" height="14" rx="2" stroke={color} strokeWidth="3" fill="transparent" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            <circle cx="16" cy="6" r="3" fill={color} className="animate-pulse" />
            <path d="M12 24L10 30" stroke={color} strokeWidth="2" />
            <path d="M20 24L22 30" stroke={color} strokeWidth="2" />
            <motion.path d="M10 12H22" stroke="white" strokeWidth="1" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} />
          </>
        );
      case 'cyber':
        return (
          <>
            {/* Cyber Rig - Digital blocks */}
            <rect x="9" y="9" width="14" height="16" stroke={color} strokeWidth="1" fill="#000" />
            <rect x="11" y="11" width="4" height="4" fill={color} />
            <rect x="17" y="11" width="4" height="4" fill={color} />
            <rect x="11" y="17" width="10" height="4" fill={color} opacity="0.5" />
            <path d="M10 25L8 31" stroke={color} strokeWidth="2" />
            <path d="M22 25L24 31" stroke={color} strokeWidth="2" />
            <motion.rect x="8" y="4" width="16" height="2" fill={color} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
          </>
        );
      case 'quantum':
        return (
          <>
            {/* Quantum Extractor - Floating particles */}
            <motion.circle cx="16" cy="16" r="8" stroke={color} strokeWidth="1" fill="none" animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
            <circle cx="16" cy="16" r="4" fill={color} />
            <motion.circle cx="16" cy="6" r="2" fill="white" animate={{ y: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <path d="M12 24L11 30" stroke={color} strokeWidth="2" />
            <path d="M20 24L21 30" stroke={color} strokeWidth="2" />
          </>
        );
      case 'mech':
        return (
          <>
            {/* Mech Overlord - Heavy armor */}
            <path d="M8 8H24V24H8V8Z" fill="#333" stroke={color} strokeWidth="2" />
            <rect x="6" y="6" width="4" height="10" fill={color} />
            <rect x="22" y="6" width="4" height="10" fill={color} />
            <circle cx="16" cy="16" r="3" fill="red" className="animate-pulse" />
            <path d="M10 24L8 31" stroke="gray" strokeWidth="4" />
            <path d="M22 24L24 31" stroke="gray" strokeWidth="4" />
          </>
        );
      case 'astro':
        return (
          <>
            {/* Astro Forge - Space helmet */}
            <circle cx="16" cy="14" r="10" stroke={color} strokeWidth="2" fill="#111" />
            <path d="M10 14Q16 20 22 14" stroke={color} strokeWidth="2" fill="none" />
            <circle cx="16" cy="8" r="2" fill="white" />
            <path d="M12 24L10 30" stroke="white" strokeWidth="2" />
            <path d="M20 24L22 30" stroke="white" strokeWidth="2" />
          </>
        );
      case 'dark_matter':
        return (
          <>
            {/* Dark Matter - Shadowy essence */}
            <motion.circle cx="16" cy="16" r="10" fill="black" stroke="purple" strokeWidth="2" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }} />
            <circle cx="16" cy="16" r="6" fill="#4B0082" />
            <motion.path d="M16 6L16 26" stroke="purple" strokeWidth="1" animate={{ rotate: 360 }} style={{ originX: "16px", originY: "16px" }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
          </>
        );
      case 'cyberpunk':
        return (
          <>
            {/* Cyberpunk Slicer - Glitchy */}
            <rect x="10" y="10" width="12" height="14" fill="#0B1026" stroke={color} strokeWidth="2" />
            <path d="M10 10L22 24" stroke={color} strokeWidth="1" />
            <path d="M22 10L10 24" stroke={color} strokeWidth="1" />
            <rect x="14" y="8" width="4" height="2" fill="#FF00FF" />
            <path d="M12 24L10 30" stroke={color} strokeWidth="2" />
            <path d="M20 24L22 30" stroke={color} strokeWidth="2" />
          </>
        );
      case 'plasma':
        return (
          <>
            {/* Plasma Core - Energy radiating */}
            <circle cx="16" cy="16" r="8" fill="none" stroke={color} strokeWidth="2" />
            <motion.circle cx="16" cy="16" r="4" fill={color} animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 0.5, repeat: Infinity }} />
            <path d="M12 24L10 30" stroke={color} strokeWidth="2" />
            <path d="M20 24L22 30" stroke={color} strokeWidth="2" />
          </>
        );
      case 'satoshi_comet':
        return (
          <>
            {/* Satoshi Comet - Golden trail */}
            <circle cx="16" cy="14" r="8" fill="#FFD700" />
            <text x="16" y="18" textAnchor="middle" fontSize="10" fontWeight="bold" fill="black">₿</text>
            <motion.path d="M8 20L16 32L24 20" fill="orange" opacity="0.6" animate={{ y: [0, 2, 0] }} transition={{ duration: 0.2, repeat: Infinity }} />
          </>
        );
      default:
        return (
          <>
            <rect x="10" y="10" width="12" height="14" rx={variantIndex === 0 ? 2 : variantIndex === 1 ? 4 : 1} stroke={color} strokeWidth="2" fill="#0B1026" />
            <circle cx="16" cy="6" r={variantIndex === 1 ? 4 : 3} fill={color} />
            <path d="M12 24L10 30" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M20 24L22 30" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {variantIndex === 0 && <path d="M13 14H19" stroke={color} strokeWidth="1" />}
            {variantIndex === 1 && <path d="M13 13H19" stroke={color} strokeWidth="2" />}
            {variantIndex === 2 && <path d="M13 15H19" stroke={color} strokeWidth="1" />}
          </>
        );
    }
  };

  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      {/* Miner Body - Static */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
        {renderBody()}
      </svg>
      
      {/* Animated Arm with Pickaxe */}
      <motion.div
        className="absolute top-[12px] left-[16px]"
        style={{ originX: 0.1, originY: 0.1 }}
        animate={{ rotate: [0, -45, 0] }} 
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay,
          repeatType: "mirror"
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          {/* Arm Segment */}
          <line x1="2" y1="2" x2="10" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
          {/* Pickaxe Handle */}
          <line x1="6" y1="6" x2="16" y2="16" stroke="white" strokeWidth="1" />
          {/* Pickaxe Head */}
          <path d="M12 20C12 20 18 14 20 12" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 20C12 20 8 16 6 14" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  );
};
