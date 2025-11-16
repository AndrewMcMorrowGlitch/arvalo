'use client'

import React, { useEffect, useState } from 'react'
import { Shield, CalendarClock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Warranty {
  id: string
  product_name: string
  manufacturer: string
  retailer: string
  purchase_date: string
  warranty_end_date: string
  days_remaining: number
  status: string
  purchase_price: number
}

interface WarrantySummary {
  total_warranties: number
  covered: number
  expiring_soon: number
  expired: number
  claimed: number
  total_coverage_value: number
}

export function WarrantyTracking() {
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [summary, setSummary] = useState<WarrantySummary>({
    total_warranties: 0,
    covered: 0,
    expiring_soon: 0,
    expired: 0,
    claimed: 0,
    total_coverage_value: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWarranties()
  }, [])

  const fetchWarranties = async () => {
    try {
      const response = await fetch('/api/warranties')
      if (!response.ok) throw new Error('Failed to fetch warranties')

      const data = await response.json()
      setWarranties(data.warranties || [])
      setSummary(data.summary || summary)
    } catch (error) {
      console.error('Error fetching warranties:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-l-4 border-indigo-500 pl-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Warranty tracking
          </h1>
          <p className="text-gray-600">Loading your warranties...</p>
        </div>
      </div>
    )
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
            {summary.expiring_soon}
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
          {warranties.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium mb-1">No warranties tracked yet</p>
              <p className="text-xs">
                Upload receipts with eligible products to start tracking warranties
              </p>
            </div>
          ) : (
            warranties.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 flex items-center justify-between text-sm"
              >
                <div>
                  <div className="font-medium text-gray-900">{item.product_name}</div>
                  <div className="text-xs text-gray-500">
                    {item.retailer || item.manufacturer} • Purchased{' '}
                    {new Date(item.purchase_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Warranty ends</div>
                    <div className="font-medium text-gray-900">
                      {new Date(item.warranty_end_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Time left</div>
                    <div
                      className={
                        item.days_remaining < 0
                          ? 'font-semibold text-red-600'
                          : item.days_remaining <= 60
                            ? 'font-semibold text-amber-600'
                            : 'font-semibold text-emerald-600'
                      }
                    >
                      {item.days_remaining < 0
                        ? 'Expired'
                        : `${item.days_remaining} day${item.days_remaining === 1 ? '' : 's'}`}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

