'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Gift, CreditCard, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AddGiftCardDialog } from '@/components/add-gift-card-dialog'
import { MakePurchaseDialog } from '@/components/make-purchase-dialog'
import { PurchaseHistory } from '@/components/purchase-history'
import { cn } from '@/lib/utils'

interface GiftCard {
  id: string;
  retailer: string;
  current_balance: number;
  initial_balance: number;
  created_at: string;
  status: string;
}

export function GiftCards() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [activePurchaseCard, setActivePurchaseCard] = useState<GiftCard | null>(null);
  const [selectedCardForHistory, setSelectedCardForHistory] = useState<GiftCard | null>(null);

  const fetchGiftCards = useCallback(async () => {
    if (cards.length === 0) {
      setIsLoading(true);
    }
    try {
      const response = await fetch('/api/gift-cards');
      if (response.ok) {
        const data = await response.json();
        setCards(data);
        // If a card was selected, update its data
        if (selectedCardForHistory) {
          const updatedCard = data.find((c: GiftCard) => c.id === selectedCardForHistory.id);
          setSelectedCardForHistory(updatedCard || null);
        }
      } else {
        console.error('Failed to fetch gift cards');
      }
    } catch (error) {
      console.error('Error fetching gift cards:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cards.length, selectedCardForHistory]);

  useEffect(() => {
    fetchGiftCards();
  }, [fetchGiftCards]);

  const handleOpenPurchaseDialog = (card: GiftCard) => {
    setActivePurchaseCard(card);
    setIsPurchaseDialogOpen(true);
  };

  const handleCardClick = (card: GiftCard) => {
    if (selectedCardForHistory?.id === card.id) {
      setSelectedCardForHistory(null); // Toggle off if clicking the same card
    } else {
      setSelectedCardForHistory(card);
    }
  };

  const totalBalance = cards.reduce((sum, card) => sum + card.current_balance, 0);

  if (isLoading) {
    return <GiftCardSkeleton />;
  }

  return (
    <>
      <AddGiftCardDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onCardAdded={fetchGiftCards}
      />
      {activePurchaseCard && (
        <MakePurchaseDialog
          isOpen={isPurchaseDialogOpen}
          onOpenChange={setIsPurchaseDialogOpen}
          onPurchaseComplete={fetchGiftCards}
          giftCardId={activePurchaseCard.id}
          currentBalance={activePurchaseCard.current_balance}
          retailer={activePurchaseCard.retailer}
        />
      )}
      <div className="space-y-6">
        <div className="border-l-4 border-amber-500 pl-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gift Cards</h1>
          <p className="text-gray-600">
            Track and use your stored value before it expires
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide opacity-80">
                    Total balance
                  </div>
                  <div className="text-2xl font-bold">
                    ${totalBalance.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-xs bg-black/10 px-3 py-1 rounded-full">
                {cards.length} cards tracked
              </div>
            </div>
            <div className="text-xs opacity-80">
              Don&apos;t leave money on the table — we&apos;ll remind you before
              your balances expire.
            </div>
          </div>
          {/* Other summary cards remain static */}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Card details
              </h2>
              <p className="text-xs text-gray-500">
                Click on a card to see its purchase history
              </p>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setIsAddDialogOpen(true)}>
              <CreditCard className="w-3 h-3" />
              Add card
            </Button>
          </div>

          <div className="divide-y divide-gray-100">
            {cards.map((card) => (
              <div
                key={card.id}
                className={cn(
                  "px-6 py-4 flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50",
                  selectedCardForHistory?.id === card.id && "bg-gray-50"
                )}
                onClick={() => handleCardClick(card)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {card.retailer}
                    </div>
                    <div className="text-xs text-gray-500">
                      Added on {new Date(card.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Current balance</div>
                    <div className="font-semibold text-gray-900">
                      ${card.current_balance.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Original</div>
                    <div className="font-medium text-gray-900">
                      ${card.initial_balance.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Status</div>
                    <div className="font-medium text-gray-900">
                      {card.status}
                    </div>
                  </div>
                   <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenPurchaseDialog(card); }} disabled={card.status !== 'active'}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedCardForHistory && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Purchase History for {selectedCardForHistory.retailer} Card</h2>
            <PurchaseHistory giftCardId={selectedCardForHistory.id} />
          </div>
        )}
      </div>
    </>
  )
}

function GiftCardSkeleton() {
  // ... skeleton remains the same
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-amber-500 pl-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48 mt-1" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

