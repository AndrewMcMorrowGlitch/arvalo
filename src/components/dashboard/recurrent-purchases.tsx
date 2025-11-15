'use client'

import React, { useEffect, useRef, useState } from 'react'
import { RefreshCw, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

type RecurrentPurchase = {
  id: string
  item_name: string
  store: string
  avg_interval_days: number
  last_purchase_date: string
  next_purchase_date: string
  product_url?: string | null
}

export function RecurrentPurchases() {
  const [items, setItems] = useState<RecurrentPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const knownIds = useRef<Set<string>>(new Set())
  const initialized = useRef(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/recurrent-purchases')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load recurrent purchases')
      }
      const list: RecurrentPurchase[] = data.items || []
      setItems(list)
      if (initialized.current) {
        list.forEach((item) => {
          if (!knownIds.current.has(item.id)) {
            knownIds.current.add(item.id)
            toast({
              title: 'Recurrent purchase detected',
              description: `We noticed you usually buy ${item.item_name}. Want to buy it again?`,
            })
          }
        })
      } else {
        list.forEach((item) => knownIds.current.add(item.id))
        initialized.current = true
      }
    } catch (err: any) {
      console.error('Failed to load recurrent purchases:', err)
      setError(err?.message || 'Failed to load recurrent purchases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleBuyAgain = (item: RecurrentPurchase) => {
    const query = encodeURIComponent(`${item.item_name} ${item.store}`)
    const url = item.product_url || `https://www.google.com/search?q=${query}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Recurrent purchases
          </h1>
          <p className="text-gray-600">
            Items you tend to buy on a predictable cadence.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
          <ShoppingBag className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          We haven’t detected any recurrent purchases yet.
          <div className="text-sm mt-2">
            Upload receipts and we’ll automatically remember what you buy regularly.
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div>Item</div>
            <div>Store</div>
            <div>Last purchase</div>
            <div>Next expected</div>
            <div className="text-right">Action</div>
          </div>
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 px-4 py-4 items-center text-sm"
              >
                <div className="font-medium text-gray-900">
                  {item.item_name}
                  <div className="text-xs text-gray-500">
                    Every {item.avg_interval_days} days
                  </div>
                </div>
                <div className="text-gray-700">{item.store || '—'}</div>
                <div className="text-gray-600">
                  {item.last_purchase_date
                    ? new Date(item.last_purchase_date).toLocaleDateString()
                    : '—'}
                </div>
                <div className="text-gray-600">
                  {item.next_purchase_date
                    ? new Date(item.next_purchase_date).toLocaleDateString()
                    : '—'}
                </div>
                <div className="text-right">
                  <Button
                    size="sm"
                    onClick={() => handleBuyAgain(item)}
                    className="bg-[#37322F] hover:bg-[#2A2520] text-white"
                  >
                    Buy again
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
