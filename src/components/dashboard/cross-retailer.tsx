'use client'

import React from 'react'
import { Search, Store, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function CrossRetailer() {
  const opportunities = [
    {
      product: 'Noise Cancelling Headphones',
      currentStore: 'Amazon',
      currentPrice: 279,
      betterStore: 'Best Buy',
      betterPrice: 249,
      savings: 30,
    },
    {
      product: 'Running Shoes',
      currentStore: 'Nike',
      currentPrice: 129,
      betterStore: 'Zappos',
      betterPrice: 109,
      savings: 20,
    },
    {
      product: 'Smart Home Hub',
      currentStore: 'Target',
      currentPrice: 199,
      betterStore: 'Walmart',
      betterPrice: 179,
      savings: 20,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-teal-500 pl-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Cross-retailer opportunities
        </h1>
        <p className="text-gray-600">
          Find better prices for the same items at other trusted stores
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-1">
              Search your purchase history
            </div>
            <p className="text-xs text-gray-500">
              We&apos;ll scan trusted retailers for lower prices on identical
              items.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Input
              placeholder="Search by product, order ID, or retailer..."
              className="h-9 text-sm"
            />
            <Button className="h-9 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Scan for better offers
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-teal-50 border border-teal-100">
            <div className="text-xs font-semibold text-teal-700 mb-1 uppercase">
              Coverage
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">
              20+ major retailers
            </div>
            <p className="text-xs text-gray-600">
              Including Amazon, Walmart, Target, Best Buy, and more.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-xs font-semibold text-gray-700 mb-1 uppercase">
              Matching
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">
              Same SKU or model
            </div>
            <p className="text-xs text-gray-600">
              We look at model numbers and specific variants, not just names.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-xs font-semibold text-gray-700 mb-1 uppercase">
              Alerts
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">
              Real-time notifications
            </div>
            <p className="text-xs text-gray-600">
              Get notified when a better offer appears within your return
              window.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Recent opportunities
            </h2>
            <p className="text-xs text-gray-500">
              Where you could have paid less for the same item
            </p>
          </div>
          <div className="text-xs text-gray-500">
            Based on your last 90 days of purchases
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {opportunities.map((opp, i) => (
            <div
              key={i}
              className="px-6 py-4 flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Store className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {opp.product}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span>{opp.currentStore}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>{opp.betterStore}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-500">You paid</div>
                  <div className="font-medium text-gray-900">
                    ${opp.currentPrice.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Best offer</div>
                  <div className="font-medium text-gray-900">
                    ${opp.betterPrice.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Potential savings</div>
                  <div className="font-semibold text-teal-600">
                    ${opp.savings.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

