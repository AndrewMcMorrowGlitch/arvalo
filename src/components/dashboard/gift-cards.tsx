'use client'

import React from 'react'
import { Gift } from 'lucide-react'

export function GiftCards() {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-amber-500 pl-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gift Cards</h1>
        <p className="text-gray-600">
          This feature will automatically detect and track gift cards from your
          receipts and Gmail account.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
          <Gift className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">
            Coming soon
          </div>
          <p className="text-xs text-gray-500">
            We&apos;re building the logic to parse gift card balances from your
            purchases. For now, this section doesn&apos;t use any sample data.
          </p>
        </div>
      </div>
    </div>
  )
}

