'use client'

import React, { useEffect, useState } from 'react'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Purchase = {
  id: string
  merchant_name: string
  total_amount: number
  purchase_date: string
}

type CalendarPurchase = {
  date: Date
  name: string
  price: number
}

function findRecurringMerchants(purchases: Purchase[]): Set<string> {
  const dayMs = 1000 * 60 * 60 * 24
  const now = Date.now()
  const cutoff = now - 180 * dayMs // look at last ~6 months

  const groups = new Map<string, number[]>()

  for (const p of purchases) {
    const date = new Date(p.purchase_date)
    const time = date.getTime()
    if (isNaN(time) || time < cutoff) continue

    const key = (p.merchant_name || '').trim()
    if (!key) continue

    const arr = groups.get(key) || []
    arr.push(time)
    groups.set(key, arr)
  }

  const recurring = new Set<string>()

  groups.forEach((times, key) => {
    times.sort((a, b) => a - b)
    if (times.length < 3) return

    const intervals: number[] = []
    for (let i = 0; i < times.length - 1; i++) {
      intervals.push((times[i + 1] - times[i]) / dayMs)
    }

    const avgInterval =
      intervals.reduce((sum, d) => sum + d, 0) / intervals.length

    // Mark as recurring if there is at least one window of
    // three purchases within 60 days and the average interval
    // between visits is around monthly or more frequent.
    let hasDenseWindow = false
    for (let i = 0; i <= times.length - 3; i++) {
      const spanDays = (times[i + 2] - times[i]) / dayMs
      if (spanDays <= 60) {
        hasDenseWindow = true
        break
      }
    }

    if (hasDenseWindow && avgInterval <= 30) {
      recurring.add(key)
    }
  })

  return recurring
}

export function RecurrentPurchases() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [purchases, setPurchases] = useState<CalendarPurchase[]>([])
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

        const apiPurchases = (data.purchases || []) as Purchase[]
        const recurringMerchants = findRecurringMerchants(apiPurchases)

        const mapped: CalendarPurchase[] = apiPurchases
          .filter(
            (p) =>
              p.purchase_date &&
              recurringMerchants.has((p.merchant_name || '').trim()),
          )
          .map((p) => ({
            date: new Date(p.purchase_date),
            name: p.merchant_name,
            price: p.total_amount,
          }))

        setPurchases(mapped)
      } catch (err: any) {
        console.error('Error loading purchases for calendar:', err)
        setError(err?.message || 'Failed to load purchases for calendar')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const recommendations = [
    {
      product: 'Organic Almond Milk',
      reason: 'Alternative to regular milk',
      price: '$5.49',
      image:
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&q=80',
    },
    {
      product: 'Single Origin Coffee Beans',
      reason: 'Upgrade your daily brew',
      price: '$18.99',
      image:
        'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=100&q=80',
    },
    {
      product: 'Eco Laundry Detergent',
      reason: 'Better for clothes & planet',
      price: '$14.99',
      image:
        'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=100&q=80',
    },
    {
      product: 'French Press Coffee',
      reason: 'Perfect with your coffee beans',
      price: '$29.99',
      image:
        'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=100&q=80',
    },
  ]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const getPurchasesForDay = (day: number) => {
    return purchases.filter(
      (p) =>
        p.date.getDate() === day &&
        p.date.getMonth() === currentMonth.getMonth() &&
        p.date.getFullYear() === currentMonth.getFullYear(),
    )
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const hasAnyRecurring = purchases.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Recurrent purchases
        </h1>
        <p className="text-gray-600">
          Calendar of merchants you buy from on a repeating pattern
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                  ),
                )
              }
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                  ),
                )
              }
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-[11px] font-medium text-gray-500 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {blanks.map((blank) => (
            <div key={`blank-${blank}`} />
          ))}

          {days.map((day) => {
            const dayPurchases = getPurchasesForDay(day)
            const hasPurchases = dayPurchases.length > 0
            const capped = dayPurchases.slice(0, 3)
            const extra = dayPurchases.length - capped.length

            const isToday =
              day === new Date().getDate() &&
              currentMonth.getMonth() === new Date().getMonth() &&
              currentMonth.getFullYear() === new Date().getFullYear()

            return (
              <div
                key={day}
                className={cn(
                  'h-24 rounded-md border flex flex-col px-1.5 py-1 text-[11px] relative bg-white',
                  hasPurchases && 'bg-indigo-50/60 border-indigo-100',
                  !hasPurchases && 'border-gray-200',
                  isToday && 'ring-1 ring-indigo-500',
                )}
              >
                <div className="flex items-start justify-between mb-0.5">
                  <span className="text-[10px] font-medium text-gray-500">
                    {day}
                  </span>
                  {hasPurchases && (
                    <span className="text-[9px] px-1 py-0.5 rounded-full bg-indigo-600 text-white font-medium">
                      {dayPurchases.length}
                    </span>
                  )}
                </div>

                <div className="flex-1 w-full overflow-hidden space-y-0.5">
                  {capped.map((p, idx) => (
                    <div
                      key={idx}
                      className="truncate text-[11px] text-gray-800 leading-tight"
                    >
                      {p.name}{' '}
                      <span className="text-[10px] text-gray-500">
                        ${p.price.toFixed(0)}
                      </span>
                    </div>
                  ))}
                  {extra > 0 && (
                    <div className="text-[10px] text-gray-500">
                      +{extra} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {!loading && !hasAnyRecurring && (
          <div className="mt-4 text-xs text-gray-500">
            No recurring merchants detected yet. Once you have at least three
            purchases from the same store within a couple of months, they&apos;ll
            start showing up here.
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Smart suggestions
            </h2>
            <p className="text-xs text-gray-500">
              Based on your recurrent purchases
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((item, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-lg p-4 flex gap-3 border border-gray-200"
            >
              <div className="w-12 h-12 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.product}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {item.product}
                </div>
                <div className="text-xs text-gray-500 mb-2">{item.reason}</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">
                    {item.price}
                  </div>
                  <Button size="sm" variant="outline">
                    Add to plan
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
