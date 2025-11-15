"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F5F3]/80 backdrop-blur-md border-b border-[rgba(55,50,47,0.12)]">
      <div className="max-w-[1060px] mx-auto px-4 sm:px-6 lg:px-0">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691811bbeb85f638ca84be56/3a657b16e_image.png"
              alt="Arvalo"
              className="h-8"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#products" className="text-[#605A57] hover:text-[#37322F] transition-colors text-sm font-medium">
              Features
            </a>
            <a href="#pricing" className="text-[#605A57] hover:text-[#37322F] transition-colors text-sm font-medium">
              Pricing
            </a>
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-[#37322F] text-white rounded-full hover:bg-[#2A2520] transition-colors text-sm font-medium"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#37322F]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[rgba(55,50,47,0.12)]">
            <nav className="flex flex-col gap-4">
              <a
                href="#products"
                className="text-[#605A57] hover:text-[#37322F] transition-colors text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-[#605A57] hover:text-[#37322F] transition-colors text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-[#37322F] text-white rounded-full hover:bg-[#2A2520] transition-colors text-sm font-medium text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
