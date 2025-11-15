'use client'

import React from 'react'
import { Gift, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function GiftCards() {
  const cards = [
    {
      retailer: 'Amazon',
      balance: 35.5,
      original: 50,
      expires: 'Mar 15, 2025',
      lastUsed: 'Dec 10, 2024',
      status: 'active',
    },
    {
      retailer: 'Target',
      balance: 12.8,
      original: 25,
      expires: 'Jan 30, 2025',
      lastUsed: 'Nov 05, 2024',
      status: 'expiring',
    },
    {
      retailer: 'Starbucks',
      balance: 9.25,
      original: 20,
      expires: 'No expiry',
      lastUsed: 'Oct 22, 2024',
      status: 'low',
    },
  ]

  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0)

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-amber-500 pl-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gift Cards</h1>
        <p className="text-gray-600">
          Track and use your stored value before it expires
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide opacity-80">
                  Total balance
                </div>
                <div className="text-2xl font-bold">
                  ${totalBalance.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="text-xs bg-black/10 px-3 py-1 rounded-full">
              {cards.length} cards tracked
            </div>
          </div>
          <div className="text-xs opacity-80">
            Don&apos;t leave money on the table — we&apos;ll remind you before
            your balances expire.
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Active balances
              </div>
              <div className="text-xs text-gray-500">
                Ready to redeem now
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Best value to use</span>
              <span className="font-medium text-gray-900">Amazon • $35.50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Oldest balance</span>
              <span className="font-medium text-gray-900">
                Starbucks • since Oct 2024
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-red-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Expiring soon
              </div>
              <div className="text-xs text-gray-500">
                Use these before you lose them
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Target gift card</span>
              <span className="font-medium text-gray-900">$12.80 • Jan 30</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>We&apos;ll send you a reminder 7 days before expiry</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Card details
            </h2>
            <p className="text-xs text-gray-500">
              Track usage and plan your next purchase
            </p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            Add card
          </Button>
        </div>

        <div className="divide-y divide-gray-100">
          {cards.map((card, i) => (
            <div
              key={i}
              className="px-6 py-4 flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {card.retailer}
                  </div>
                  <div className="text-xs text-gray-500">
                    Last used {card.lastUsed}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Current balance</div>
                  <div className="font-semibold text-gray-900">
                    ${card.balance.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Original</div>
                  <div className="font-medium text-gray-900">
                    ${card.original.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Expires</div>
                  <div className="font-medium text-gray-900">
                    {card.expires}
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

