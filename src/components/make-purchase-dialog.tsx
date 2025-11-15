'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MakePurchaseFormSchema = z.object({
  amount: z.number().positive('Amount must be a positive number.'),
  item_description: z.string().optional(),
});

type MakePurchaseFormData = z.infer<typeof MakePurchaseFormSchema>

interface MakePurchaseDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onPurchaseComplete: () => void
  giftCardId: string
  currentBalance: number
  retailer: string
}

export function MakePurchaseDialog({
  isOpen,
  onOpenChange,
  onPurchaseComplete,
  giftCardId,
  currentBalance,
  retailer,
}: MakePurchaseDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const form = useForm<MakePurchaseFormData>({
    resolver: zodResolver(MakePurchaseFormSchema),
    defaultValues: {
      amount: 0,
      item_description: '',
    },
  })

  const onSubmit = async (values: MakePurchaseFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gift_card_id: giftCardId,
          amount: Number(values.amount),
          item_description: values.item_description,
        }),
      })

      const result = await response.json();

      if (response.ok) {
        onPurchaseComplete()
        onOpenChange(false)
        form.reset()
      } else {
        setSubmitError(result.error || 'An unexpected error occurred.')
      }
    } catch (error) {
      setSubmitError('Failed to connect to the server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make a purchase with {retailer} card</DialogTitle>
          <DialogDescription>
            Current balance: ${currentBalance.toFixed(2)}. Enter the amount for your purchase.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input id="amount" type="number" step="0.01" {...form.register('amount', { valueAsNumber: true })} />
            {form.formState.errors.amount && (
              <p className="text-red-500 text-xs">{form.formState.errors.amount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="item_description">Item Description (Optional)</Label>
            <Input id="item_description" {...form.register('item_description')} />
          </div>
          {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
