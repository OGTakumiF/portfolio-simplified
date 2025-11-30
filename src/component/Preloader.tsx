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
      // Hold the final name longer (2 seconds)
      const closeTimer = setTimeout(() => {
        onFinished();
      }, 2000); 
      return () => clearTimeout(closeTimer);
    }

    // SLOWER TIMING: 1200ms per word for better readability
    const timer = setTimeout(() => setIndex(index + 1), 1200);
    return () => clearTimeout(timer);
  }, [index, onFinished]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-none"
    >
      <AnimatePresence mode="wait">
        <motion.h1
          key={greetings[index]}
          initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          // Changed font to 'font-sans font-extrabold' for better readability
          className="text-white text-5xl md:text-8xl font-extrabold tracking-wider uppercase text-center"
          style={{ 
            textShadow: "0 0 40px rgba(255,255,255,0.5)",
            fontFamily: "system-ui, -apple-system, sans-serif" 
          }}
        >
          {greetings[index]}
        </motion.h1>
      </AnimatePresence>
    </motion.div>
  );
}
