"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Package, AlertTriangle } from "lucide-react";

interface ReturnItem {
  product: string;
  days: number;
  total: number;
  status: "urgent" | "warning" | "good";
  color: string;
  image: string;
  store: string;
}

export default function ReturnTrackFeature() {
  const [timer, setTimer] = useState(0);

  const returns: ReturnItem[] = [
    {
      product: "Nike Air Max Running Shoes",
      days: 3,
      total: 30,
      status: "urgent",
      color: "from-red-500 to-rose-600",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80",
      store: "Nike.com"
    },
    {
      product: "Herman Miller Office Chair",
      days: 7,
      total: 30,
      status: "warning",
      color: "from-orange-500 to-amber-600",
      image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=200&q=80",
      store: "Amazon"
    },
    {
      product: "Sony WH-1000XM5 Headphones",
      days: 14,
      total: 30,
      status: "good",
      color: "from-green-500 to-emerald-600",
      image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&q=80",
      store: "Best Buy"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="w-full max-w-[360px] space-y-3">
        {returns.map((item, index) => {
          const percentage = (item.days / item.total) * 100;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
              className="bg-white/90 backdrop-blur-xl border-2 border-white/80 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="relative">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg">
                    <img src={item.image} alt={item.product} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center shadow-lg`}>
                    <Package className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-black text-gray-900 mb-1 leading-tight">{item.product}</p>
                  <p className="text-xs text-gray-500 font-semibold mb-2">{item.store}</p>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-4 h-4 ${
                        item.status === 'urgent' ? 'text-red-500' :
                        item.status === 'warning' ? 'text-orange-500' : 'text-green-500'
                      }`} />
                      <span className={`text-lg font-black ${
                        item.status === 'urgent' ? 'text-red-600' :
                        item.status === 'warning' ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {item.days} days
                      </span>
                    </div>

                    {item.status === 'urgent' && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full border-2 border-red-300"
                      >
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span className="text-xs font-black text-red-700">Urgent</span>
                      </motion.div>
                    )}
                  </div>

                  <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      className={`absolute left-0 top-0 h-full bg-gradient-to-r ${item.color} shadow-md`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">
                    {item.days} of {item.total} days left
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        <motion.div
          className="bg-gradient-to-r from-purple-500 via-pink-600 to-rose-600 text-white rounded-2xl p-5 shadow-2xl border-2 border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-black">3 Active Returns</p>
                <p className="text-xs opacity-95 font-semibold">Total value: $847</p>
              </div>
            </div>
            <Package className="w-8 h-8 opacity-50" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
