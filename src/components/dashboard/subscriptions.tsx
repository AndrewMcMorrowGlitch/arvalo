'use client'

import React from 'react'
import { CreditCard, TrendingUp, Activity, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Subscriptions() {
  const subs = [
    {
      name: 'Netflix',
      price: 15.99,
      cycle: 'Monthly',
      nextBill: 'Feb 02, 2025',
      usage: 'High',
      status: 'healthy',
    },
    {
      name: 'Headspace',
      price: 69.99,
      cycle: 'Yearly',
      nextBill: 'Jan 18, 2025',
      usage: 'Low',
      status: 'review',
    },
    {
      name: 'Amazon Prime',
      price: 139.0,
      cycle: 'Yearly',
      nextBill: 'Mar 12, 2025',
      usage: 'Medium',
      status: 'healthy',
    },
  ]

  const summary = {
    monthly:
      subs
        .filter((s) => s.cycle === 'Monthly')
        .reduce((sum, s) => sum + s.price, 0) || 0,
    yearly:
      subs
        .filter((s) => s.cycle === 'Yearly')
        .reduce((sum, s) => sum + s.price, 0) || 0,
    review: subs.filter((s) => s.status === 'review').length,
  }

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-purple-500 pl-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscriptions</h1>
        <p className="text-gray-600">
          See where recurring charges are going each month
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Monthly spend
              </div>
              <div className="text-xs text-gray-500">
                Based on your subscriptions
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ${summary.monthly.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Billed every month</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Yearly commitments
              </div>
              <div className="text-xs text-gray-500">
                Large charges to plan for
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ${summary.yearly.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Total upcoming yearly fees
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Review suggested
              </div>
              <div className="text-xs text-gray-500">
                Low-usage or overlapping services
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {summary.review}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            We&apos;ll highlight these for you
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Subscription list
            </h2>
            <p className="text-xs text-gray-500">
              Review recurring payments by service
            </p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            Add subscription
          </Button>
        </div>

        <div className="divide-y divide-gray-100">
          {subs.map((sub, i) => (
            <div
              key={i}
              className="px-6 py-4 flex items-center justify-between text-sm"
            >
              <div>
                <div className="font-medium text-gray-900">{sub.name}</div>
                <div className="text-xs text-gray-500">
                  {sub.cycle} • Next bill {sub.nextBill}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Amount</div>
                  <div className="font-semibold text-gray-900">
                    ${sub.price.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Usage</div>
                  <div
                    className={
                      sub.usage === 'Low'
                        ? 'font-semibold text-amber-600'
                        : 'font-semibold text-emerald-600'
                    }
                  >
                    {sub.usage}
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

