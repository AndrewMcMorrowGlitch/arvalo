"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, AlertCircle, Sparkles } from "lucide-react";

interface Card {
  store: string;
  balance: number;
  total: number;
  expiry: string;
  color: string;
  logo: string;
}

export default function GiftCardFeature() {
  const [activeCard, setActiveCard] = useState(0);

  const cards: Card[] = [
    {
      store: "Amazon",
      balance: 45.50,
      total: 50,
      expiry: "30 days",
      color: "from-[#FF9900] via-[#FFB64D] to-[#FFC973]",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
    },
    {
      store: "Starbucks",
      balance: 12.80,
      total: 25,
      expiry: "15 days",
      color: "from-[#00704A] via-[#008248] to-[#00A862]",
      logo: "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg"
    },
    {
      store: "Target",
      balance: 23.00,
      total: 50,
      expiry: "45 days",
      color: "from-[#CC0000] via-[#E50000] to-[#FF3333]",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % cards.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="relative w-[300px] h-[360px]">
        {cards.map((card, index) => {
          const isActive = index === activeCard;
          const offset = (index - activeCard) * 25;
          const zIndex = cards.length - Math.abs(index - activeCard);

          return (
            <motion.div
              key={index}
              className={`absolute inset-0 rounded-3xl p-6 shadow-2xl backdrop-blur-xl border-2 border-white/80 bg-gradient-to-br ${card.color}`}
              animate={{
                y: isActive ? 0 : offset,
                scale: isActive ? 1 : 0.92,
                opacity: isActive ? 1 : 0.6,
                rotateY: isActive ? 0 : -8,
                zIndex
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-3xl"
                animate={{
                  x: isActive ? ["0%", "100%"] : "0%",
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />

              <div className="relative flex flex-col h-full justify-between text-white">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg p-2">
                    <img src={card.logo} alt={card.store} className="w-full h-full object-contain" />
                  </div>
                  <motion.div
                    className="px-3 py-1.5 bg-white/25 backdrop-blur-xl rounded-full border-2 border-white/50 shadow-lg"
                    animate={{
                      scale: isActive ? [1, 1.05, 1] : 1
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <p className="text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Gift Card
                    </p>
                  </motion.div>
                </div>

                <div>
                  <p className="text-lg font-bold opacity-95 mb-3">{card.store}</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <DollarSign className="w-7 h-7" />
                    <span className="text-5xl font-black tracking-tight">{card.balance.toFixed(2)}</span>
                  </div>

                  <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden mb-4 border border-white/30">
                    <motion.div
                      className="h-full bg-gradient-to-r from-white/80 to-white/60 shadow-inner"
                      initial={{ width: 0 }}
                      animate={{ width: isActive ? `${(card.balance / card.total) * 100}%` : "0%" }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs bg-black/20 backdrop-blur-xl px-4 py-3 rounded-xl border-2 border-white/40 shadow-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-semibold">Expires in {card.expiry}</span>
                    </div>
                    <span className="text-xs opacity-80">${card.total} total</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
