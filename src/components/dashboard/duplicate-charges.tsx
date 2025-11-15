'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'

export function DuplicateCharges() {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-rose-500 pl-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Duplicate charges
        </h1>
        <p className="text-gray-600">
          This feature will flag potential duplicate or overlapping card
          charges using your real transaction data.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">
            Coming soon
          </div>
          <p className="text-xs text-gray-500">
            We&apos;ll look for suspiciously similar transactions (same amount,
            merchant, and time window). Until that logic is wired up, we&apos;re
            not showing any mock duplicate data.
          </p>
        </div>
      </div>
    </div>
  )
}
