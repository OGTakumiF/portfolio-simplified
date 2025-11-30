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
      const closeTimer = setTimeout(() => {
        onFinished();
      }, 2000); 
      return () => clearTimeout(closeTimer);
    }

    const timer = setTimeout(() => setIndex(index + 1), 1200);
    return () => clearTimeout(timer);
  }, [index, onFinished]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-none"
    >
      <div className="relative flex flex-col items-center justify-center gap-8">
        
        {/* --- YOUR CHARACTER IMAGE --- */}
        {/* Make sure to put your file in the public folder and name it 'avatar.png' (or .jpg/.avif) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -50, transition: { duration: 0.8 } }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-48 h-48 md:w-64 md:h-64"
        >
          {/* Glowing Aura behind image */}
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          
          <img 
            src="/avatar.png" // <--- CHANGE THIS TO YOUR IMAGE FILENAME
            alt="Character" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* --- GREETING TEXT --- */}
        <div className="h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={greetings[index]}
              initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-white text-4xl md:text-7xl font-extrabold tracking-wider uppercase text-center"
              style={{ 
                textShadow: "0 0 30px rgba(255,255,255,0.4)",
                fontFamily: "system-ui, -apple-system, sans-serif" 
              }}
            >
              {greetings[index]}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
