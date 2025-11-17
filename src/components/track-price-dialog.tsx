'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
import { CheckCircle2, Loader2 } from 'lucide-react'

interface TrackPriceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseId: string
  merchantName: string
  productName?: string
  totalAmount: number
}

export function TrackPriceDialog({
  open,
  onOpenChange,
  purchaseId,
  merchantName,
  productName,
  totalAmount,
}: TrackPriceDialogProps) {
  const [tracking, setTracking] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [autoFailed, setAutoFailed] = useState(false)
  const autoStarted = useRef(false)

  const resetState = useCallback(() => {
    setTracking(false)
    setSuccess(false)
    setError('')
    setStatusMessage('')
    setShowManualInput(false)
    setCustomUrl('')
    setAutoFailed(false)
    autoStarted.current = false
  }, [])

  const startAutoTracking = useCallback(async () => {
    if (!purchaseId) return

    setTracking(true)
    setStatusMessage('Searching Brave for the original product page...')
    setError('')
    setAutoFailed(false)

    try {
      const response = await fetch('/api/track-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchase_id: purchaseId,
          product_name: productName,
          merchant_name: merchantName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start price tracking automatically')
      }

      setStatusMessage('Tracking started! We will keep an eye on this product.')
      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        window.location.reload()
      }, 1500)
    } catch (err) {
      setAutoFailed(true)
      setError(err instanceof Error ? err.message : 'Automatic tracking failed. Please try again.')
    } finally {
      setTracking(false)
    }
  }, [merchantName, onOpenChange, productName, purchaseId])

  useEffect(() => {
    if (open && !autoStarted.current) {
      autoStarted.current = true
      startAutoTracking()
    }
  }, [open, startAutoTracking])

  const handleManualSubmit = async () => {
    if (!customUrl.trim()) {
      setError('Please enter a product URL')
      return
    }

    setTracking(true)
    setStatusMessage('Starting manual price tracking...')
    setError('')

    try {
      const response = await fetch('/api/track-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchase_id: purchaseId,
          product_url: customUrl.trim(),
          product_name: productName,
          merchant_name: merchantName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start manual tracking')
      }

      setStatusMessage('Tracking started successfully!')
      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start manual tracking')
    } finally {
      setTracking(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      resetState()
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#37322F] font-sans">Track Price</DialogTitle>
          <DialogDescription className="text-[#605A57] font-sans">
            We’ll automatically find the original store listing and monitor it for price drops.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-[#16A34A] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#37322F] mb-2 font-sans">
              Price tracking started!
            </h3>
            <p className="text-[#605A57] font-sans">
              We'll check the price daily and notify you of any drops.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-[rgba(55,50,47,0.05)] p-4 rounded-lg">
              <p className="text-sm text-[#605A57] font-sans">
                <span className="font-semibold text-[#37322F]">{merchantName}</span>
                {productName && ` • ${productName}`}
              </p>
              <p className="text-sm text-[#605A57] mt-1 font-sans">
                Purchase amount: <span className="font-semibold">${totalAmount.toFixed(2)}</span>
              </p>
            </div>

            {tracking && statusMessage && (
              <div className="flex items-center justify-center py-4 px-3 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-[#2563EB] mr-3" />
                <span className="text-sm text-[#2563EB] font-semibold font-sans">
                  {statusMessage}
                </span>
              </div>
            )}

            {!tracking && statusMessage && !error && (
              <div className="flex items-center justify-center py-3 px-3 bg-[#16A34A]/10 border border-[#16A34A]/20 rounded-lg">
                <span className="text-sm text-[#166534] font-semibold font-sans">
                  {statusMessage}
                </span>
              </div>
            )}

            {error && (
              <div className="p-3 text-sm text-[#B44D12] bg-[#FEF3F2] border border-[#FECDCA] rounded-lg font-sans">
                {error}
              </div>
            )}

            {autoFailed && !showManualInput && (
              <div className="space-y-2">
                <Button
                  onClick={startAutoTracking}
                  disabled={tracking}
                  className="w-full bg-[#37322F] hover:bg-[#2A2520] text-white font-sans"
                >
                  Retry automatic tracking
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowManualInput(true)}
                  className="w-full border-[#E0DEDB] text-[#37322F] font-sans"
                >
                  Enter product URL manually
                </Button>
              </div>
            )}

            {showManualInput && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-[#37322F] font-sans">Product URL</Label>
                  <Input
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/product"
                    className="font-sans"
                    disabled={tracking}
                  />
                </div>
                <Button
                  onClick={handleManualSubmit}
                  disabled={tracking || !customUrl.trim()}
                  className="w-full bg-[#37322F] hover:bg-[#2A2520] text-white font-sans"
                >
                  {tracking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    'Start manual tracking'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-[#605A57] hover:text-[#37322F] font-sans"
              disabled={tracking}
            >
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
