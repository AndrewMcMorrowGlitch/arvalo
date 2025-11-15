"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, TrendingUp, Calendar, Sparkles, ArrowRight, Clock } from "lucide-react";

interface Product {
  name: string;
  category: string;
  icon: string;
  frequency: string;
  nextBuy: string;
  savings: string;
  purchaseHistory: number[];
  color: string;
  bgColor: string;
}

export default function PlanOrderFeature() {
  const [activeProduct, setActiveProduct] = useState(0);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const products: Product[] = [
    {
      name: "Organic Milk",
      category: "Groceries",
      icon: "🥛",
      frequency: "Every 7 days",
      nextBuy: "In 2 days",
      savings: "$12/month",
      purchaseHistory: [0, 7, 14, 21, 28, 35],
      color: "from-blue-400 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    {
      name: "Paper Towels",
      category: "Toiletries",
      icon: "🧻",
      frequency: "Every 21 days",
      nextBuy: "In 5 days",
      savings: "$8/month",
      purchaseHistory: [0, 21, 42, 63],
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-50"
    },
    {
      name: "Coffee Beans",
      category: "Groceries",
      icon: "☕",
      frequency: "Every 14 days",
      nextBuy: "Today",
      savings: "$15/month",
      purchaseHistory: [0, 14, 28, 42, 56],
      color: "from-amber-400 to-orange-500",
      bgColor: "bg-amber-50"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveProduct((prev) => {
        const next = (prev + 1) % products.length;
        setShowRecommendation(false);
        setTimeout(() => setShowRecommendation(true), 800);
        return next;
      });
    }, 4000);

    setTimeout(() => setShowRecommendation(true), 800);
    return () => clearInterval(interval);
  }, []);

  const currentProduct = products[activeProduct];

  return (
    <div className="w-full h-full flex items-center justify-center p-6 overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60"></div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-40"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <div className="relative w-full max-w-[380px] space-y-4">
        {/* Product Card with Purchase Pattern */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProduct}
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 backdrop-blur-xl border-2 border-white/60 rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentProduct.color} flex items-center justify-center text-3xl shadow-lg`}
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {currentProduct.icon}
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{currentProduct.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{currentProduct.category}</p>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`px-3 py-1.5 rounded-full ${currentProduct.bgColor} border-2 border-white shadow-md`}
              >
                <p className="text-xs font-bold text-gray-700">{currentProduct.frequency}</p>
              </motion.div>
            </div>

            {/* Purchase Timeline */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-xs font-semibold text-gray-600">Purchase Pattern</p>
              </div>
              <div className="relative h-12 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200">
                {/* Timeline dots */}
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  {currentProduct.purchaseHistory.map((day, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative"
                    >
                      <motion.div
                        className={`w-3 h-3 rounded-full bg-gradient-to-br ${currentProduct.color} shadow-lg ring-2 ring-white`}
                        animate={{
                          scale: [1, 1.3, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: idx * 0.2
                        }}
                      />
                      {idx === currentProduct.purchaseHistory.length - 1 && (
                        <motion.div
                          className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
                          initial={{ y: 5, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className={`px-2 py-0.5 rounded-full ${currentProduct.bgColor} border border-gray-300 shadow-sm`}>
                            <p className="text-[10px] font-bold text-gray-700">Today</p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
                {/* Connecting line */}
                <motion.div
                  className={`absolute top-1/2 left-0 h-0.5 bg-gradient-to-r ${currentProduct.color} opacity-30`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-900">Next Purchase</p>
                </div>
                <p className="text-sm font-bold text-blue-700">{currentProduct.nextBuy}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <p className="text-xs font-semibold text-green-900">Savings</p>
                </div>
                <p className="text-sm font-bold text-green-700">{currentProduct.savings}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* AI Recommendation Card */}
        <AnimatePresence>
          {showRecommendation && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden"
            >
              {/* Animated shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              <div className="relative bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-2xl p-5 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.5)]">
                <div className="flex items-start gap-3 mb-3">
                  <motion.div
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30"
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm mb-1">AI Recommendation</p>
                    <p className="text-white/90 text-xs leading-relaxed">
                      Buy <span className="font-bold">{currentProduct.name}</span> {currentProduct.nextBuy.toLowerCase()} to maintain optimal stock and save {currentProduct.savings}
                    </p>
                  </div>
                </div>

                <motion.button
                  className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/40 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product indicator dots */}
        <div className="flex justify-center gap-2 pt-2">
          {products.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setActiveProduct(index);
                setShowRecommendation(false);
                setTimeout(() => setShowRecommendation(true), 300);
              }}
              className={`h-2 rounded-full transition-all ${
                index === activeProduct ? "w-8 bg-gradient-to-r from-blue-500 to-purple-600" : "w-2 bg-gray-300"
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
