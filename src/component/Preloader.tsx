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

    // 1.2s per word for readability
    const timer = setTimeout(() => setIndex(index + 1), 1200);
    return () => clearTimeout(timer);
  }, [index, onFinished]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-none"
    >
      <div className="h-32 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.h1
            key={greetings[index]}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-white text-5xl md:text-8xl font-extrabold tracking-wider uppercase text-center"
            style={{ 
              textShadow: "0 0 40px rgba(255,255,255,0.5)",
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
