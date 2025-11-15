'use client'

import React from 'react'
import { Shield, CalendarClock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WarrantyTracking() {
  const items = [
    {
      product: 'MacBook Pro 14"',
      retailer: 'Apple',
      purchaseDate: 'Nov 15, 2024',
      warrantyEnd: 'Nov 15, 2026',
      daysLeft: 670,
      status: 'covered',
    },
    {
      product: '4K OLED TV',
      retailer: 'Best Buy',
      purchaseDate: 'Sep 01, 2024',
      warrantyEnd: 'Sep 01, 2025',
      daysLeft: 230,
      status: 'covered',
    },
    {
      product: 'Robot Vacuum',
      retailer: 'Amazon',
      purchaseDate: 'Jan 02, 2024',
      warrantyEnd: 'Jan 02, 2025',
      daysLeft: -10,
      status: 'expired',
    },
  ]

  const summary = {
    covered: items.filter((i) => i.status === 'covered').length,
    expiringSoon: items.filter((i) => i.daysLeft > 0 && i.daysLeft <= 60).length,
    expired: items.filter((i) => i.status === 'expired').length,
  }

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-indigo-500 pl-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Warranty tracking
        </h1>
        <p className="text-gray-600">
          Know what&apos;s still covered before something breaks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Covered items
              </div>
              <div className="text-xs text-gray-500">
                Under active manufacturer or store warranty
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {summary.covered}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            We&apos;ll surface these when issues appear
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Expiring soon
              </div>
              <div className="text-xs text-gray-500">
                Within the next 60 days
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {summary.expiringSoon}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            We&apos;ll remind you before coverage ends
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Out of coverage
              </div>
              <div className="text-xs text-gray-500">
                No active warranty remaining
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {summary.expired}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            We&apos;ll still track issues here
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Warranty overview
            </h2>
            <p className="text-xs text-gray-500">
              Your highest-value items and their coverage
            </p>
          </div>
          <Button variant="outline" size="sm">
            Add warranty
          </Button>
        </div>

        <div className="divide-y divide-gray-100">
          {items.map((item, i) => (
            <div
              key={i}
              className="px-6 py-4 flex items-center justify-between text-sm"
            >
              <div>
                <div className="font-medium text-gray-900">{item.product}</div>
                <div className="text-xs text-gray-500">
                  {item.retailer} • Purchased {item.purchaseDate}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Warranty ends</div>
                  <div className="font-medium text-gray-900">
                    {item.warrantyEnd}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Time left</div>
                  <div
                    className={
                      item.daysLeft < 0
                        ? 'font-semibold text-red-600'
                        : item.daysLeft <= 60
                          ? 'font-semibold text-amber-600'
                          : 'font-semibold text-emerald-600'
                    }
                  >
                    {item.daysLeft < 0
                      ? 'Expired'
                      : `${item.daysLeft} day${item.daysLeft === 1 ? '' : 's'}`}
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

