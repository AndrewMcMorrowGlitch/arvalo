"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, TrendingUp, Sparkles, Zap } from "lucide-react";

export default function MoneyFlowAnimation() {
  const [activeAmount, setActiveAmount] = useState(0);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
  }>>([]);

  const amounts = [127, 89, 234, 156, 198, 312, 67, 445, 523, 178];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAmount((prev) => (prev + 1) % amounts.length);

      // Generate particles
      const newParticles = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: 20 + Math.random() * 60,
        y: 40 + Math.random() * 20,
        delay: Math.random() * 0.3,
        duration: 1.5 + Math.random() * 1
      }));
      setParticles(newParticles);

      setTimeout(() => setParticles([]), 2000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="self-stretch border-[rgba(55,50,47,0.12)] flex justify-center items-start border-t">
      <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden min-h-[500px]">
        <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
          {Array.from({ length: 120 }).map((_, i) => (
            <div
              key={i}
              className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 border-l border-r border-[rgba(55,50,47,0.12)] py-20 px-6 relative overflow-hidden min-h-[500px]">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-transparent"></div>

        {/* Background Particles */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                opacity: 0,
                y: particle.y + '%',
                x: particle.x + '%',
                scale: 0,
                rotate: 0
              }}
              animate={{
                opacity: [0, 1, 0.7, 0],
                y: [(particle.y) + '%', (particle.y - 40) + '%'],
                scale: [0, 1.2, 1, 0],
                rotate: [0, 180]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: "easeOut"
              }}
              className="absolute pointer-events-none"
            >
              <DollarSign className="w-6 h-6 text-green-500/60" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Central Display */}
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center gap-12 relative z-10">
          {/* Main Counter Circle */}
          <div className="relative">
            {/* Pulsing rings */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-green-500 rounded-full blur-xl"
            />

            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 relative"
            >
              {/* Orbiting elements */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-${100}px)`
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-full h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Main circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 60px rgba(34, 197, 94, 0.3)',
                    '0 0 80px rgba(34, 197, 94, 0.5)',
                    '0 0 60px rgba(34, 197, 94, 0.3)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-full flex items-center justify-center relative overflow-hidden"
              >
                {/* Animated shine */}
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                       style={{ transform: 'translateX(-100%)' }} />
                </motion.div>

                <div className="relative z-10 flex items-center justify-center flex-col">
                  <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 text-white mb-2" />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeAmount}
                      initial={{ y: 30, opacity: 0, scale: 0.5 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -30, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      className="text-4xl sm:text-5xl md:text-6xl font-bold text-white"
                    >
                      {amounts[activeAmount]}
                    </motion.div>
                  </AnimatePresence>
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-white/80 text-sm mt-2"
                  >
                    just now
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-6 max-w-3xl">
            <div className="flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-green-600" />
              <motion.h3
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#37322F]"
              >
                Recovered in Real-Time
              </motion.h3>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-[#605A57] text-base sm:text-lg md:text-xl leading-relaxed">
              Every moment, money flows back to shoppers worldwide. From major retailers to boutique stores, from tech gadgets to fashion finds—if there's a receipt, we're tracking it.
            </p>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#605A57] mt-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Live tracking</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>AI-powered</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Real results</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden min-h-[500px]">
        <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
          {Array.from({ length: 120 }).map((_, i) => (
            <div
              key={i}
              className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
