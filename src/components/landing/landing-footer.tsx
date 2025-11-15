"use client";

import React from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function LandingFooter() {
  const footerLinks = [
    { name: "Features", href: "#products" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "Get Started", href: "/dashboard" }
  ];

  return (
    <footer className="w-full relative overflow-hidden border-t border-white/20">
      {/* Multi-layered background for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 via-blue-200/20 to-indigo-200/30"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-pink-100/20 via-transparent to-cyan-100/20"></div>

      {/* Main glassmorphism container */}
      <div className="relative backdrop-blur-2xl bg-white/30">
        {/* Light reflection effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            {/* Brand - with subtle glass card */}
            <div className="flex-shrink-0">
              <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691811bbeb85f638ca84be56/3a657b16e_image.png"
                  alt="Arvalo"
                  className="h-10 mb-4"
                />
                <p className="text-[#605A57] text-sm max-w-xs leading-relaxed">
                  AI-powered money recovery from your online purchases. Never miss a refund again.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                {[
                  { icon: Twitter, href: "#" },
                  { icon: Github, href: "#" },
                  { icon: Linkedin, href: "#" },
                  { icon: Mail, href: "#" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-11 h-11 rounded-xl bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center text-[#605A57] hover:text-[#37322F] hover:bg-white/60 hover:border-white/70 transition-all shadow-[0_4px_16px_0_rgba(31,38,135,0.1)]"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation Links - with glass effect */}
            <div className="flex flex-wrap gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-6 py-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/50 text-[#37322F] hover:bg-white/60 hover:border-white/70 transition-all text-sm font-medium shadow-[0_4px_16px_0_rgba(31,38,135,0.1)]"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom section with glass divider */}
          <div className="relative pt-8">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            <p className="text-[#605A57] text-sm text-center">
              © 2024 Arvalo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
