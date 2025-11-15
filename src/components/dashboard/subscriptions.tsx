'use client'

import React from 'react'
import { CreditCard } from 'lucide-react'

export function Subscriptions() {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-purple-500 pl-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscriptions</h1>
        <p className="text-gray-600">
          This feature will identify recurring subscription-like purchases from
          your receipts.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">
            Coming soon
          </div>
          <p className="text-xs text-gray-500">
            We&apos;ll analyze your purchases to find recurring charges (e.g.
            monthly and yearly subscriptions). No fake data is shown here while
            this logic is under construction.
          </p>
        </div>
      </div>
    </div>
  )
}

