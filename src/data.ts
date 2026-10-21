export type MetricKey = 'revenue' | 'orders' | 'visitors'
export type RangeKey = '7D' | '30D' | '90D'

export interface TrendPoint {
  day: string
  revenue: number
  orders: number
  visitors: number
}

export interface DemoSettings {
  firstName: string
  lastName: string
  email: string
  role: string
  weeklyDigest: boolean
  orderAlerts: boolean
  marketing: boolean
  workspaceName: string
  storeUrl: string
  currency: string
}

export const defaultDemoSettings: DemoSettings = {
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex@studionorth.co',
  role: 'Owner',
  weeklyDigest: true,
  orderAlerts: true,
  marketing: false,
  workspaceName: 'Studio North',
  storeUrl: 'studio-north.example.com',
  currency: 'USD · US Dollar',
}

export const periodTotals: Record<RangeKey, Pick<TrendPoint, 'revenue' | 'orders' | 'visitors'>> = {
  '7D': { revenue: 24904, orders: 665, visitors: 20525 },
  '30D': { revenue: 106731, orders: 2847, visitors: 87870 },
  '90D': { revenue: 320193, orders: 8541, visitors: 263611 },
}

const previousPeriodTotals: Record<RangeKey, Pick<TrendPoint, 'revenue' | 'orders' | 'visitors'>> = {
  '7D': { revenue: 23000, orders: 625, visitors: 18125 },
  '30D': { revenue: 94600, orders: 2631, visitors: 74092 },
  '90D': { revenue: 257142, orders: 7280, visitors: 219463 },
}

function percentChange(current: number, previous: number) {
  const change = (current / previous - 1) * 100
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
}

export function getPeriodComparison(range: RangeKey) {
  const current = periodTotals[range]
  const previous = previousPeriodTotals[range]
  const currentConversion = current.orders / current.visitors * 100
  const previousConversion = previous.orders / previous.visitors * 100
  const conversionChange = currentConversion - previousConversion
  return {
    revenue: percentChange(current.revenue, previous.revenue),
    orders: percentChange(current.orders, previous.orders),
    visitors: percentChange(current.visitors, previous.visitors),
    conversion: `${conversionChange >= 0 ? '+' : ''}${conversionChange.toFixed(2)} pp`,
  }
}

const thirtyDays: TrendPoint[] = [
  { day: 'Sep 21', revenue: 18200, orders: 410, visitors: 8100 },
  { day: 'Sep 23', revenue: 19400, orders: 438, visitors: 8420 },
  { day: 'Sep 25', revenue: 17100, orders: 394, visitors: 7980 },
  { day: 'Sep 27', revenue: 21600, orders: 489, visitors: 9060 },
  { day: 'Sep 29', revenue: 22700, orders: 516, visitors: 9530 },
  { day: 'Oct 01', revenue: 20500, orders: 472, visitors: 8910 },
  { day: 'Oct 03', revenue: 23800, orders: 548, visitors: 10120 },
  { day: 'Oct 05', revenue: 22400, orders: 519, visitors: 9740 },
  { day: 'Oct 07', revenue: 25100, orders: 582, visitors: 10620 },
  { day: 'Oct 09', revenue: 24300, orders: 561, visitors: 10380 },
  { day: 'Oct 11', revenue: 27600, orders: 631, visitors: 11240 },
  { day: 'Oct 13', revenue: 26200, orders: 608, visitors: 10970 },
  { day: 'Oct 15', revenue: 29100, orders: 669, visitors: 11820 },
  { day: 'Oct 17', revenue: 27900, orders: 646, visitors: 11510 },
  { day: 'Oct 19', revenue: 32200, orders: 731, visitors: 12680 },
  { day: 'Oct 20', revenue: 30800, orders: 702, visitors: 12240 },
]

const ninetyDays: TrendPoint[] = [
  { day: 'Jul 23', revenue: 128000, orders: 2810, visitors: 59000 },
  { day: 'Jul 30', revenue: 136000, orders: 3010, visitors: 62300 },
  { day: 'Aug 06', revenue: 129000, orders: 2890, visitors: 60400 },
  { day: 'Aug 13', revenue: 145000, orders: 3200, visitors: 66100 },
  { day: 'Aug 20', revenue: 151000, orders: 3340, visitors: 68800 },
  { day: 'Aug 27', revenue: 143000, orders: 3180, visitors: 67200 },
  { day: 'Sep 03', revenue: 166000, orders: 3650, visitors: 74100 },
  { day: 'Sep 10', revenue: 159000, orders: 3530, visitors: 72400 },
  { day: 'Sep 17', revenue: 181000, orders: 3980, visitors: 80300 },
  { day: 'Sep 24', revenue: 174000, orders: 3870, visitors: 78600 },
  { day: 'Oct 01', revenue: 198000, orders: 4390, visitors: 87100 },
  { day: 'Oct 08', revenue: 191000, orders: 4260, visitors: 85600 },
  { day: 'Oct 15', revenue: 218000, orders: 4810, visitors: 94200 },
]

