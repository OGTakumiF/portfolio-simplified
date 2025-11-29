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
    if (index === greetings.length) {
      // Add a small delay after the last greeting before closing
      const closeTimer = setTimeout(() => {
        setShow(false);
        setTimeout(onFinished, 500); 
      }, 500);
      return () => clearTimeout(closeTimer);
    }

    // Duration for each greeting
    const timer = setTimeout(() => setIndex(index + 1), 250);
    return () => clearTimeout(timer);
  }, [index, onFinished]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 z-50 relative h-screen overflow-hidden flex items-center justify-center"
        >
          {/* Animated background particles - Smoother Version */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                // Replaced 'animate-pulse' with a smooth custom animation
                animate={{ 
                  opacity: [0.1, 0.7, 0.1], 
                  scale: [1, 1.2, 1] 
                }}
                transition={{ 
                  duration: 3 + Math.random() * 4, // Much slower duration (3-7s)
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: Math.random() * 2 
                }}
              />
            ))}
          </div>

          {/* Rotating rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin">
            <div className="w-[600px] h-[600px] border-2 border-cyan-500/20 rounded-full" style={{ animationDuration: '20s' }} />
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDirection: 'reverse' }}>
            <div className="w-[500px] h-[500px] border-2 border-purple-500/20 rounded-full" style={{ animationDuration: '15s' }} />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin">
            <div className="w-[400px] h-[400px] border-2 border-emerald-500/20 rounded-full" style={{ animationDuration: '10s' }} />
          </div>

          {/* Center greeting text with AnimatePresence for smooth transitions */}
          <div className="relative z-10 h-20 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {index < greetings.length && (
                <motion.h1
                  key={greetings[index]}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-white text-4xl md:text-6xl font-bold whitespace-nowrap px-4 text-center bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent"
                >
                  {greetings[index]}
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min((index / (greetings.length - 1)) * 100, 100)}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
