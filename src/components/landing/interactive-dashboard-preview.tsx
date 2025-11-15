"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Package, TrendingDown, Clock, Bell, LogOut } from "lucide-react";

export default function InteractiveDashboardPreview() {
  const [activeView, setActiveView] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveView((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-[#F7F5F3] relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          {/* Header */}
          <div className="bg-white border-b border-[rgba(55,50,47,0.12)] px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691811bbeb85f638ca84be56/3a657b16e_image.png"
                alt="Arvalo"
                className="h-6"
              />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                  U
                </div>
                <LogOut className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6 overflow-auto h-[calc(100%-56px)]">
            {activeView === 0 && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#37322F] mb-1">Welcome back!</h1>
                  <p className="text-sm text-[#605A57]">Here&apos;s what&apos;s happening with your purchases</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-[#605A57]">Total Saved</p>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#37322F]">$1,247</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-[#605A57]">Tracked</p>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#37322F]">42</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-[#605A57]">Price Drops</p>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <TrendingDown className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#37322F]">7</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-[#605A57]">Returns</p>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#37322F]">3</p>
                  </div>
                </div>
              </div>
            )}

            {activeView === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <h2 className="text-lg font-bold text-[#37322F]">Recent Price Drops</h2>
                </div>

                <div className="space-y-2">
                  <div className="bg-orange-50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#37322F]">Wireless Headphones</p>
                      <p className="text-xs text-[#605A57]">
                        <span className="line-through">$199</span> → <span className="text-green-600 font-bold">$149</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">$50</p>
                      <p className="text-xs text-[#605A57]">saved</p>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#37322F]">Smart Watch</p>
                      <p className="text-xs text-[#605A57]">
                        <span className="line-through">$299</span> → <span className="text-green-600 font-bold">$249</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">$50</p>
                      <p className="text-xs text-[#605A57]">saved</p>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#37322F]">Laptop Stand</p>
                      <p className="text-xs text-[#605A57]">
                        <span className="line-through">$79</span> → <span className="text-green-600 font-bold">$59</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">$20</p>
                      <p className="text-xs text-[#605A57]">saved</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-bold text-[#37322F]">Return Deadlines</h2>
                </div>

                <div className="space-y-2">
                  <div className="bg-purple-50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#37322F]">Running Shoes</p>
                      <p className="text-xs text-[#605A57]">Nike</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">3 days</p>
                      <p className="text-xs text-[#605A57]">remaining</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#37322F]">Office Chair</p>
                      <p className="text-xs text-[#605A57]">Amazon</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">7 days</p>
                      <p className="text-xs text-[#605A57]">remaining</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#37322F]">Camera Lens</p>
                      <p className="text-xs text-[#605A57]">B&H Photo</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">14 days</p>
                      <p className="text-xs text-[#605A57]">remaining</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* View indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setActiveView(index)}
            className={`h-2 rounded-full transition-all ${
              index === activeView ? 'w-8 bg-[#37322F]' : 'w-2 bg-[#37322F]/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