const sevenDays: TrendPoint[] = [
  { day: 'Oct 14', revenue: 10200, orders: 232, visitors: 4260 },
  { day: 'Oct 15', revenue: 15400, orders: 351, visitors: 5830 },
  { day: 'Oct 16', revenue: 13900, orders: 318, visitors: 5510 },
  { day: 'Oct 17', revenue: 16800, orders: 383, visitors: 6490 },
  { day: 'Oct 18', revenue: 14600, orders: 334, visitors: 5980 },
  { day: 'Oct 19', revenue: 19400, orders: 443, visitors: 7110 },
  { day: 'Oct 20', revenue: 18100, orders: 412, visitors: 6840 },
]

function scaleMetric(values: number[], target: number) {
  const sourceTotal = values.reduce((sum, value) => sum + value, 0)
  let assigned = 0
  return values.map((value, index) => {
    const scaled = index === values.length - 1 ? target - assigned : Math.round(value / sourceTotal * target)
    assigned += scaled
    return scaled
  })
}

export const getTrend = (range: RangeKey): TrendPoint[] => {
  const source = range === '7D' ? sevenDays : range === '90D' ? ninetyDays : thirtyDays
  const totals = periodTotals[range]
  const revenue = scaleMetric(source.map((point) => point.revenue), totals.revenue)
  const orders = scaleMetric(source.map((point) => point.orders), totals.orders)
  const visitors = scaleMetric(source.map((point) => point.visitors), totals.visitors)
  return source.map((point, index) => ({ ...point, revenue: revenue[index], orders: orders[index], visitors: visitors[index] }))
}

export const channelData = [
  { name: 'Direct', amount: 42600, color: '#5f7df7' },
  { name: 'Organic search', amount: 28700, color: '#79c8ad' },
  { name: 'Paid social', amount: 18400, color: '#f6b76b' },
  { name: 'Referral', amount: 8831, color: '#b7a5f4' },
  { name: 'Email', amount: 8200, color: '#e69baa' },
]

export function getChannelData(range: RangeKey) {
  const target = periodTotals[range].revenue
  const baseTotal = channelData.reduce((sum, channel) => sum + channel.amount, 0)
  let assigned = 0
  return channelData.map((channel, index) => {
    const amount = index === channelData.length - 1 ? target - assigned : Math.round(channel.amount / baseTotal * target)
    assigned += amount
    return { ...channel, amount }
  })
}

export const productRevenueByCategory = [
  { name: 'Home & living', amount: 38420, color: '#5f7df7' },
  { name: 'Accessories', amount: 27108, color: '#79c8ad' },
  { name: 'Apparel', amount: 22372, color: '#f6b76b' },
  { name: 'Other', amount: 18831, color: '#b7a5f4' },
]

export const totalProductRevenue = productRevenueByCategory.reduce((sum, category) => sum + category.amount, 0)

export const refundTotal = 2148
export const netRevenue = totalProductRevenue - refundTotal
export const averageOrderValue = totalProductRevenue / periodTotals['30D'].orders

export const orders = [
  { id: 'ORD-2841', customer: 'Sophie Laurent', initials: 'SL', color: 'lavender', email: 'sophie.laurent@gmail.com', source: 'Direct', date: 'Oct 20, 2026', amount: 284.0, status: 'Paid' },
  { id: 'ORD-2840', customer: 'Oliver Chen', initials: 'OC', color: 'mint', email: 'oliver.chen@icloud.com', source: 'Organic search', date: 'Oct 20, 2026', amount: 148.5, status: 'Paid' },
  { id: 'ORD-2839', customer: 'Amara Johnson', initials: 'AJ', color: 'peach', email: 'amara.j@outlook.com', source: 'Paid social', date: 'Oct 19, 2026', amount: 392.0, status: 'Processing' },
  { id: 'ORD-2838', customer: 'Lucas Martin', initials: 'LM', color: 'blue', email: 'lucas.martin@gmail.com', source: 'Referral', date: 'Oct 19, 2026', amount: 86.0, status: 'Paid' },
  { id: 'ORD-2837', customer: 'Priya Kapoor', initials: 'PK', color: 'rose', email: 'priya.k@icloud.com', source: 'Email', date: 'Oct 18, 2026', amount: 215.75, status: 'Refunded' },
]

export type Order = (typeof orders)[number]
