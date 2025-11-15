'use client'

import React from 'react'
import { RotateCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ReturnTracking() {
  const returns = [
    {
      retailer: 'Amazon',
      item: 'Wireless Mouse',
      amount: 29.99,
      deadline: 'Jan 20, 2025',
      daysLeft: 3,
      status: 'urgent',
    },
    {
      retailer: 'Zara',
      item: 'Wool Sweater',
      amount: 89.5,
      deadline: 'Jan 25, 2025',
      daysLeft: 8,
      status: 'upcoming',
    },
    {
      retailer: 'Apple',
      item: 'iPhone Case',
      amount: 49.0,
      deadline: 'Jan 05, 2025',
      daysLeft: -2,
      status: 'missed',
    },
  ]

  const summary = {
    urgent: returns.filter((r) => r.status === 'urgent').length,
    upcoming: returns.filter((r) => r.status === 'upcoming').length,
    missed: returns.filter((r) => r.status === 'missed').length,
  }

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-blue-500 pl-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Return tracking</h1>
        <p className="text-gray-600">Never miss a return window again</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Urgent returns
              </div>
              <div className="text-xs text-gray-500">Due in 3 days or less</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{summary.urgent}</div>
          <div className="text-xs text-gray-500 mt-1">
            Act now to avoid losing refunds
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Upcoming deadlines
              </div>
              <div className="text-xs text-gray-500">Within the next 14 days</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {summary.upcoming}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            We&apos;ll remind you ahead of time
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Successful returns
              </div>
              <div className="text-xs text-gray-500">
                Completed in the last 30 days
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">0</div>
          <div className="text-xs text-gray-500 mt-1">
            We&apos;ll track these once connected
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Return timeline
            </h2>
            <p className="text-xs text-gray-500">
              Stay ahead of each retailer&apos;s policy
            </p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            Sync latest purchases
          </Button>
        </div>

        <div className="divide-y divide-gray-100">
          {returns.map((ret, i) => (
            <div
              key={i}
              className="px-6 py-4 flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{ret.item}</div>
                  <div className="text-xs text-gray-500">
                    {ret.retailer} • ${ret.amount.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Return by</div>
                  <div className="font-medium text-gray-900">{ret.deadline}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Time left</div>
                  <div
                    className={
                      ret.daysLeft < 0
                        ? 'font-semibold text-red-600'
                        : ret.daysLeft <= 3
                          ? 'font-semibold text-amber-600'
                          : 'font-semibold text-emerald-600'
                    }
                  >
                    {ret.daysLeft < 0
                      ? 'Missed'
                      : `${ret.daysLeft} day${ret.daysLeft === 1 ? '' : 's'}`}
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

