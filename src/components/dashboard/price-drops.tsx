'use client'

import React from 'react'
import { TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PriceDrops() {
  const drops = [
    {
      product: 'Apple AirPods Pro (2nd Gen)',
      original: 299,
      current: 199,
      savings: 100,
      store: 'Amazon',
      purchaseDate: 'Jan 15, 2025',
      image:
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200&q=80',
      eligible: true,
    },
    {
      product: 'Sony WH-1000XM5 Headphones',
      original: 399,
      current: 329,
      savings: 70,
      store: 'Best Buy',
      purchaseDate: 'Jan 10, 2025',
      image:
        'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&q=80',
      eligible: true,
    },
    {
      product: 'Mechanical Keyboard',
      original: 159,
      current: 139,
      savings: 20,
      store: 'Amazon',
      purchaseDate: 'Jan 8, 2025',
      image:
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&q=80',
      eligible: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-indigo-500 pl-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Price Drops</h1>
        <p className="text-gray-600">Automatic refund opportunities detected</p>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-gray-900/10 shadow-lg">
        <div className="text-sm text-gray-600 mb-1">Available to Claim</div>
        <div className="text-3xl font-bold text-gray-900">$190</div>
        <div className="text-xs text-emerald-600 font-medium mt-1">
          Across 3 items
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {drops.map((drop, i) => (
          <div
            key={i}
            className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-gray-900/10 shadow-lg"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-900/10">
                <img
                  src={drop.image}
                  alt={drop.product}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {drop.product}
                </h3>
                <div className="text-sm text-gray-500 mb-3 pb-3 border-b border-gray-900/10">
                  {drop.store} • Purchased {drop.purchaseDate}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="text-sm">
                    <span className="line-through text-gray-400">
                      ${drop.original}
                    </span>
                    <span className="mx-2">→</span>
                    <span className="font-bold text-gray-900">
                      ${drop.current}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50/80 px-3 py-1.5 rounded-lg border-2 border-emerald-200">
                    <TrendingDown className="w-4 h-4" />
                    ${drop.savings} saved
                  </div>
                </div>

                {drop.eligible && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-emerald-50/80 backdrop-blur-sm text-emerald-700 text-xs font-medium px-3 py-2 rounded-lg border-2 border-emerald-200">
                      Eligible for refund
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-2 border-emerald-600"
                    >
                      Claim ${drop.savings}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

