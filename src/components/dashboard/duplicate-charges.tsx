'use client'

import React from 'react'
import { AlertCircle, ReceiptText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DuplicateCharges() {
  const charges = [
    {
      merchant: 'Spotify',
      description: 'Premium subscription',
      amount: 9.99,
      count: 2,
      firstDate: 'Jan 01, 2025',
      lastDate: 'Jan 08, 2025',
    },
    {
      merchant: 'Uber',
      description: 'Ride charges',
      amount: 24.5,
      count: 3,
      firstDate: 'Dec 28, 2024',
      lastDate: 'Dec 30, 2024',
    },
  ]

  const potentialRefund =
    charges.reduce((sum, c) => sum + c.amount * (c.count - 1), 0) || 0

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-rose-500 pl-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Duplicate charges
        </h1>
        <p className="text-gray-600">
          Catch accidental double charges and contested transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Potential refunds
              </div>
              <div className="text-xs text-gray-500">
                From likely duplicate charges
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ${potentialRefund.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            If all flagged charges are confirmed
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
              <ReceiptText className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Similar amounts
              </div>
              <div className="text-xs text-gray-500">
                We compare dates, amounts, and merchants
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {charges.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Items need your confirmation
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Confirmed resolved
              </div>
              <div className="text-xs text-gray-500">
                We&apos;ll mark these as cleared
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">0</div>
          <div className="text-xs text-gray-500 mt-1">
            We&apos;ll track this over time
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Flagged transactions
            </h2>
            <p className="text-xs text-gray-500">
              Review and confirm if these are duplicates
            </p>
          </div>
          <Button variant="outline" size="sm">
            Export for review
          </Button>
        </div>

        <div className="divide-y divide-gray-100">
          {charges.map((charge, i) => (
            <div
              key={i}
              className="px-6 py-4 flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                  <ReceiptText className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {charge.merchant}
                  </div>
                  <div className="text-xs text-gray-500">
                    {charge.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Amount</div>
                  <div className="font-semibold text-gray-900">
                    ${charge.amount.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Occurrences</div>
                  <div className="font-semibold text-gray-900">
                    {charge.count}×
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Period</div>
                  <div className="font-medium text-gray-900">
                    {charge.firstDate} – {charge.lastDate}
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

