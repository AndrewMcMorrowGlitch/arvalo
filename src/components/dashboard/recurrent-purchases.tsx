'use client'

import React, { useState } from 'react'
import {
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimatePresence, motion } from 'framer-motion'

export function RecurrentPurchases() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10))
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null)
  const [editingPurchase, setEditingPurchase] = useState<any | null>(null)
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  const purchases = [
    { date: new Date(2025, 10, 3), name: 'Organic Milk', price: 4.99, type: 'past' },
    { date: new Date(2025, 10, 10), name: 'Organic Milk', price: 4.99, type: 'past' },
    { date: new Date(2025, 10, 17), name: 'Organic Milk', price: 4.99, type: 'planned' },
    { date: new Date(2025, 10, 24), name: 'Organic Milk', price: 4.99, type: 'planned' },
    { date: new Date(2025, 10, 5), name: 'Coffee Beans', price: 15.99, type: 'past' },
    { date: new Date(2025, 10, 19), name: 'Coffee Beans', price: 15.99, type: 'planned' },
    { date: new Date(2025, 10, 1), name: 'Laundry Detergent', price: 12.99, type: 'past' },
    { date: new Date(2025, 10, 22), name: 'Laundry Detergent', price: 12.99, type: 'planned' },
  ]

  const recommendations = [
    {
      product: 'Organic Almond Milk',
      reason: 'Alternative to regular milk',
      price: '$5.49',
      image:
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&q=80',
    },
    {
      product: 'Eco-Friendly Detergent',
      reason: 'Similar to your laundry choice',
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

  const handleSaveEdit = () => {
    console.log('Saving purchase:', editingPurchase)
    setEditingPurchase(null)
    setSelectedPurchase(null)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Recurrent purchases
        </h1>
        <p className="text-gray-600">
          AI-powered tracking and buy cycle recommendations
        </p>
      </div>

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

        <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-500 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {blanks.map((blank) => (
            <div key={`blank-${blank}`} />
          ))}

          {days.map((day) => {
            const dayPurchases = getPurchasesForDay(day)
            const hasPast = dayPurchases.some((p) => p.type === 'past')
            const hasPlanned = dayPurchases.some((p) => p.type === 'planned')

            return (
              <button
                key={day}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() =>
                  dayPurchases.length > 0 &&
                  setSelectedPurchase({
                    day,
                    purchases: dayPurchases,
                  })
                }
                className="aspect-square rounded-lg border border-gray-200 flex flex-col items-center justify-center text-xs relative group hover:border-gray-400 transition-all"
              >
                <div className="font-medium text-gray-900 mb-1">{day}</div>
                <div className="flex gap-0.5">
                  {hasPast && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  )}
                  {hasPlanned && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>
                {dayPurchases.length > 0 && hoveredDay === day && (
                  <div className="absolute inset-x-0 -bottom-1 flex justify-center pointer-events-none">
                    <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded-full shadow-lg">
                      {dayPurchases.length} recurring
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
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

      {/* Modal for selected purchase */}
      <AnimatePresence>
        {selectedPurchase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Purchases on {selectedPurchase.day}{' '}
                      {monthNames[currentMonth.getMonth()]}
                    </div>
                    <div className="text-xs text-gray-500">
                      Manage your recurrent items
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPurchase(null)
                    setEditingPurchase(null)
                  }}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {selectedPurchase.purchases.map((purchase: any, index: number) => (
                  <button
                    key={index}
                    onClick={() =>
                      setEditingPurchase({
                        ...purchase,
                        day: selectedPurchase.day,
                      })
                    }
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {purchase.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {purchase.type === 'past'
                          ? 'Previous purchase'
                          : 'Upcoming purchase'}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      ${purchase.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>

              {editingPurchase && (
                <div className="border-t border-gray-200 p-4 bg-gray-50/80">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        Edit recurrent purchase
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {editingPurchase.name}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Every 2 weeks • Groceries
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Next delivery
                      </label>
                      <button className="w-full h-9 px-3 rounded-md border border-gray-300 text-left text-sm flex items-center justify-between bg-white hover:bg-gray-50">
                        <span>
                          {monthNames[currentMonth.getMonth()]}{' '}
                          {editingPurchase.day}, {currentMonth.getFullYear()}
                        </span>
                        <Calendar className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Amount
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">$</span>
                        <Input
                          defaultValue={editingPurchase.price}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Check className="w-3 h-3" />
                      <span>Notify me 2 days before delivery</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPurchase(null)
                          setSelectedPurchase(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

