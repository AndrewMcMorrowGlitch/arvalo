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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GiftCardSchema } from '@/lib/validation/schemas'
import { toast } from '@/hooks/use-toast'

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
    mode: 'onSubmit',
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
        body: JSON.stringify(values),
      })

      if (response.ok) {
        onCardAdded()
        onOpenChange(false)
        form.reset()
        toast({
          title: 'Gift card added',
          description: `${values.retailer} • $${Number(values.initial_balance).toFixed(2)} balance`,
        })
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
            Enter the details of your gift card so we can help you use the balance before it expires. We never charge your card or share these details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retailer">Retailer</Label>
            <Select
              onValueChange={(value) => form.setValue('retailer', value, { shouldValidate: true })}
              value={form.watch('retailer') || undefined}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a retailer" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Popular retailers</SelectLabel>
                  <SelectItem value="Amazon">Amazon</SelectItem>
                  <SelectItem value="Walmart">Walmart</SelectItem>
                  <SelectItem value="Target">Target</SelectItem>
                  <SelectItem value="Best Buy">Best Buy</SelectItem>
                  <SelectItem value="Starbucks">Starbucks</SelectItem>
                  <SelectItem value="Apple">Apple</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Other</SelectLabel>
                  <SelectItem value="Other">Other / Misc</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {form.formState.errors.retailer && (
              <p className="text-red-500 text-xs">{form.formState.errors.retailer.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="card_number">Card Number (optional)</Label>
            <Input id="card_number" placeholder="Leave blank if you don't want to save it" {...form.register('card_number')} />
            {form.formState.errors.card_number && (
              <p className="text-red-500 text-xs">{form.formState.errors.card_number.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin">PIN (optional)</Label>
            <Input id="pin" type="password" placeholder="Leave blank if not needed" {...form.register('pin')} />
            {form.formState.errors.pin && (
              <p className="text-red-500 text-xs">{form.formState.errors.pin.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="initial_balance">Initial Balance</Label>
            <Input
              id="initial_balance"
              type="number"
              step="0.01"
              placeholder="Enter the card balance"
              {...form.register('initial_balance')}
            />
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
