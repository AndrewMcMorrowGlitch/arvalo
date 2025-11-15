"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, DollarSign, Bell, Sparkles } from "lucide-react";

export default function PriceDropFeature() {
  const [priceStage, setPriceStage] = useState(0);

  const stages = [
    { price: 299, label: "Your Purchase Price", color: "text-gray-700" },
    { price: 249, label: "Price Dropped!", color: "text-orange-600" },
    { price: 199, label: "New Low!", color: "text-green-600" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceStage((prev) => (prev + 1) % stages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentStage = stages[priceStage];
  const savings = 299 - currentStage.price;

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="w-[340px]">
        {/* Product Card */}
        <div className="bg-white/90 backdrop-blur-xl border-2 border-white/80 rounded-3xl p-6 shadow-2xl mb-4 overflow-hidden relative">
          {/* Animated background shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          <div className="relative">
            <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-4 flex items-center justify-center overflow-hidden shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=80"
                alt="AirPods Pro"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black text-gray-900">Apple AirPods Pro (2nd Gen)</h3>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-orange-500" />
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={priceStage}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mb-3"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-baseline">
                    <DollarSign className={`w-8 h-8 ${currentStage.color}`} />
                    <span className={`text-5xl font-black ${currentStage.color}`}>
                      {currentStage.price}
                    </span>
                  </div>
                  {savings > 0 && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border-2 border-green-300 shadow-md"
                    >
                      <TrendingDown className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-black text-green-700">-${savings}</span>
                    </motion.div>
                  )}
                </div>
                <p className={`text-sm font-bold ${currentStage.color}`}>{currentStage.label}</p>
              </motion.div>
            </AnimatePresence>

            {priceStage === 0 && (
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 font-medium">
                Purchased 5 days ago from Amazon
              </div>
            )}
          </div>
        </div>

        {/* Alert */}
        {savings > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="bg-gradient-to-r from-green-500 via-emerald-600 to-green-600 text-white rounded-3xl p-5 shadow-2xl flex items-center gap-4 border-2 border-white/30"
          >
            <motion.div
              className="w-12 h-12 bg-white/25 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bell className="w-6 h-6" />
            </motion.div>
            <div className="flex-1">
              <p className="text-base font-black mb-1">💰 Refund Available!</p>
              <p className="text-xs opacity-95 font-semibold">Claim ${savings} price difference now</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
