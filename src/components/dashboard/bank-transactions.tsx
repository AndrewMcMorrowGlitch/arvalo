'use client'

import React, { useEffect, useState } from 'react'
import { usePlaidLink } from 'react-plaid-link'

type Transaction = {
  id: string
  name: string
  merchant_name?: string | null
  amount: number
  date: string
  pending: boolean
  account_name?: string | null
  account_mask?: string | null
  institution_name?: string | null
  currency?: string | null
}

export function BankTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [creatingLinkToken, setCreatingLinkToken] = useState(false)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/plaid/transactions')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load transactions')
      }

      setTransactions(data.transactions || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load transactions')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    const initLinkToken = async () => {
      try {
        setCreatingLinkToken(true)
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create Plaid link token')
        }

        setLinkToken(data.link_token)
      } catch (err: any) {
        setError(err?.message || 'Failed to start bank connection')
      } finally {
        setCreatingLinkToken(false)
      }
    }

    initLinkToken()
  }, [])

  const { open, ready } = usePlaidLink({
    token: linkToken || '',
    onSuccess: async (publicToken, metadata) => {
      try {
        const institutionName = metadata.institution?.name

        const response = await fetch('/api/plaid/exchange-public-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public_token: publicToken,
            institution_name: institutionName,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to save Plaid connection')
        }

        await fetchTransactions()
      } catch (err: any) {
        setError(err?.message || 'Failed to save bank connection')
      }
    },
    onExit: (err) => {
      if (err) {
        console.error('Plaid Link exited with error:', err)
      }
    },
  })

  const handleConnectBank = () => {
    if (!linkToken || !ready) return
    open()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Recent transactions</h1>
          <p className="text-gray-600 text-sm">
            Transactions from your linked bank accounts over the last 30 days.
          </p>
        </div>
        <button
          onClick={handleConnectBank}
          disabled={creatingLinkToken || !linkToken || !ready}
          className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {creatingLinkToken ? 'Connecting…' : 'Connect bank'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600 text-sm">Loading your bank transactions…</p>
      ) : !transactions.length ? (
        <p className="text-gray-600 text-sm">
          No bank transactions found yet. Connect a bank account to see your recent activity.
        </p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500">
            <div className="col-span-3">Date</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-3">Account</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="grid grid-cols-12 gap-4 px-6 py-3 text-sm items-center"
              >
                <div className="col-span-3 text-gray-600">
                  {new Date(tx.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {tx.pending && (
                    <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
                <div className="col-span-4">
                  <div className="text-gray-900 font-medium truncate">
                    {tx.merchant_name || tx.name}
                  </div>
                  {tx.merchant_name && tx.merchant_name !== tx.name && (
                    <div className="text-xs text-gray-500 truncate">{tx.name}</div>
                  )}
                </div>
                <div className="col-span-3">
                  <div className="text-gray-900 text-sm truncate">
                    {tx.account_name || tx.institution_name || 'Account'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {tx.institution_name && (
                      <span>
                        {tx.institution_name}
                        {tx.account_mask && ` • •••• ${tx.account_mask}`}
                      </span>
                    )}
                    {!tx.institution_name && tx.account_mask && (
                      <span>•••• {tx.account_mask}</span>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-right font-medium">
                  <span className={tx.amount < 0 ? 'text-emerald-600' : 'text-gray-900'}>
                    {tx.amount < 0 ? '-' : '-'}
                    {tx.currency || 'USD'} {Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
