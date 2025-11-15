"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does Arvalo track my purchases?",
      answer: "Simply forward your receipt emails to your unique Arvalo email address. Our AI automatically extracts purchase details, return windows, warranty information, and product data to start tracking everything for you."
    },
    {
      question: "Is my financial information secure?",
      answer: "Absolutely. We use bank-level encryption and never store your payment details. We only track receipt information and product data needed to monitor price drops, return windows, and warranties."
    },
    {
      question: "What stores and services are supported?",
      answer: "We support over 10,000 major retailers including Amazon, Target, Walmart, Best Buy, and many more. We also track subscriptions from streaming services, software platforms, and other recurring billing services."
    },
    {
      question: "How much money can I typically recover?",
      answer: "On average, our users recover $500-$1,500 per year through price drop refunds, duplicate charge corrections, return window alerts, and unused subscription cancellations. The amount varies based on your shopping frequency."
    },
    {
      question: "Do I need to manually file refund requests?",
      answer: "No! Our AI generates professional refund request messages that you can send with one click. For supported retailers, we can even submit them automatically via their customer service systems."
    },
    {
      question: "How does the pricing work?",
      answer: "We only charge a 10% commission on money we successfully recover for you. If we don't save you money, you pay nothing. No subscriptions, no upfront costs—completely risk-free."
    },
    {
      question: "What about warranty tracking?",
      answer: "Arvalo automatically extracts warranty information from your receipts and keeps track of coverage periods. We'll alert you before warranties expire and help you file claims when needed."
    },
    {
      question: "Can Arvalo help with duplicate charges?",
      answer: "Yes! Our AI scans your purchase history for duplicate charges and billing errors, then alerts you immediately so you can request corrections from merchants or your bank."
    }
  ];

  return (
    <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center py-16">
      <div className="max-w-3xl mx-auto px-4 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#37322F] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-[#605A57] text-lg">
            Everything you need to know about Arvalo
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-[rgba(55,50,47,0.08)] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-[#37322F] pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#605A57] transition-transform flex-shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-4 text-[#605A57]">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
