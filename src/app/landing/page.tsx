"use client";

import React from "react";
import Link from "next/link";
import LandingHeader from "@/components/landing/landing-header";
import MoneyFlowAnimation from "@/components/landing/money-flow-animation";
import InteractiveDashboardPreview from "@/components/landing/interactive-dashboard-preview";
import FeaturesShowcase from "@/components/landing/features-showcase";
import LandingPricing from "@/components/landing/landing-pricing";
import LandingFAQ from "@/components/landing/landing-faq";
import LandingCTA from "@/components/landing/landing-cta";
import LandingFooter from "@/components/landing/landing-footer";

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="px-[14px] py-[6px] bg-white/50 backdrop-blur-md shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px] border border-white/60 shadow-xs">
      <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center">{icon}</div>
      <div className="text-center flex justify-center flex-col text-[#37322F] text-xs font-medium leading-3 font-sans">
        {text}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-start items-center">
      <LandingHeader />

      <div className="relative flex flex-col justify-start items-center w-full">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen">
          <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>
          <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          <div className="self-stretch pt-[9px] overflow-hidden border-b border-[rgba(55,50,47,0.06)] flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
            <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-[216px] pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
              <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  <div className="w-full max-w-[748.71px] lg:w-[748.71px] text-center flex justify-center flex-col text-[#37322F] text-[28px] xs:text-[32px] sm:text-[40px] md:text-[56px] lg:text-[80px] font-normal leading-[1.05] sm:leading-[1.1] md:leading-[1.15] lg:leading-[1.2] font-serif px-2 sm:px-4 md:px-0">
                    Your All-In-One Post-Purchase Agent
                  </div>
                  <div className="w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-[rgba(55,50,47,0.80)] text-base sm:text-lg md:text-xl leading-[1.5] sm:leading-[1.55] md:leading-[1.6] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium">
                    From price drops to warranty claims, duplicate charges to unused subscriptions—Arvalo automatically tracks every way you can save or recover money after checkout.
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[497px] lg:w-[497px] flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative z-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12">
                <div className="backdrop-blur-[8.25px] flex justify-start items-center gap-4">
                  <Link href="/dashboard">
                    <div className="h-11 sm:h-12 md:h-[52px] px-8 sm:px-10 md:px-12 lg:px-14 py-2 sm:py-[6px] relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-[#2A2520] hover:shadow-lg transition-all duration-300 group">
                      <div className="w-24 sm:w-32 md:w-36 lg:w-44 h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
                      <div className="flex items-center gap-2 justify-center text-white text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans">
                        Start reclaiming money
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="w-full max-w-[960px] lg:w-[960px] pt-2 sm:pt-4 pb-6 sm:pb-8 md:pb-10 px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 my-8 sm:my-12 md:my-16 lg:my-20 mb-0 lg:pb-0">
                <div className="w-full max-w-[960px] lg:w-[960px] h-[400px] sm:h-[480px] md:h-[560px] lg:h-[640px] shadow-[0px_4px_24px_rgba(0,0,0,0.08)] overflow-hidden rounded-[8px] sm:rounded-[12px] lg:rounded-[16px] border border-white/40 backdrop-blur-md bg-white/20">
                  <InteractiveDashboardPreview />
                </div>
              </div>

              <MoneyFlowAnimation />

              <div id="products" className="w-full">
                <div className="text-center mb-12 flex flex-col items-center">
                  <Badge
                    icon={
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                        <rect x="7" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                        <rect x="1" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                        <rect x="7" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                      </svg>
                    }
                    text="8 Powerful Features"
                  />
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#37322F] mt-6 mb-4">
                    Your All-In-One Post-Purchase Agent
                  </h2>
                  <p className="text-[#605A57] text-lg max-w-2xl mx-auto">
                    From tracking shipments to warranty claims, Arvalo automates every way to save and recover money on your purchases.
                  </p>
                </div>

                <FeaturesShowcase />
              </div>

              <div id="pricing">
                <LandingPricing />
              </div>

              <div id="faq">
                <LandingFAQ />
              </div>

              <LandingCTA />
              <LandingFooter />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
