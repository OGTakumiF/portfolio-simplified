"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const greetings = [
  "Hello",
  "Welcome",
  "ようこそ",
  "Willkommen",
  "Bienvenue",
  "Selamat Datang",
  "Hola",
  "Sean Ogta Goh",
];

export default function CinematicPreloader({ onFinished }: { onFinished: () => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index === greetings.length - 1) {
      // Hold the final name for 2 seconds, then finish
      const closeTimer = setTimeout(() => {
        onFinished();
      }, 2000); 
      return () => clearTimeout(closeTimer);
    }

    // 800ms per greeting -> Approx 6.4s total + final hold = ~8s total
    const timer = setTimeout(() => setIndex(index + 1), 800);
    return () => clearTimeout(timer);
  }, [index, onFinished]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.h1
          key={greetings[index]}
          initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-white text-4xl md:text-7xl font-thin tracking-[0.3em] uppercase text-center drop-shadow-2xl"
          style={{ textShadow: "0 0 30px rgba(255,255,255,0.3)" }}
        >
          {greetings[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}
