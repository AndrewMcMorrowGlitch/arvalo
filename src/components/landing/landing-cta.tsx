"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LandingCTA() {
  return (
    <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-purple-600 text-sm font-medium">AI-Powered Money Recovery</span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#37322F] mb-6">
          Stop Leaving Money
          <br />
          on the Table
        </h2>

        <p className="text-xl text-[#605A57] mb-10 max-w-2xl mx-auto">
          Join thousands of smart shoppers who recover hundreds of dollars every month with automated tracking and AI-powered refunds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard">
            <button className="px-8 py-4 bg-[#37322F] text-white rounded-full font-semibold text-lg hover:bg-[#2A2520] transition-all flex items-center gap-2 group shadow-xl">
              Start Reclaiming Money
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          <button className="px-8 py-4 bg-transparent border-2 border-[#37322F] text-[#37322F] rounded-full font-semibold text-lg hover:bg-[#37322F] hover:text-white transition-all">
            Watch Demo
          </button>
        </div>

        <p className="text-sm text-[#605A57] mt-6">
          No credit card required • Free plan available • Cancel anytime
        </p>
      </div>
    </div>
  );
}
