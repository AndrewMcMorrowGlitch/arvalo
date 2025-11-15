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
import { GiftCardSchema } from '@/lib/validation/schemas'

type GiftCardFormData = z.infer<typeof GiftCardSchema>

interface AddGiftCardDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCardAdded: () => void
}

export function AddGiftCardDialog({ isOpen, onOpenChange, onCardAdded }: AddGiftCardDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const form = useForm<GiftCardFormData>({
    resolver: zodResolver(GiftCardSchema),
    defaultValues: {
      retailer: '',
      card_number: '',
      pin: '',
      initial_balance: 0,
    },
  })

  const onSubmit = async (values: GiftCardFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const response = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          initial_balance: Number(values.initial_balance)
        }),
      })

      if (response.ok) {
        onCardAdded()
        onOpenChange(false)
        form.reset()
      } else {
        const errorData = await response.json()
        setSubmitError(errorData.error || 'An unexpected error occurred.')
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
          <DialogTitle>Add a new gift card</DialogTitle>
          <DialogDescription>
            Enter the details of your gift card to start tracking it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retailer">Retailer</Label>
            <Input id="retailer" {...form.register('retailer')} />
            {form.formState.errors.retailer && (
              <p className="text-red-500 text-xs">{form.formState.errors.retailer.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="card_number">Card Number</Label>
            <Input id="card_number" {...form.register('card_number')} />
            {form.formState.errors.card_number && (
              <p className="text-red-500 text-xs">{form.formState.errors.card_number.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin">PIN</Label>
            <Input id="pin" type="password" {...form.register('pin')} />
            {form.formState.errors.pin && (
              <p className="text-red-500 text-xs">{form.formState.errors.pin.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="initial_balance">Initial Balance ($)</Label>
            <Input id="initial_balance" type="number" step="0.01" {...form.register('initial_balance', { valueAsNumber: true })} />
            {form.formState.errors.initial_balance && (
              <p className="text-red-500 text-xs">{form.formState.errors.initial_balance.message}</p>
            )}
          </div>
          {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
