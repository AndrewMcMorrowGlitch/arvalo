'use client'

import React, { useEffect, useState } from 'react'
import { Search, Store, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type CrossRetailerOpportunity = {
  id: string
  retailer: string
  better_price: number | null
  original_price: number | null
  savings: number | null
  url: string | null
  created_at: string
  message: string
}

export function CrossRetailer() {
  const [opportunities, setOpportunities] = useState<CrossRetailerOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    loadOpportunities()
  }, [])

  const loadOpportunities = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/cross-retailer')
      const data = await response.json()
      if (response.ok) {
        setOpportunities(data.opportunities || [])
      } else {
        setError(data.error || 'Failed to load cross-retailer data')
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err)
      setError('Failed to load cross-retailer data')
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async () => {
    setScanning(true)
    setError(null)
    setStatus(null)
    try {
      const response = await fetch('/api/cross-retailer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await response.json()
      if (response.ok) {
        setStatus(
          data.opportunities?.length
            ? `Found ${data.opportunities.length} better offer${data.opportunities.length === 1 ? '' : 's'}!`
            : 'No better offers detected this time.'
        )
        if (data.opportunities) {
          setOpportunities(data.opportunities)
        }
      } else {
        setError(data.error || 'Failed to scan for better offers')
      }
    } catch (err) {
      console.error('Cross-retailer scan failed:', err)
      setError('Failed to scan for better offers')
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-teal-500 pl-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Cross-retailer opportunities
        </h1>
        <p className="text-gray-600">
          Find better prices for the same items at other trusted stores
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-1">
              Scan your purchase history
            </div>
            <p className="text-xs text-gray-500">
              We&apos;ll use Bright Data to check trusted retailers for lower prices on identical items.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button
              className="h-9 flex items-center gap-2"
              onClick={handleScan}
              disabled={scanning}
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Scan for better offers
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="h-9"
              onClick={loadOpportunities}
              disabled={loading}
            >
              Refresh list
            </Button>
          </div>
        </div>

        {(status || error) && (
          <div
            className={`text-sm px-3 py-2 rounded-lg ${
              status ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}
          >
            {status || error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-teal-50 border border-teal-100">
            <div className="text-xs font-semibold text-teal-700 mb-1 uppercase">
              Coverage
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">
              20+ major retailers
            </div>
            <p className="text-xs text-gray-600">
              Including Amazon, Walmart, Target, Best Buy, and more.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-xs font-semibold text-gray-700 mb-1 uppercase">
              Matching
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">
              Same SKU or model
            </div>
            <p className="text-xs text-gray-600">
              We look at model numbers and specific variants, not just names.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-xs font-semibold text-gray-700 mb-1 uppercase">
              Alerts
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">
              Real-time notifications
            </div>
            <p className="text-xs text-gray-600">
              Get notified when a better offer appears within your return window.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Recent opportunities</h2>
            <p className="text-xs text-gray-500">Where you could pay less for the same item</p>
          </div>
          <div className="text-xs text-gray-500">
            {loading ? 'Loading...' : `${opportunities.length} saved alerts`}
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            Checking your past scans...
          </div>
        ) : opportunities.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No cross-retailer savings detected yet. Run a scan to compare prices.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="px-6 py-4 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Store className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Better price at {opp.retailer}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span>You paid</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>New price</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(opp.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">You paid</div>
                    <div className="font-medium text-gray-900">
                      {opp.original_price ? `$${opp.original_price.toFixed(2)}` : '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Best offer</div>
                    <div className="font-medium text-gray-900">
                      {opp.better_price ? `$${opp.better_price.toFixed(2)}` : '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Potential savings</div>
                    <div className="font-semibold text-teal-600">
                      {opp.savings ? `$${opp.savings.toFixed(2)}` : '—'}
                    </div>
                  </div>
                  {opp.url && (
                    <div className="text-right">
                      <a
                        href={opp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-600 underline"
                      >
                        View offer
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
