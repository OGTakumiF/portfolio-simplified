"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const greetings = [
  "Hello, Welcome",
  "欢迎光临",
  "ようこそ",
  "Ciao, Benvenuto",
  "Willkommen",
  "Добро пожаловать",
  "Selamat Datang",
  "Hola, Bienvenido",
  "Bienvenue",
];

export default function EnhancedPreloader({ onFinished }: { onFinished: () => void }) {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // If we've gone through all greetings, start the exit sequence
    if (index === greetings.length) {
      const closeTimer = setTimeout(() => {
        setShow(false);
        // Wait for the exit animation (0.8s) to finish before unmounting the real component
        setTimeout(onFinished, 800); 
      }, 800); // Hold the last greeting for a moment
      return () => clearTimeout(closeTimer);
    }

    // --- SMOOTH TIMING ---
    // 600ms allows the full 0.4s animation cycle (exit + enter) to complete gracefully.
    // This prevents the "snap shot" cutting off effect.
    const timer = setTimeout(() => setIndex(index + 1), 600);
    return () => clearTimeout(timer);
  }, [index, onFinished]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          // Smooth fade in/out for the entire screen
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 z-50 relative h-screen overflow-hidden flex items-center justify-center"
        >
          {/* Animated background particles - Smoother Drifting Version */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                  scale: Math.random() * 0.5 + 0.5,
                  opacity: Math.random() * 0.5
                }}
                animate={{
                  // Drift slightly and fade gently
                  y: [null, Math.random() * -100], // Drift upwards
                  opacity: [null, 0.6, 0.1], // Gentle pulse
                }}
                transition={{
                  duration: Math.random() * 5 + 5, // Slow duration (5-10s)
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>

          {/* Rotating rings - Slowed down slightly for elegance */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '30s' }}>
            <div className="w-[600px] h-[600px] border border-cyan-500/10 rounded-full" />
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '25s' }}>
            <div className="w-[500px] h-[500px] border border-purple-500/10 rounded-full" />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '20s' }}>
            <div className="w-[400px] h-[400px] border border-emerald-500/10 rounded-full" />
          </div>

          {/* Center greeting text with AnimatePresence for smooth transitions */}
          {/* We use a fixed height container to prevent layout shifts */}
          <div className="relative z-10 h-24 flex items-center justify-center overflow-hidden w-full">
            <AnimatePresence mode="wait">
              {index < greetings.length && (
                <motion.h1
                  key={greetings[index]}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 1.05 }}
                  // Slower, easing transition for a "breathing" effect
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }} 
                  className="text-white text-4xl md:text-6xl font-bold whitespace-nowrap px-4 text-center bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent"
                >
                  {greetings[index]}
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          {/* Smooth Progress bar */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64">
            <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(((index + 1) / greetings.length) * 100, 100)}%` }}
                transition={{ duration: 0.6, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
