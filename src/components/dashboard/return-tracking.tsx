'use client'

import React, { useEffect, useState } from 'react'
import { RotateCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Purchase = {
  id: string
  merchant_name: string
  total_amount: number
  return_deadline: string | null
}

type ReturnItem = {
  id: string
  retailer: string
  amount: number
  deadline: string
  daysLeft: number
  status: 'urgent' | 'upcoming' | 'missed'
}

export function ReturnTracking() {
  const [items, setItems] = useState<ReturnItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/purchases')
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load purchases')
        }
        const purchases = (data.purchases || []) as Purchase[]

        const now = Date.now()
        const mapped: ReturnItem[] = []

        for (const p of purchases) {
          if (!p.return_deadline) continue
          const deadlineDate = new Date(p.return_deadline)
          const daysLeft = Math.ceil(
            (deadlineDate.getTime() - now) / (1000 * 60 * 60 * 24),
          )

          let status: ReturnItem['status']
          if (daysLeft < 0) status = 'missed'
          else if (daysLeft <= 3) status = 'urgent'
          else status = 'upcoming'

          mapped.push({
            id: p.id,
            retailer: p.merchant_name,
            amount: p.total_amount,
            deadline: deadlineDate.toLocaleDateString(),
            daysLeft,
            status,
          })
        }

        setItems(mapped)
      } catch (err: any) {
        console.error('Error loading returns:', err)
        setError(err?.message || 'Failed to load return tracking data')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const summary = {
    urgent: items.filter((r) => r.status === 'urgent').length,
    upcoming: items.filter((r) => r.status === 'upcoming').length,
    missed: items.filter((r) => r.status === 'missed').length,
  }

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-blue-500 pl-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Return tracking</h1>
        <p className="text-gray-600">
          Never miss a return window again on your real purchases
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

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
            {loading ? 'Syncing…' : 'Sync latest purchases'}
          </Button>
        </div>

        <div className="divide-y divide-gray-100">
          {items.map((ret) => (
            <div
              key={ret.id}
              className="px-6 py-4 flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{ret.retailer}</div>
                  <div className="text-xs text-gray-500">
                    ${ret.amount.toFixed(2)}
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

