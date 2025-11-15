"use client";

import React from "react";
import Link from "next/link";
import { Handshake, DollarSign, Shield, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPricing() {
  return (
    <div className="w-full border-b border-[rgba(55,50,47,0.12)] py-16 sm:py-20 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] rounded-full border border-[rgba(2,6,23,0.08)] mb-6">
            <Handshake className="w-4 h-4 text-[#37322F]" />
            <span className="text-xs font-medium text-[#37322F]">Fair & Transparent</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#37322F] mb-4">
            We Only Win When You Win
          </h2>
          <p className="text-[#605A57] text-lg max-w-2xl mx-auto">
            Simple success-based pricing. No subscriptions, no hidden fees—just a small commission on money we recover for you.
          </p>
        </div>

        {/* Main Pricing Card */}
        <div className="relative bg-gradient-to-br from-white via-white to-blue-50/30 rounded-3xl shadow-2xl border border-[rgba(55,50,47,0.08)] p-8 sm:p-12 mb-8">
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent opacity-50 rounded-3xl"></div>

          <div className="relative z-10">
            {/* Big Percentage */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div className="text-7xl sm:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#37322F] to-[#605A57]">
                  10%
                </div>
              </motion.div>
              <p className="text-xl text-[#605A57] font-medium">
                Commission on successful refunds
              </p>
            </div>

            {/* Example Breakdown */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[rgba(55,50,47,0.08)]">
                <div className="text-sm text-[#605A57] mb-2">If we recover</div>
                <div className="text-3xl font-bold text-[#37322F] mb-1">$100</div>
                <div className="text-sm text-green-600 font-semibold">You keep $90</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[rgba(55,50,47,0.08)]">
                <div className="text-sm text-[#605A57] mb-2">If we recover</div>
                <div className="text-3xl font-bold text-[#37322F] mb-1">$500</div>
                <div className="text-sm text-green-600 font-semibold">You keep $450</div>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-[#37322F] text-sm mb-1">No Upfront Cost</div>
                  <div className="text-xs text-[#605A57]">Zero risk, only pay when you save</div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-[#37322F] text-sm mb-1">Aligned Incentives</div>
                  <div className="text-xs text-[#605A57]">We succeed only if you do</div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Handshake className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-[#37322F] text-sm mb-1">Complete Transparency</div>
                  <div className="text-xs text-[#605A57]">See every refund tracked</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link href="/dashboard">
                <button className="px-10 py-4 bg-[#37322F] text-white rounded-full font-semibold text-lg hover:bg-[#2A2520] transition-all shadow-xl">
                  Start Saving Money
                </button>
              </Link>
              <p className="text-sm text-[#605A57] mt-4">
                Join thousands recovering money every day
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
