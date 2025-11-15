"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Gift, TrendingDown, RotateCcw, CreditCard, Search, AlertTriangle, Shield, type LucideIcon } from "lucide-react";
import PlanOrderFeature from "./features/plan-order-feature";
import PriceDropFeature from "./features/price-drop-feature";
import GiftCardFeature from "./features/gift-card-feature";
import ReturnTrackFeature from "./features/return-track-feature";
import SubscriptionFeature from "./features/subscription-feature";
import CrossRetailerFeature from "./features/cross-retailer-feature";
import DuplicateChargesFeature from "./features/duplicate-charges-feature";
import WarrantyTrackingFeature from "./features/warranty-tracking-feature";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  component: React.ComponentType;
}

const features: Feature[] = [
  {
    id: "plan-order",
    title: "Recurrent Purchases",
    description: "Track recurrent purchases (groceries, toiletries) and get AI recommendations for optimal buy cycles and timing to maximize savings.",
    icon: Package,
    color: "from-blue-500 to-indigo-600",
    component: PlanOrderFeature
  },
  {
    id: "price-drop",
    title: "Price Drop",
    description: "Continuously checks past purchases for post-purchase price drops and alerts users when they're eligible for automatic savings.",
    icon: TrendingDown,
    color: "from-orange-500 to-red-600",
    component: PriceDropFeature
  },
  {
    id: "gift-card",
    title: "Gift Card",
    description: "Detects unused or partially used gift cards, tracks balances, and surfaces opportunities to apply them before they expire.",
    icon: Gift,
    color: "from-green-500 to-emerald-600",
    component: GiftCardFeature
  },
  {
    id: "return-track",
    title: "Return Track",
    description: "Tracks return windows, deadlines, and status updates across all retailers to prevent missed refunds.",
    icon: RotateCcw,
    color: "from-purple-500 to-pink-600",
    component: ReturnTrackFeature
  },
  {
    id: "subscription",
    title: "Subscription",
    description: "Identifies active subscriptions, upcoming renewals, and unused services so users can cancel or adjust before being charged again.",
    icon: CreditCard,
    color: "from-cyan-500 to-blue-600",
    component: SubscriptionFeature
  },
  {
    id: "cross-retailer",
    title: "Cross-Retailer Comparison",
    description: "Compares prices for identical items across major retailers to highlight better deals and potential refund opportunities.",
    icon: Search,
    color: "from-yellow-500 to-amber-600",
    component: CrossRetailerFeature
  },
  {
    id: "duplicate-charges",
    title: "Duplicate Charges",
    description: "Detects accidental double charges or repeated billing errors and alerts users so they can request corrections immediately.",
    icon: AlertTriangle,
    color: "from-red-500 to-rose-600",
    component: DuplicateChargesFeature
  },
  {
    id: "warranty",
    title: "Warranty Tracking",
    description: "Stores warranty info for recent purchases and monitors eligibility for repairs, replacements, or service claims.",
    icon: Shield,
    color: "from-indigo-500 to-purple-600",
    component: WarrantyTrackingFeature
  }
];

export default function FeaturesShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay]);

  const handleFeatureSelect = (index: number) => {
    setActiveFeature(index);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const currentFeature = features[activeFeature];
  const Icon = currentFeature.icon;

  return (
    <div className="w-full border-b border-[rgba(55,50,47,0.12)] py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main showcase area */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
          {/* Left: Feature info */}
          <div className="flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${currentFeature.color} text-white rounded-full mb-6 shadow-lg`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-semibold">{currentFeature.title}</span>
                </div>

                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#37322F] mb-4 leading-tight">
                  {currentFeature.title}
                </h3>

                <p className="text-lg text-[#605A57] leading-relaxed mb-6">
                  {currentFeature.description}
                </p>

                {/* Progress indicators */}
                <div className="flex items-center gap-2">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleFeatureSelect(index)}
                      className="relative h-1 flex-1 bg-gray-200 rounded-full overflow-hidden"
                    >
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${currentFeature.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: index === activeFeature ? "100%" : "0%" }}
                        transition={{ duration: 5, ease: "linear" }}
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Interactive demo */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full h-[500px] sm:h-[600px] rounded-2xl overflow-hidden backdrop-blur-xl bg-white/50 border border-white/70 shadow-[0_20px_60px_0_rgba(31,38,135,0.25)]"
              >
                <currentFeature.component />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Feature selector tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => handleFeatureSelect(index)}
                className={`p-4 rounded-xl backdrop-blur-md border transition-all ${
                  index === activeFeature
                    ? "bg-white/80 border-white/80 shadow-lg"
                    : "bg-white/40 border-white/50 hover:bg-white/60"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 mx-auto shadow-md`}>
                  <FeatureIcon className="w-5 h-5 text-white" />
                </div>
                <p className={`text-xs font-semibold text-center ${
                  index === activeFeature ? "text-[#37322F]" : "text-[#605A57]"
                }`}>
                  {feature.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
