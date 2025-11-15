import { SupabaseClient } from '@supabase/supabase-js'

export type PurchaseData = {
  itemName: string
  store: string
  price: number
  purchaseDate: string
}

export type RecurrentItem = {
  item_name: string
  store: string
  avg_interval_days: number
  next_purchase_date: string
  last_purchase_date: string
}

export function extractPurchaseData(receiptData: {
  merchant: string
  items: Array<{ name: string; price: number }>
  total: number
  date: string
}): PurchaseData {
  const firstItem = receiptData.items?.[0]
  const itemName = firstItem?.name || receiptData.merchant || 'Purchase'
  const price = firstItem?.price ?? receiptData.total ?? 0
  return {
    itemName: itemName.trim() || 'Purchase',
    store: receiptData.merchant?.trim() || 'Unknown Store',
    price,
    purchaseDate: receiptData.date || new Date().toISOString(),
  }
}

export async function savePurchase(
  supabase: SupabaseClient,
  userId: string,
  purchase: PurchaseData
) {
  try {
    await supabase.from('purchase_history').insert({
      user_id: userId,
      item_name: purchase.itemName,
      store: purchase.store,
      price: purchase.price,
      purchase_date: purchase.purchaseDate,
    })
  } catch (error) {
    console.warn('Failed to insert into purchase_history:', error)
  }

  try {
    await supabase.from('calendar').insert({
      user_id: userId,
      date: purchase.purchaseDate,
      item_name: purchase.itemName,
    })
  } catch (error) {
    console.warn('Failed to insert into calendar:', error)
  }
}

export async function detectRecurrentPurchases(
  supabase: SupabaseClient,
  userId: string
): Promise<RecurrentItem[]> {
  const { data: history } = await supabase
    .from('purchase_history')
    .select('item_name, store, purchase_date')
    .eq('user_id', userId)
    .order('purchase_date', { ascending: true })

  if (!history) return []

  const map = new Map<string, Date[]>()
  for (const entry of history) {
    if (!entry.purchase_date) continue
    const key = `${entry.item_name || ''}__${entry.store || ''}`
    const dates = map.get(key) || []
    dates.push(new Date(entry.purchase_date))
    map.set(key, dates)
  }

  const dayMs = 1000 * 60 * 60 * 24
  const detected: RecurrentItem[] = []

  map.forEach((dates, key) => {
    if (dates.length < 2) return
    dates.sort((a, b) => a.getTime() - b.getTime())
    const intervals: number[] = []
    for (let i = 0; i < dates.length - 1; i++) {
      const diffDays = (dates[i + 1].getTime() - dates[i].getTime()) / dayMs
      intervals.push(diffDays)
    }
    if (intervals.length === 0) return
    const avgInterval = intervals.reduce((sum, d) => sum + d, 0) / intervals.length
    if (avgInterval > 90) {
      return
    }
    const maxInterval = Math.max(...intervals)
    const minInterval = Math.min(...intervals)
    if (maxInterval - minInterval > Math.max(10, avgInterval * 0.4)) {
      return
    }
    const lastPurchaseDate = dates[dates.length - 1]
    const nextPurchaseDate = new Date(
      lastPurchaseDate.getTime() + avgInterval * dayMs
    )
    const [itemName, store] = key.split('__')
    detected.push({
      item_name: itemName,
      store,
      avg_interval_days: Math.round(avgInterval),
      last_purchase_date: lastPurchaseDate.toISOString(),
      next_purchase_date: nextPurchaseDate.toISOString(),
    })
  })

  return detected
}

export async function updateRecurrentPurchases(
  supabase: SupabaseClient,
  userId: string,
  recurrentList: RecurrentItem[]
): Promise<RecurrentItem[]> {
  if (!recurrentList.length) return []

  const { data: existing } = await supabase
    .from('recurrent_purchases')
    .select('*')
    .eq('user_id', userId)

  const existingMap = new Map<string, any>()
  existing?.forEach((item) => {
    const key = `${item.item_name}__${item.store}`
    existingMap.set(key, item)
  })

  const itemsToUpsert = recurrentList.map((item) => ({
    user_id: userId,
    item_name: item.item_name,
    store: item.store,
    avg_interval_days: item.avg_interval_days,
    next_purchase_date: item.next_purchase_date,
    last_purchase_date: item.last_purchase_date,
  }))

  await supabase
    .from('recurrent_purchases')
    .upsert(itemsToUpsert, { onConflict: 'user_id,item_name,store' })

  const newItems: RecurrentItem[] = []
  recurrentList.forEach((item) => {
    const key = `${item.item_name}__${item.store}`
    const match = existingMap.get(key)
    if (!match) {
      newItems.push(item)
    } else {
      const prev = new Date(match.next_purchase_date || 0).getTime()
      const current = new Date(item.next_purchase_date).getTime()
      if (Math.abs(prev - current) > 24 * 60 * 60 * 1000) {
        newItems.push(item)
      }
    }
  })

  return newItems
}

export async function notifyFrontend(
  supabase: SupabaseClient,
  userId: string,
  items: RecurrentItem[]
) {
  if (!items.length) return
  const payload = items.map((item) => ({
    user_id: userId,
    type: 'recurrent_purchase',
    title: 'Recurrent Purchase Detected',
    message: `You usually buy ${item.item_name} every ${item.avg_interval_days} days. Want to buy it again?`,
    priority: 'normal',
    metadata: {
      item_name: item.item_name,
      store: item.store,
      next_purchase_date: item.next_purchase_date,
    },
  }))

  try {
    await supabase.from('notifications').insert(payload)
  } catch (error) {
    console.warn('Failed to insert recurrent purchase notification:', error)
  }
}
