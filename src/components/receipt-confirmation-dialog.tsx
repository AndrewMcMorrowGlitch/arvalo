'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, X, CheckCircle2 } from 'lucide-react'

interface ReceiptItem {
  name: string
  price: number
  quantity: number
}

interface ReceiptData {
  merchant: string
  date: string
  total: number
  currency: string
  items: ReceiptItem[]
  confidence: number
}

interface SavedPurchaseSummary {
  id: string
  merchant_name: string
  total_amount: number
  items?: ReceiptItem[]
}

interface GiftCardOption {
  id: string
  retailer: string
  current_balance: number
  status: string
}

interface ReceiptConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptData: ReceiptData | null
  onConfirm: (
    data: ReceiptData,
    options?: { giftCardUsage?: { gift_card_id: string; amount: number } | null },
  ) => Promise<SavedPurchaseSummary | null | void>
  onCancel: () => void
  onSuccess?: (purchase: SavedPurchaseSummary) => void
  giftCards?: GiftCardOption[]
}

export function ReceiptConfirmationDialog({
  open,
  onOpenChange,
  receiptData,
  onConfirm,
  onCancel,
  onSuccess,
  giftCards = [],
}: ReceiptConfirmationDialogProps) {
  const [editedData, setEditedData] = useState<ReceiptData | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedGiftCardId, setSelectedGiftCardId] = useState('')
  const [giftCardAmount, setGiftCardAmount] = useState('')
  const [giftCardError, setGiftCardError] = useState<string | null>(null)

  // Initialize edited data when receipt data changes
  useEffect(() => {
    if (receiptData && !editedData) {
      setEditedData({ ...receiptData })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptData])

  const handleMerchantChange = (value: string) => {
    if (editedData) {
      setEditedData({ ...editedData, merchant: value })
    }
  }

  const handleDateChange = (value: string) => {
    if (editedData) {
      setEditedData({ ...editedData, date: value })
    }
  }

  const handleTotalChange = (value: string) => {
    if (editedData) {
      const num = parseFloat(value)
      if (!isNaN(num)) {
        setEditedData({ ...editedData, total: num })
      }
    }
  }

  const handleItemChange = (index: number, field: keyof ReceiptItem, value: string) => {
    if (editedData) {
      const newItems = [...editedData.items]
      if (field === 'name') {
        newItems[index] = { ...newItems[index], name: value }
      } else if (field === 'price' || field === 'quantity') {
        const num = parseFloat(value)
        if (!isNaN(num)) {
          newItems[index] = { ...newItems[index], [field]: num }
        }
      }
      setEditedData({ ...editedData, items: newItems })
    }
  }

  const handleAddItem = () => {
    if (editedData) {
      setEditedData({
        ...editedData,
        items: [...editedData.items, { name: '', price: 0, quantity: 1 }],
      })
    }
  }

  const handleRemoveItem = (index: number) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        items: editedData.items.filter((_, i) => i !== index),
      })
    }
  }

  const selectedGiftCard = giftCards.find(card => card.id === selectedGiftCardId)

  const resetGiftCardState = () => {
    setSelectedGiftCardId('')
    setGiftCardAmount('')
    setGiftCardError(null)
  }

  const handleConfirm = async () => {
    if (!editedData) return

    let giftCardUsage: { gift_card_id: string; amount: number } | null = null
    if (selectedGiftCardId) {
      if (!selectedGiftCard) {
        setGiftCardError('Selected gift card not found')
        return
      }
      const amount = parseFloat(giftCardAmount)
      if (isNaN(amount) || amount <= 0) {
        setGiftCardError('Enter a valid amount to apply')
        return
      }
      if (amount > selectedGiftCard.current_balance + 0.001) {
        setGiftCardError('Amount exceeds available gift card balance')
        return
      }
      if (amount > editedData.total + 0.001) {
        setGiftCardError('Amount cannot exceed the receipt total')
        return
      }
      giftCardUsage = {
        gift_card_id: selectedGiftCard.id,
        amount,
      }
    }

    setSaving(true)
    try {
      const savedPurchase = await onConfirm(editedData, { giftCardUsage })
      setSuccess(true)
      if (savedPurchase && onSuccess) {
        onSuccess(savedPurchase)
      }
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (error) {
      console.error('Failed to save receipt:', error)
      alert('Failed to save receipt. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setEditedData(null)
      setSuccess(false)
      onCancel()
      resetGiftCardState()
    }, 300)
  }

  if (!editedData) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#37322F] font-sans">Confirm Receipt</DialogTitle>
          <DialogDescription className="text-[#605A57] font-sans">
            Review and edit the extracted information before saving
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-[#16A34A] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#37322F] mb-2 font-sans">
              Receipt saved successfully!
            </h3>
            <p className="text-[#605A57] font-sans">Adding to your dashboard...</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {/* Confidence Score */}
              <div className="bg-[rgba(55,50,47,0.05)] p-3 rounded-lg">
                <p className="text-sm text-[#605A57] font-sans">
                  Extraction confidence:{' '}
                  <span
                    className={`font-semibold ${
                      editedData.confidence > 0.8
                        ? 'text-[#16A34A]'
                        : editedData.confidence > 0.6
                        ? 'text-[#2563EB]'
                        : 'text-[#EA580C]'
                    }`}
                  >
                    {(editedData.confidence * 100).toFixed(0)}%
                  </span>
                </p>
                <p className="text-xs text-[#605A57] mt-1 font-sans">
                  Please review and correct any errors below
                </p>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="merchant" className="text-[#37322F] font-sans">
                    Merchant Name *
                  </Label>
                  <Input
                    id="merchant"
                    value={editedData.merchant}
                    onChange={(e) => handleMerchantChange(e.target.value)}
                    className="border-[#E0DEDB] focus:border-[#37322F] focus:ring-[#37322F] font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-[#37322F] font-sans">
                    Purchase Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={editedData.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="border-[#E0DEDB] focus:border-[#37322F] focus:ring-[#37322F] font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total" className="text-[#37322F] font-sans">
                    Total Amount ({editedData.currency}) *
                  </Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    value={editedData.total}
                    onChange={(e) => handleTotalChange(e.target.value)}
                    className="border-[#E0DEDB] focus:border-[#37322F] focus:ring-[#37322F] font-sans"
                  />
                </div>
              </div>

              {giftCards.length > 0 && (
                <div className="border border-[#E0DEDB] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[#37322F] font-sans">Apply gift card (optional)</Label>
                    {selectedGiftCardId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={resetGiftCardState}
                        className="text-[#605A57]"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <Select
                    value={selectedGiftCardId}
                    onValueChange={(value) => {
                      setGiftCardError(null)
                      setSelectedGiftCardId(value)
                      const card = giftCards.find((card) => card.id === value)
                      if (card) {
                        const defaultAmount = Math.min(card.current_balance, editedData.total)
                        setGiftCardAmount(defaultAmount.toFixed(2))
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a card to apply" />
                    </SelectTrigger>
                    <SelectContent>
                      {giftCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.retailer} • ${card.current_balance.toFixed(2)} ({card.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedGiftCardId && selectedGiftCard && (
                    <div className="space-y-2">
                      <Label htmlFor="gift-card-amount" className="text-[#37322F] font-sans">
                        Amount to apply
                      </Label>
                      <Input
                        id="gift-card-amount"
                        type="number"
                        min={0.01}
                        step="0.01"
                        value={giftCardAmount}
                        onChange={(e) => {
                          setGiftCardError(null)
                          setGiftCardAmount(e.target.value)
                        }}
                        className="border-[#E0DEDB] focus:border-[#37322F] focus:ring-[#37322F] font-sans"
                      />
                      <p className="text-xs text-[#605A57] font-sans">
                        Available balance: ${selectedGiftCard.current_balance.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {giftCardError && (
                    <p className="text-xs text-[#B44D12] font-sans">{giftCardError}</p>
                  )}
                </div>
              )}

              {/* Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[#37322F] font-sans">Items</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    className="border-[#37322F] text-[#37322F] hover:bg-[#37322F] hover:text-white font-sans"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {editedData.items.map((item, index) => (
                    <div
                      key={index}
                      className="border border-[#E0DEDB] rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            className="border-[#E0DEDB] focus:border-[#37322F] focus:ring-[#37322F] font-sans text-sm"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Price"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                              className="border-[#E0DEDB] focus:border-[#37322F] focus:ring-[#37322F] font-sans text-sm"
                            />
                            <Input
                              type="number"
                              step="1"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(index, 'quantity', e.target.value)
                              }
                              className="border-[#E0DEDB] focus:border-[#37322F] focus:ring-[#37322F] font-sans text-sm"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="text-[#B44D12] hover:text-[#EA580C] hover:bg-[#FEF3F2]"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={saving}
                className="border-[#E0DEDB] text-[#605A57] hover:bg-[rgba(55,50,47,0.05)] font-sans"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={saving || !editedData.merchant || !editedData.date}
                className="bg-[#37322F] hover:bg-[#2A2520] text-white font-sans"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save to Dashboard'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
