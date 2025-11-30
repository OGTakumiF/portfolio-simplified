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
      // Hold the final name for 1.5 seconds, then trigger the exit
      const closeTimer = setTimeout(() => {
        onFinished();
      }, 1500); 
      return () => clearTimeout(closeTimer);
    }

    // Text timing
    const timer = setTimeout(() => setIndex(index + 1), 800);
    return () => clearTimeout(timer);
  }, [index, onFinished]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }} // Slow fade out to reveal space
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-none"
    >
      <AnimatePresence mode="wait">
        <motion.h1
          key={greetings[index]}
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.2, filter: 'blur(5px)' }} // Text flies "at" the camera on exit
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-white text-4xl md:text-7xl font-thin tracking-[0.3em] uppercase text-center"
          style={{ textShadow: "0 0 30px rgba(255,255,255,0.3)" }}
        >
          {greetings[index]}
        </motion.h1>
      </AnimatePresence>
    </motion.div>
  );
}
