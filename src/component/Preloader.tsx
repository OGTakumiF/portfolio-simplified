"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const greetings = [
  "Hello",
  "Welcome",
  "ようこそ", // Japanese
  "Willkommen", // German
  "Bienvenue", // French
  "Selamat Datang", // Malay
  "Hola", // Spanish
  "Sean Ogta Goh", // Final Name Reveal
];

export default function EnhancedPreloader({ onFinished }: { onFinished: () => void }) {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // If we've gone through all greetings, start the exit sequence
    if (index === greetings.length - 1) {
      // Hold the final name for a bit longer (1.5s) before finishing
      const closeTimer = setTimeout(() => {
        setShow(false);
        setTimeout(onFinished, 800); 
      }, 1500); 
      return () => clearTimeout(closeTimer);
    }

    // Timing for regular greetings (fast and snappy)
    const timer = setTimeout(() => setIndex(index + 1), 800);
    return () => clearTimeout(timer);
  }, [index, onFinished]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
        >
          {/* Background: Subtle Stars */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                  opacity: Math.random() * 0.5 + 0.3,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Rotating Rings (Subtle) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '30s' }}>
            <div className="w-[500px] h-[500px] border border-white/5 rounded-full" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '20s' }}>
            <div className="w-[300px] h-[300px] border border-white/10 rounded-full" />
          </div>

          {/* Center Text */}
          <div className="relative z-[101] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={greetings[index]}
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-white text-5xl md:text-7xl font-bold tracking-widest text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
              >
                {greetings[index]}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Loading Bar at Bottom */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white box-shadow-[0_0_10px_white]"
              initial={{ width: "0%" }}
              animate={{ width: `${((index + 1) / greetings.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
