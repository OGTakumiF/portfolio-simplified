"use client";
import { useState, useEffect } from 'react';

const greetings = [
  "Hello, Welcome",
  "欢迎光临",
  "ようこそ",
  "Ciao, Benvenuto",
  "Willkommen",
  "Добро пожаловать",
  "Selamat Datang",
  "வணக்கம்",
  "नमस्ते",
  "Hola, Bienvenido",
  "Bienvenue",
];

export default function EnhancedPreloader({ onFinished }: { onFinished: () => void }) {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (index === greetings.length) {
      setShow(false);
      setTimeout(onFinished, 500); 
      return;
    }

    const timer = setTimeout(() => setIndex(index + 1), 400);
    return () => clearTimeout(timer);
  }, [index, onFinished]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 z-50 relative h-screen overflow-hidden flex items-center justify-center">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
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

      {/* Center greeting text */}
      <h1 className="relative z-10 text-white text-4xl md:text-6xl font-bold whitespace-nowrap px-4 text-center bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent transition-all duration-300">
        {greetings[index] || ''}
      </h1>

      {/* Progress bar */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64">
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${(index / greetings.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}