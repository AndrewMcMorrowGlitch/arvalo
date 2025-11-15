'use client'

import React, { useEffect, useState } from 'react'
import { TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RefundDialog } from '@/components/refund-dialog'

type PriceTracking = {
  id: string
  current_price: number | null
  price_drop_detected: boolean | null
  price_drop_amount: number | null
}

type Purchase = {
  id: string
  merchant_name: string
  purchase_date: string
  total_amount: number
  currency: string
  items: any[]
  retailers?: {
    has_price_match: boolean
    price_match_days: number
  }
  price_tracking?: PriceTracking[] | null
}

type PriceDropItem = {
  id: string
  product: string
  original: number
  current: number
  savings: number
  store: string
  purchaseDate: string
  purchase: Purchase
}

export function PriceDrops() {
  const [drops, setDrops] = useState<PriceDropItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)

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

        const items: PriceDropItem[] = []
        for (const p of purchases) {
          if (!p.price_tracking || !Array.isArray(p.price_tracking)) continue
          for (const t of p.price_tracking) {
            if (!t.price_drop_detected || !t.price_drop_amount) continue
            if (t.current_price == null) continue

            items.push({
              id: `${p.id}-${t.id}`,
              product: `${p.merchant_name} purchase`,
              original: p.total_amount,
              current: t.current_price,
              savings: t.price_drop_amount,
              store: p.merchant_name,
              purchaseDate: new Date(p.purchase_date).toLocaleDateString(),
              purchase: p,
            })
          }
        }

        setDrops(items)
      } catch (err: any) {
        console.error('Error loading price drops:', err)
        setError(err?.message || 'Failed to load price drops')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const totalSavings = drops.reduce((sum, d) => sum + d.savings, 0)

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-indigo-500 pl-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Price Drops</h1>
        <p className="text-gray-600">
          Automatic refund opportunities detected from your tracked purchases
        </p>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-gray-900/10 shadow-lg">
        <div className="text-sm text-gray-600 mb-1">Available to Claim</div>
        <div className="text-3xl font-bold text-gray-900">
          ${totalSavings.toFixed(2)}
        </div>
        <div className="text-xs text-emerald-600 font-medium mt-1">
          {loading
            ? 'Loading price drops...'
            : drops.length === 0
              ? 'No active price drops detected yet.'
              : `Across ${drops.length} item${drops.length === 1 ? '' : 's'}`}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {drops.map((drop) => (
          <div
            key={drop.id}
            className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-gray-900/10 shadow-lg"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex-shrink-0 border-2 border-gray-900/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {drop.product}
                </h3>
                <div className="text-sm text-gray-500 mb-3 pb-3 border-b border-gray-900/10">
                  {drop.store} • Purchased {drop.purchaseDate}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="text-sm">
                    <span className="line-through text-gray-400">
                      ${drop.original.toFixed(2)}
                    </span>
                    <span className="mx-2">→</span>
                    <span className="font-bold text-gray-900">
                      ${drop.current.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50/80 px-3 py-1.5 rounded-lg border-2 border-emerald-200">
                    <TrendingDown className="w-4 h-4" />
                    ${drop.savings.toFixed(2)} saved
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-emerald-50/80 backdrop-blur-sm text-emerald-700 text-xs font-medium px-3 py-2 rounded-lg border-2 border-emerald-200">
                    Eligible for refund based on price drop
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-2 border-emerald-600"
                    onClick={() => {
                      setSelectedPurchase(drop.purchase)
                      setRefundDialogOpen(true)
                    }}
                  >
                    Start refund
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPurchase && (
        <RefundDialog
          open={refundDialogOpen}
          onOpenChange={(open) => {
            setRefundDialogOpen(open)
            if (!open) {
              setSelectedPurchase(null)
            }
          }}
          purchase={selectedPurchase}
        />
      )}
    </div>
  )
}
