'use client'

import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'

interface Purchase {
  id: string;
  amount: number;
  item_description: string;
  status: string;
  failure_reason: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
  completed_at: string;
}

interface PurchaseHistoryProps {
  giftCardId: string;
}

export function PurchaseHistory({ giftCardId }: PurchaseHistoryProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!giftCardId) return;

    async function fetchHistory() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/gift-cards/${giftCardId}/purchases`);
        if (response.ok) {
          const data = await response.json();
          setPurchases(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch purchase history.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [giftCardId]);

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (purchases.length === 0) {
    return (
        <Alert className="mt-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>No Purchases Yet</AlertTitle>
            <AlertDescription>No purchases have been made with this gift card.</AlertDescription>
        </Alert>
    )
  }

  return (
    <div className="mt-6 border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Balance Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                {new Date(p.completed_at || p.created_at).toLocaleString()}
              </TableCell>
              <TableCell>{p.item_description || 'N/A'}</TableCell>
              <TableCell>${p.amount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={p.status === 'completed' ? 'default' : 'destructive'}>
                  {p.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-gray-500">${p.balance_before.toFixed(2)}</span>
                {' -> '}
                <span className="font-semibold">${(p.balance_after ?? p.balance_before).toFixed(2)}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
