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
      // Hold the final name for 2 seconds
      const closeTimer = setTimeout(() => {
        onFinished();
      }, 2000); 
      return () => clearTimeout(closeTimer);
    }

    // 1.2s per word
    const timer = setTimeout(() => setIndex(index + 1), 1200);
    return () => clearTimeout(timer);
  }, [index, onFinished]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-none"
    >
      <div className="flex items-center justify-center w-full px-4">
        <AnimatePresence mode="wait">
          <motion.h1
            key={greetings[index]}
            // Removed blur for crisp text
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-white text-5xl md:text-8xl font-extrabold tracking-widest uppercase text-center"
            style={{ 
              fontFamily: "system-ui, -apple-system, sans-serif" 
            }}
          >
            {greetings[index]}
          </motion.h1>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
