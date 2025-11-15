"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Zap } from "lucide-react";

interface Transaction {
  merchant: string;
  amount: number;
  time: string;
  duplicate: boolean;
  logo: string;
  image: string;
}

export default function DuplicateChargesFeature() {
  const [scanning, setScanning] = useState(true);
  const [foundDuplicate, setFoundDuplicate] = useState(false);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setScanning(false);
      setFoundDuplicate(true);
    }, 2000);

    const timer2 = setTimeout(() => {
      setResolved(true);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const transactions: Transaction[] = [
    {
      merchant: "Starbucks",
      amount: 5.45,
      time: "10:23 AM",
      duplicate: false,
      logo: "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&q=80"
    },
    {
      merchant: "Amazon",
      amount: 89.99,
      time: "2:15 PM",
      duplicate: true,
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80"
    },
    {
      merchant: "Amazon",
      amount: 89.99,
      time: "2:15 PM",
      duplicate: true,
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80"
    },
    {
      merchant: "Target",
      amount: 45.32,
      time: "4:30 PM",
      duplicate: false,
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&q=80"
    }
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="w-full max-w-[360px] space-y-4">
        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {scanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-4 text-center shadow-xl"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block mr-2"
              >
                <Zap className="w-5 h-5 inline" />
              </motion.div>
              <span className="text-sm font-bold">Scanning transactions...</span>
            </motion.div>
          )}

          {foundDuplicate && !resolved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-xl border-2 border-white/30"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <AlertTriangle className="w-6 h-6" />
              </motion.div>
              <div className="flex-1">
                <p className="text-base font-black">Duplicate Charge Found!</p>
                <p className="text-xs opacity-95 font-semibold">$89.99 charged twice by Amazon</p>
              </div>
            </motion.div>
          )}

          {resolved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-xl border-2 border-white/30"
            >
              <CheckCircle2 className="w-6 h-6" />
              <div className="flex-1">
                <p className="text-base font-black">Dispute Filed!</p>
                <p className="text-xs opacity-95 font-semibold">$89.99 refund in progress</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transactions list */}
        <div className="space-y-2">
          {transactions.map((transaction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              className={`bg-white/90 backdrop-blur-xl border-2 rounded-2xl p-4 shadow-lg relative overflow-hidden ${
                transaction.duplicate && !resolved
                  ? "border-red-400 ring-4 ring-red-200"
                  : transaction.duplicate && resolved
                  ? "border-green-400 opacity-60"
                  : "border-white/80"
              }`}
            >
              {transaction.duplicate && resolved && (
                <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-full text-sm font-black flex items-center gap-2 shadow-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    Resolved
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shadow-md">
                      <img src={transaction.image} alt={transaction.merchant} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full p-0.5 shadow-md">
                      <img src={transaction.logo} alt={transaction.merchant} className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{transaction.merchant}</p>
                    <p className="text-xs text-gray-500 font-medium">{transaction.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-gray-900">${transaction.amount}</p>
                  {transaction.duplicate && !resolved && (
                    <motion.p
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-xs text-red-600 font-black"
                    >
                      DUPLICATE
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
