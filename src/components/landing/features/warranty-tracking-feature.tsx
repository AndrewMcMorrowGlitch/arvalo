"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Calendar, Wrench, CheckCircle, Apple, Camera, Armchair, LucideIcon } from "lucide-react";

interface Warranty {
  product: string;
  expiry: string;
  coverage: string;
  color: string;
  details: string;
  icon: LucideIcon;
  image: string;
}

export default function WarrantyTrackingFeature() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const warranties: Warranty[] = [
    {
      product: "MacBook Pro M3",
      expiry: "340 days",
      coverage: "AppleCare+",
      color: "from-[#007AFF] to-[#0051D5]",
      details: "2-year Apple warranty with accidental damage",
      icon: Apple,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&q=80"
    },
    {
      product: "Sony Alpha Camera",
      expiry: "45 days",
      coverage: "Limited",
      color: "from-[#8E24AA] to-[#6A1B9A]",
      details: "90-day parts warranty + 30-day service",
      icon: Camera,
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&q=80"
    },
    {
      product: "Herman Miller Chair",
      expiry: "180 days",
      coverage: "Full Coverage",
      color: "from-[#00897B] to-[#00695C]",
      details: "1-year extended warranty on all parts",
      icon: Armchair,
      image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=200&q=80"
    }
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      <div className="w-full max-w-[360px] space-y-3">
        {warranties.map((warranty, index) => {
          const isExpanded = expandedIndex === index;
          const daysLeft = parseInt(warranty.expiry);
          const percentage = (daysLeft / 365) * 100;
          const Icon = warranty.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className="bg-white/90 backdrop-blur-xl border-2 border-white/80 rounded-2xl p-4 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                      <img src={warranty.image} alt={warranty.product} className="w-full h-full object-cover" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br ${warranty.color} rounded-lg flex items-center justify-center shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 mb-1">{warranty.product}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1 font-semibold">
                      <Calendar className="w-3 h-3" />
                      {warranty.expiry} left
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-black shadow-md ${
                  warranty.coverage === "Full Coverage" || warranty.coverage === "AppleCare+"
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300"
                    : "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-2 border-yellow-300"
                }`}>
                  {warranty.coverage}
                </div>
              </div>

              <div className="space-y-3">
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${warranty.color} shadow-md`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>

                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: isExpanded ? "auto" : 0,
                    opacity: isExpanded ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 space-y-3">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
                      <p className="text-xs text-gray-700 mb-3 font-semibold">{warranty.details}</p>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Wrench className="w-4 h-4" />
                        <span className="text-xs font-bold">Covers repairs & replacements</span>
                      </div>
                    </div>
                    <button className={`w-full bg-gradient-to-r ${warranty.color} text-white py-3 rounded-xl text-sm font-black shadow-lg hover:shadow-xl transition-all border-2 border-white/30`}>
                      File Warranty Claim
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          );
        })}

        <motion.div
          className="bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-600 text-white rounded-2xl p-5 shadow-2xl border-2 border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-black">3 Active Warranties</p>
                <p className="text-xs opacity-95 font-semibold">Total value: $2,499</p>
              </div>
            </div>
            <Shield className="w-8 h-8 opacity-50" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
