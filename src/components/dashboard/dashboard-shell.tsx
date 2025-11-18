'use client'

import React, { useState } from 'react'
import {
  DollarSign,
  LogOut,
  TrendingUp,
  Package,
  AlertCircle,
  Gift,
  CreditCard,
  Shield,
  Search,
  Menu,
  RotateCcw,
  BarChart3,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'

import { RecurrentPurchases } from '@/components/dashboard/recurrent-purchases'
import { GiftCards } from '@/components/dashboard/gift-cards'
import { PriceDrops } from '@/components/dashboard/price-drops'
import { ReturnTracking } from '@/components/dashboard/return-tracking'
import { Subscriptions } from '@/components/dashboard/subscriptions'
import { CrossRetailer } from '@/components/dashboard/cross-retailer'
import { DuplicateCharges } from '@/components/dashboard/duplicate-charges'
import { WarrantyTracking } from '@/components/dashboard/warranty-tracking'
import { AddReceipt } from '@/components/add-receipt'
import { BankTransactions } from '@/components/dashboard/bank-transactions'

export type DashboardStats = {
  realizedSavings: number
  potentialSavings: number
  totalSavings: number
  priceDrops: number
  trackedItems: number
  expiringReturns: number
  activeOpportunities: number
}

type DashboardSection =
  | 'overview'
  | 'recurrent'
  | 'price-drops'
  | 'returns'
  | 'subscriptions'
  | 'gift-cards'
  | 'cross-retailer'
  | 'duplicate'
  | 'warranty'
  | 'transactions'
  | 'profile'

type DashboardShellProps = {
  userFirstName?: string | null
  userEmail?: string | null
  userId?: string
  forwardEmail?: string | null
  stats: DashboardStats
  initialSection?: DashboardSection
}

export function DashboardShell({
  userFirstName,
  userEmail,
  userId,
  forwardEmail,
  stats,
  initialSection = 'overview',
}: DashboardShellProps) {
  const [activeSection, setActiveSection] = useState<DashboardSection>(initialSection)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [showAddReceipt, setShowAddReceipt] = useState(false)

  const navItems = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'recurrent' as const, label: 'Recurrent purchases', icon: Package },
    { id: 'price-drops' as const, label: 'Price drops', icon: TrendingUp },
    { id: 'returns' as const, label: 'Return tracking', icon: RotateCcw },
    { id: 'subscriptions' as const, label: 'Subscriptions', icon: CreditCard },
    { id: 'gift-cards' as const, label: 'Gift cards', icon: Gift },
    { id: 'cross-retailer' as const, label: 'Cross-retailer', icon: Search },
    { id: 'duplicate' as const, label: 'Duplicate charges', icon: AlertCircle },
    { id: 'warranty' as const, label: 'Warranty tracking', icon: Shield },
    { id: 'transactions' as const, label: 'Recent transactions', icon: DollarSign },
  ]

  const handleImportFromGmail = async () => {
    try {
      setImporting(true)
      setImportMessage(null)

      const response = await fetch('/api/gmail/import', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import receipts from Gmail')
      }

      setImportMessage(
        `Imported ${data.imported || 0} receipt${(data.imported || 0) === 1 ? '' : 's'} from Gmail.`,
      )
    } catch (error: any) {
      setImportMessage(
        error?.message || 'Failed to import receipts from Gmail. Please try again.',
      )
    } finally {
      setImporting(false)
    }
  }

  const quickActions = [
    {
      label: 'Price drops',
      value: stats.potentialSavings > 0 ? `$${Math.round(stats.potentialSavings)}` : '$0',
      items: `${stats.priceDrops} item${stats.priceDrops === 1 ? '' : 's'}`,
      section: 'price-drops' as const,
      icon: DollarSign,
    },
    {
      label: 'Expiring returns',
      value: `${stats.expiringReturns} return${stats.expiringReturns === 1 ? '' : 's'}`,
      items: 'Within 7 days',
      section: 'returns' as const,
      icon: AlertCircle,
    },
    {
      label: 'Unused gift cards',
      value: '$0',
      items: 'Coming soon',
      section: 'gift-cards' as const,
      icon: Gift,
    },
    {
      label: 'Low-use subscriptions',
      value: '$0',
      items: 'Coming soon',
      section: 'subscriptions' as const,
      icon: CreditCard,
    },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691811bbeb85f638ca84be56/3a657b16e_image.png"
              alt="Arvalo"
              className="h-6"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <button
              type="button"
              className="flex items-center gap-3 px-2 py-2 mb-2 w-full rounded-md hover:bg-gray-50 text-left"
              onClick={() => {
                setActiveSection('profile')
                setSidebarOpen(false)
              }}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                {userFirstName?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {userFirstName ? `Hey, ${userFirstName}` : 'Your account'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  View profile & settings
                </div>
              </div>
            </button>
            <form action="/api/auth/signout" method="post">
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 lg:px-8">
          <button
            className="lg:hidden mr-4 text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 flex justify-end items-center gap-3">
            <a
              href="/api/gmail/connect"
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Connect Gmail
            </a>
            <Button
              size="sm"
              variant="outline"
              onClick={handleImportFromGmail}
              disabled={importing}
            >
              {importing ? 'Importing…' : 'Import receipts'}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {activeSection === 'overview' && (
                  <div className="space-y-8">
                    {/* Header */}
                    <div>
                      <h1 className="text-3xl font-semibold text-gray-900 mb-1">
                        Welcome back{userFirstName ? `, ${userFirstName}` : ''}
                      </h1>
                      <p className="text-gray-600">
                        Here&apos;s what&apos;s happening with your purchases today.
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                          </div>
                          {stats.totalSavings > 0 && (
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                              +{Math.round(
                                (stats.totalSavings / Math.max(stats.realizedSavings, 1)) *
                                  100,
                              )}
                              %
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Total recovered</div>
                        <div className="text-2xl font-semibold text-gray-900">
                          ${stats.totalSavings.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ${stats.realizedSavings.toFixed(2)} realized, $
                          {stats.potentialSavings.toFixed(2)} potential
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          Active opportunities
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.activeOpportunities}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Across all features
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Tracked items</div>
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.trackedItems}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Monitored daily
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          </div>
                          {stats.expiringReturns > 0 && (
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Needs attention</div>
                        <div className="text-2xl font-semibold text-gray-900">
                          {stats.expiringReturns}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Expiring soon</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="px-6 py-5 border-b border-gray-200">
                        <h2 className="text-base font-semibold text-gray-900">
                          Quick actions
                        </h2>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {quickActions.map((action, i) => {
                            const Icon = action.icon
                            return (
                              <button
                                key={i}
                                onClick={() => setActiveSection(action.section)}
                                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-5 text-left transition-all group"
                              >
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <div className="text-sm font-medium text-gray-700">
                                    {action.label}
                                  </div>
                                </div>
                                <div className="flex items-end justify-between">
                                  <div className="text-2xl font-semibold text-gray-900">
                                    {action.value}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {action.items}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Manual Receipt Entry */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-base font-semibold text-gray-900">
                            Manually add a receipt
                          </h2>
                          <p className="text-sm text-gray-600">
                            Paste receipt text or upload a photo to start tracking refunds and
                            price drops instantly.
                          </p>
                        </div>
                        <Button size="sm" onClick={() => setShowAddReceipt(prev => !prev)}>
                          {showAddReceipt ? 'Hide form' : 'Add receipt'}
                        </Button>
                      </div>
                      {showAddReceipt && (
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                          <AddReceipt />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeSection === 'recurrent' && <RecurrentPurchases />}
                {activeSection === 'gift-cards' && <GiftCards />}
                {activeSection === 'price-drops' && <PriceDrops />}
                {activeSection === 'returns' && <ReturnTracking />}
                {activeSection === 'subscriptions' && <Subscriptions />}
                {activeSection === 'cross-retailer' && <CrossRetailer />}
                {activeSection === 'duplicate' && <DuplicateCharges />}
                {activeSection === 'warranty' && <WarrantyTracking />}
                {activeSection === 'transactions' && <BankTransactions />}
                {activeSection === 'profile' && (
                  <div className="space-y-8">
                    <div className="border-l-4 border-gray-200 pl-4">
                      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                        Profile
                      </h1>
                      <p className="text-sm text-gray-600">
                        Your account details and connected data.
                      </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
                        <h2 className="text-sm font-semibold text-gray-900">
                          Account
                        </h2>
                        <div className="space-y-2 text-sm text-gray-700">
                          <div>
                            <div className="text-xs uppercase text-gray-500">
                              Email
                            </div>
                            <div>{userEmail || 'Not set'}</div>
                          </div>
                          <div>
                            <div className="text-xs uppercase text-gray-500">
                              Name
                            </div>
                            <div>{userFirstName || 'Not set'}</div>
                          </div>
                          <div>
                            <div className="text-xs uppercase text-gray-500">
                              User ID
                            </div>
                            <div className="font-mono text-[11px] text-gray-500 break-all">
                              {userId}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
                        <h2 className="text-sm font-semibold text-gray-900">
                          Email forwarding
                        </h2>
                        <div className="text-sm text-gray-700">
                          <div className="text-xs uppercase text-gray-500">
                            Forwarding address
                          </div>
                          <div>{forwardEmail || 'Not configured yet'}</div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Forward receipts to this address to have FairVal automatically scan and track them.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
