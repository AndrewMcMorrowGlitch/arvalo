"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, X, AlertCircle } from "lucide-react";

interface Subscription {
  name: string;
  price: number;
  renewal: string;
  usage: "High" | "Medium" | "Low";
  color: string;
  logo: string;
}

export default function SubscriptionFeature() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const subscriptions: Subscription[] = [
    {
      name: "Netflix",
      price: 15.99,
      renewal: "3 days",
      usage: "High",
      color: "from-[#E50914] to-[#B20710]",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
    },
    {
      name: "Spotify",
      price: 9.99,
      renewal: "12 days",
      usage: "Medium",
      color: "from-[#1DB954] to-[#1AA34A]",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
    },
    {
      name: "Adobe Creative Cloud",
      price: 52.99,
      renewal: "Today",
      usage: "Low",
      color: "from-[#FF0000] to-[#CC0000]",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg"
    }
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="w-full max-w-[340px] space-y-3">
        {subscriptions.map((sub, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            className="relative bg-white/90 backdrop-blur-xl border-2 border-white/80 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] cursor-pointer hover:shadow-[0_12px_48px_0_rgba(31,38,135,0.3)] transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-14 h-14 bg-gradient-to-br ${sub.color} rounded-2xl flex items-center justify-center shadow-lg p-2`}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img src={sub.logo} alt={sub.name} className="w-full h-full object-contain" />
                </motion.div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{sub.name}</p>
                  <p className="text-xl font-black text-gray-900 mt-0.5">
                    ${sub.price}
                    <span className="text-xs text-gray-500 font-medium">/mo</span>
                  </p>
                </div>
              </div>

              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: hoveredIndex === index ? 1 : 0,
                  opacity: hoveredIndex === index ? 1 : 0
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-semibold">Renews in {sub.renewal}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className={`w-3.5 h-3.5 ${
                    sub.usage === "High" ? "text-green-500" :
                    sub.usage === "Medium" ? "text-yellow-500" : "text-red-500"
                  }`} />
                  <span className={`font-bold ${
                    sub.usage === "High" ? "text-green-600" :
                    sub.usage === "Medium" ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {sub.usage}
                  </span>
                </div>
              </div>

              {sub.usage === "Low" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-3 shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 font-bold leading-tight">
                      Consider canceling to save ${sub.price}/mo
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}

        <motion.div
          className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 text-white rounded-2xl p-5 shadow-2xl border-2 border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90 font-semibold mb-1">Total Monthly Spend</p>
              <p className="text-3xl font-black">${subscriptions.reduce((acc, sub) => acc + sub.price, 0).toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-90 font-semibold mb-1">Potential Savings</p>
              <p className="text-2xl font-black text-yellow-300">$52.99</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
