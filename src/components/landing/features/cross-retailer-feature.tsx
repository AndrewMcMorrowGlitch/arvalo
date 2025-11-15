"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingDown, Sparkles } from "lucide-react";

interface Retailer {
  name: string;
  price: number;
  logo: string;
  color: string;
}

export default function CrossRetailerFeature() {
  const [comparing, setComparing] = useState(false);
  const [bestDeal, setBestDeal] = useState<number | null>(null);

  const retailers: Retailer[] = [
    {
      name: "Amazon",
      price: 299,
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      color: "from-[#FF9900] to-[#FFB64D]"
    },
    {
      name: "Best Buy",
      price: 349,
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Best_Buy_Logo.svg",
      color: "from-[#0046BE] to-[#1557CC]"
    },
    {
      name: "Target",
      price: 279,
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg",
      color: "from-[#CC0000] to-[#E50000]"
    },
    {
      name: "Walmart",
      price: 289,
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg",
      color: "from-[#0071CE] to-[#1A8FE3]"
    }
  ];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setComparing(true);
      setTimeout(() => {
        setBestDeal(2); // Target has best price
      }, 1800);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-[360px] space-y-4">
        {/* Product Card */}
        <div className="bg-white/90 backdrop-blur-xl border-2 border-white/80 rounded-2xl p-4 shadow-xl">
          <div className="w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&q=80"
              alt="AirPods Pro"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-bold text-gray-900">Apple AirPods Pro (2nd Gen)</p>
          </div>
        </div>

        {/* Scanning animation */}
        <AnimatePresence>
          {comparing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-3 text-center text-sm font-bold shadow-lg"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block mr-2"
              >
                <Sparkles className="w-4 h-4 inline" />
              </motion.div>
              Comparing across retailers...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="space-y-2">
          {retailers.map((retailer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.15, type: "spring", stiffness: 100 }}
              className={`relative bg-white/90 backdrop-blur-xl border-2 rounded-2xl p-4 shadow-lg transition-all ${
                bestDeal === index
                  ? "border-green-400 ring-4 ring-green-200 shadow-xl"
                  : "border-white/80 hover:shadow-xl"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-md p-2`}>
                    <img src={retailer.logo} alt={retailer.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{retailer.name}</p>
                    <p className="text-2xl font-black text-gray-900">${retailer.price}</p>
                  </div>
                </div>

                {bestDeal === index && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-full text-xs font-black shadow-lg"
                  >
                    <TrendingDown className="w-4 h-4" />
                    Best Deal!
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {bestDeal !== null && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="bg-gradient-to-r from-green-500 via-emerald-600 to-green-600 text-white rounded-2xl p-5 shadow-2xl border-2 border-white/20"
          >
            <p className="text-base font-black mb-1">💰 Save $70 by switching!</p>
            <p className="text-xs opacity-95 font-semibold">You paid $349 at Best Buy. Get a refund and buy from Target for $279.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
