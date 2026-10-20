import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ArrowUpRightFromSquare,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  Ellipsis,
  Filter,
  Globe2,
  Link2,
  Mail,
  Package,
  Plus,
  Search,
  Settings2,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { channelData, getTrend, orders, type Order } from './data'

type Notify = (message: string) => void

function downloadOrdersCsv(rows: Order[]) {
  const header = ['Order', 'Customer', 'Email', 'Source', 'Date', 'Amount (USD)', 'Status']
  const body = rows.map((row) => [row.id, row.customer, row.email, row.source, row.date, row.amount.toFixed(2), row.status])
  const csv = [header, ...body].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'northstar-orders.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function PageHeading({ kicker, title, description, actions }: {
  kicker: string
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <section className="page-heading-row">
      <div>
        <div className="eyebrow"><span className="live-dot" />{kicker}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-heading-actions">{actions}</div>}
    </section>
  )
}

function StatTile({ label, value, change, icon: Icon, tone = 'blue' }: {
  label: string
  value: string
  change: string
  icon: typeof UsersRound
  tone?: 'blue' | 'green' | 'orange' | 'purple'
}) {
  const down = change.startsWith('-')
  return <article className="kpi-card route-stat-card">
    <div className="kpi-topline"><div className={`kpi-icon kpi-icon-${tone}`}><Icon size={17} /></div><button className="icon-button more-button" aria-label={`More options for ${label}`}><Ellipsis size={18} /></button></div>
    <div className="kpi-label">{label}</div><div className="kpi-value tabular-nums">{value}</div>
    <div className="route-stat-change"><span className={`trend-pill ${down ? 'trend-down' : ''}`}>{down ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{change.replace('-', '')}</span><span>vs. previous month</span></div>
  </article>
}

function Panel({ title, description, action, children, className = '' }: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return <section className={`panel route-panel ${className}`}>
    <div className="panel-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>
    {children}
  </section>
}

function SearchField({ value, onChange, placeholder = 'Search' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="search-box route-search"><Search size={15} /><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></label>
}

function EmptyRow({ colSpan, title = 'No results found' }: { colSpan: number; title?: string }) {
  return <tr><td colSpan={colSpan} className="empty-state"><Search size={20} /><strong>{title}</strong><span>Try adjusting your search or filters.</span></td></tr>
}

function RevenuePage({ onNotify }: { onNotify: Notify }) {
  const revenue = getTrend('90D')
  const revenueByCategory = [
    { name: 'Home & living', value: 38400, color: '#5f7df7' },
    { name: 'Accessories', value: 27100, color: '#79c8ad' },
    { name: 'Apparel', value: 22400, color: '#f6b76b' },
    { name: 'Other', value: 18831, color: '#b7a5f4' },
  ]
  return <div className="content-wrap route-page">
    <PageHeading kicker="REVENUE INTELLIGENCE" title="Revenue" description="Understand what you earn, where it comes from, and how it is changing." actions={<button className="primary-button" onClick={() => onNotify('Revenue report exported')}><Download size={15} /> Export report</button>} />
    <div className="kpi-grid route-kpis">
      <StatTile label="Gross revenue" value="$106,731" change="12.8%" icon={CircleDollarSign} tone="blue" />
      <StatTile label="Net revenue" value="$98,462" change="10.4%" icon={WalletCards} tone="green" />
      <StatTile label="Average order value" value="$37.49" change="4.1%" icon={ShoppingBag} tone="orange" />
      <StatTile label="Refunds" value="$2,148" change="-2.3%" icon={CreditCard} tone="purple" />
    </div>
    <div className="route-two-column revenue-grid">
      <Panel title="Revenue over time" description="Weekly gross revenue · last 90 days" action={<button className="select-button" onClick={() => onNotify('Showing weekly revenue')}><span>Weekly</span><ChevronDown size={14} /></button>}>
        <div className="route-area-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={revenue} margin={{ top: 12, right: 8, left: -14, bottom: 0 }}><defs><linearGradient id="routeRevenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5f7df7" stopOpacity={0.2} /><stop offset="100%" stopColor="#5f7df7" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf0f4" strokeDasharray="3 5" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8c96a8', fontSize: 10 }} tickMargin={10} interval="preserveStartEnd" /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c96a8', fontSize: 10 }} tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`} width={50} /><Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} /><Area type="monotone" dataKey="revenue" stroke="#5f7df7" strokeWidth={2.5} fill="url(#routeRevenueFill)" dot={false} activeDot={{ r: 5 }} /></AreaChart></ResponsiveContainer></div>
        <div className="route-chart-legend"><span className="legend-dot" style={{ background: '#5f7df7' }} />Gross revenue <span className="legend-note">vs. previous period <b>+12.8%</b></span></div>
      </Panel>
      <Panel title="Revenue mix" description="Sales by product category">
        <div className="route-donut-area"><div className="route-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={revenueByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="68%" outerRadius="91%" paddingAngle={3} stroke="none" cornerRadius={4}>{revenueByCategory.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>$106k</strong><span>total</span></div></div>
          <div className="route-legend-list">{revenueByCategory.map((item) => <div className="legend-row" key={item.name}><span className="legend-dot" style={{ background: item.color }} /><span className="legend-name">{item.name}</span><strong>{Math.round(item.value / 106731 * 100)}%</strong></div>)}</div></div>
        <div className="route-note"><Sparkles size={14} /> Home & living is your top category this month.</div>
      </Panel>
    </div>
    <Panel title="Revenue by channel" description="Compare net sales across your acquisition channels" action={<button className="text-link" onClick={() => onNotify('Channel report opened')}>Full report <ArrowRight size={14} /></button>}>
      <div className="channel-breakdown">{channelData.map((channel) => <div className="channel-breakdown-row" key={channel.name}><span className="legend-dot" style={{ background: channel.color }} /><span>{channel.name}</span><div className="channel-track"><i style={{ width: `${channel.amount / 426}%`, background: channel.color }} /></div><strong>${channel.amount.toLocaleString()}</strong><small>{Math.round(channel.amount / 106731 * 100)}%</small></div>)}</div>
    </Panel>
    <PageFooter />
  </div>
}

const customerTrend = [
  { week: 'Sep 1', customers: 920 }, { week: 'Sep 8', customers: 1010 }, { week: 'Sep 15', customers: 980 },
  { week: 'Sep 22', customers: 1120 }, { week: 'Sep 29', customers: 1180 }, { week: 'Oct 6', customers: 1320 },
  { week: 'Oct 13', customers: 1395 }, { week: 'Oct 20', customers: 1510 },
]

const customerRows = [
  { name: 'Sophie Laurent', email: 'sophie.laurent@gmail.com', orders: 8, spent: '$2,184.00', joined: 'Oct 20, 2026', initials: 'SL', color: 'lavender', segment: 'Loyal' },
  { name: 'Oliver Chen', email: 'oliver.chen@icloud.com', orders: 4, spent: '$968.50', joined: 'Oct 20, 2026', initials: 'OC', color: 'mint', segment: 'Returning' },
  { name: 'Amara Johnson', email: 'amara.j@outlook.com', orders: 6, spent: '$1,432.00', joined: 'Oct 19, 2026', initials: 'AJ', color: 'peach', segment: 'Loyal' },
  { name: 'Lucas Martin', email: 'lucas.martin@gmail.com', orders: 1, spent: '$86.00', joined: 'Oct 19, 2026', initials: 'LM', color: 'blue', segment: 'New' },
  { name: 'Priya Kapoor', email: 'priya.k@icloud.com', orders: 3, spent: '$615.75', joined: 'Oct 18, 2026', initials: 'PK', color: 'rose', segment: 'Returning' },
]

function CustomersPage({ onNotify }: { onNotify: Notify }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => customerRows.filter((customer) => `${customer.name} ${customer.email} ${customer.segment}`.toLowerCase().includes(query.toLowerCase())), [query])
  return <div className="content-wrap route-page">
    <PageHeading kicker="CUSTOMER OVERVIEW" title="Customers" description="See who is buying, coming back, and growing with your business." actions={<button className="primary-button" onClick={() => onNotify('Customer export is ready')}><Download size={15} /> Export</button>} />
    <div className="kpi-grid route-kpis">
      <StatTile label="Total customers" value="18,254" change="9.6%" icon={UsersRound} tone="blue" />
      <StatTile label="New this month" value="1,486" change="14.2%" icon={Sparkles} tone="green" />
      <StatTile label="Returning customers" value="38.4%" change="5.8%" icon={ArrowUpRight} tone="orange" />
      <StatTile label="Lifetime value" value="$284.62" change="7.1%" icon={CircleDollarSign} tone="purple" />
    </div>
    <div className="route-two-column customer-grid">
      <Panel title="Customer growth" description="New customers by week · last 8 weeks" action={<span className="panel-total">+1,510 <small>this week</small></span>}>
        <div className="route-area-chart customer-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={customerTrend} margin={{ top: 12, right: 8, left: -15, bottom: 0 }}><defs><linearGradient id="customerFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#79c8ad" stopOpacity={0.22} /><stop offset="100%" stopColor="#79c8ad" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf0f4" strokeDasharray="3 5" /><XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#8c96a8', fontSize: 10 }} tickMargin={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c96a8', fontSize: 10 }} width={40} /><Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Customers']} /><Area type="monotone" dataKey="customers" stroke="#68b79a" strokeWidth={2.5} fill="url(#customerFill)" dot={false} activeDot={{ r: 5 }} /></AreaChart></ResponsiveContainer></div>
      </Panel>
      <Panel title="Customer segments" description="Your audience at a glance">
        <div className="segment-list"><SegmentRow name="New customers" count="1,486" percent={42} color="#5f7df7" /><SegmentRow name="Returning" count="987" percent={31} color="#79c8ad" /><SegmentRow name="Loyal" count="642" percent={19} color="#f6b76b" /><SegmentRow name="At risk" count="218" percent={8} color="#e69baa" /></div>
        <button className="text-link segment-link" onClick={() => onNotify('Customer segments opened')}>View all segments <ArrowRight size={14} /></button>
      </Panel>
    </div>
    <Panel title="Top customers" description="Customers with the highest lifetime spend" action={<div className="panel-actions"><SearchField value={query} onChange={setQuery} placeholder="Search customers" /><button className="table-filter" onClick={() => onNotify('Showing all customer segments')}><Filter size={14} /> Segment</button><button className="text-link" onClick={() => onNotify('Customer directory opened')}>View all <ArrowRight size={14} /></button></div>}>
      <div className="table-scroll"><table className="management-table"><thead><tr><th>CUSTOMER</th><th>SEGMENT</th><th>ORDERS</th><th>TOTAL SPENT</th><th>JOINED</th><th /></tr></thead><tbody>{filtered.length ? filtered.map((customer) => <tr key={customer.email}><td><div className="customer-cell"><span className={`customer-avatar avatar-${customer.color}`}>{customer.initials}</span><span><strong>{customer.name}</strong><small>{customer.email}</small></span></div></td><td><span className={`segment-badge segment-${customer.segment.toLowerCase()}`}>{customer.segment}</span></td><td>{customer.orders}</td><td className="amount-cell">{customer.spent}</td><td className="date-cell">{customer.joined}</td><td><button className="icon-button row-more" aria-label={`Open ${customer.name}`} onClick={() => onNotify(`${customer.name} profile opened`)}><ArrowUpRightFromSquare size={15} /></button></td></tr>) : <EmptyRow colSpan={6} title="No customers found" />}</tbody></table></div>
    </Panel>
    <PageFooter />
  </div>
}

function SegmentRow({ name, count, percent, color }: { name: string; count: string; percent: number; color: string }) {
  return <div className="segment-row"><div><span className="legend-dot" style={{ background: color }} /><span>{name}</span><strong>{count}</strong><small>{percent}%</small></div><div className="segment-track"><i style={{ width: `${percent * 2.2}%`, background: color }} /></div></div>
}

const productRows = [
  { name: 'Linen Throw Blanket', sku: 'HOM-1042', category: 'Home & living', sold: 482, revenue: '$18,240', stock: 124, status: 'In stock', color: 'lavender' },
  { name: 'Ceramic Table Vase', sku: 'HOM-1098', category: 'Home & living', sold: 368, revenue: '$12,880', stock: 86, status: 'In stock', color: 'peach' },
  { name: 'Everyday Tote', sku: 'ACC-2041', category: 'Accessories', sold: 291, revenue: '$8,730', stock: 14, status: 'Low stock', color: 'mint' },
  { name: 'Wool Blend Scarf', sku: 'APP-3012', category: 'Apparel', sold: 248, revenue: '$7,440', stock: 0, status: 'Out of stock', color: 'blue' },
  { name: 'Stoneware Cup Set', sku: 'HOM-1114', category: 'Home & living', sold: 217, revenue: '$6,510', stock: 62, status: 'In stock', color: 'rose' },
]

function ProductsPage({ onNotify }: { onNotify: Notify }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => productRows.filter((product) => `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(query.toLowerCase())), [query])
  return <div className="content-wrap route-page">
    <PageHeading kicker="PRODUCT PERFORMANCE" title="Products" description="Find your bestsellers, watch inventory, and make room for what is next." actions={<button className="primary-button" onClick={() => onNotify('New product form opened')}><Plus size={15} /> Add product</button>} />
    <div className="kpi-grid route-kpis">
      <StatTile label="Active products" value="248" change="6.2%" icon={Package} tone="blue" />
      <StatTile label="Units sold" value="4,892" change="11.4%" icon={ShoppingBag} tone="green" />
      <StatTile label="Product revenue" value="$72,408" change="8.9%" icon={CircleDollarSign} tone="orange" />
      <StatTile label="Low stock items" value="12" change="-3.1%" icon={SlidersHorizontal} tone="purple" />
    </div>
    <Panel title="Product performance" description="Sales revenue by product category">
      <div className="category-bars">{[
        { label: 'Home & living', amount: '$38,420', value: 88, color: '#5f7df7' },
        { label: 'Accessories', amount: '$27,108', value: 65, color: '#79c8ad' },
        { label: 'Apparel', amount: '$22,372', value: 52, color: '#f6b76b' },
        { label: 'Other', amount: '$18,831', value: 43, color: '#b7a5f4' },
      ].map((item) => <div className="category-bar-row" key={item.label}><span>{item.label}</span><div className="category-bar-track"><i style={{ width: `${item.value}%`, background: item.color }} /></div><strong>{item.amount}</strong></div>)}</div>
    </Panel>
    <Panel title="All products" description={`${filtered.length} products shown`} action={<div className="panel-actions"><SearchField value={query} onChange={setQuery} placeholder="Search products" /><button className="table-filter" onClick={() => onNotify('Product filters opened')}><SlidersHorizontal size={14} /> Filter</button></div>}>
      <div className="table-scroll"><table className="management-table product-table"><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>UNITS SOLD</th><th>REVENUE</th><th>IN STOCK</th><th>STATUS</th><th /></tr></thead><tbody>{filtered.length ? filtered.map((product) => <tr key={product.sku}><td><div className="product-cell"><span className={`product-swatch swatch-${product.color}`}><Package size={15} /></span><span><strong>{product.name}</strong><small>{product.sku}</small></span></div></td><td>{product.category}</td><td>{product.sold}</td><td className="amount-cell">{product.revenue}</td><td>{product.stock}</td><td><span className={`inventory-status inventory-${product.status.toLowerCase().replaceAll(' ', '-')}`}>{product.status}</span></td><td><button className="icon-button row-more" aria-label={`Open ${product.name}`} onClick={() => onNotify(`${product.name} details opened`)}><Ellipsis size={17} /></button></td></tr>) : <EmptyRow colSpan={7} title="No products found" />}</tbody></table></div>
    </Panel>
    <PageFooter />
  </div>
}

function OrdersPage({ onNotify }: { onNotify: Notify }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const filtered = useMemo(() => orders.filter((order) => `${order.id} ${order.customer} ${order.email} ${order.source}`.toLowerCase().includes(query.toLowerCase()) && (status === 'All statuses' || order.status === status)), [query, status])
  const handleExport = () => { downloadOrdersCsv(filtered); onNotify('Your filtered orders CSV is ready') }
  return <div className="content-wrap route-page">
    <PageHeading kicker="ORDER MANAGEMENT" title="Orders" description="Review and manage recent orders from every sales channel." actions={<button className="primary-button" onClick={handleExport}><Download size={15} /> Export orders</button>} />
    <div className="kpi-grid route-kpis three-kpis">
      <StatTile label="Total orders" value="1,284" change="8.2%" icon={ShoppingBag} tone="blue" />
      <StatTile label="Awaiting fulfillment" value="36" change="-4.1%" icon={Package} tone="orange" />
      <StatTile label="Average order value" value="$83.05" change="5.4%" icon={CircleDollarSign} tone="green" />
    </div>
    <Panel title="All orders" description="A live view of your latest sample orders" action={<div className="panel-actions"><SearchField value={query} onChange={setQuery} placeholder="Search orders" /><select className="select-button status-select" aria-label="Filter orders by status" value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option><option>Paid</option><option>Processing</option><option>Refunded</option></select></div>}>
      <div className="table-scroll"><table className="management-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>SOURCE</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th><th /></tr></thead><tbody>{filtered.length ? filtered.map((order) => <OrderRow key={order.id} order={order} onNotify={onNotify} />) : <EmptyRow colSpan={7} title="No orders match these filters" />}</tbody></table></div>
      <div className="table-footer"><span>Showing <strong>{filtered.length}</strong> of <strong>1,284</strong> orders</span><div className="pagination"><button aria-label="Previous page" disabled><ChevronLeft size={15} /></button><span>1</span><button aria-label="Next page" onClick={() => onNotify('You are viewing the latest demo orders')}><ChevronRight size={15} /></button></div></div>
    </Panel>
    <PageFooter />
  </div>
}

function OrderRow({ order, onNotify }: { order: Order; onNotify: Notify }) {
  return <tr><td className="order-id">{order.id}</td><td><div className="customer-cell"><span className={`customer-avatar avatar-${order.color}`}>{order.initials}</span><span><strong>{order.customer}</strong><small>{order.email}</small></span></div></td><td><span className="source-cell"><span className={`source-dot source-${order.source.toLowerCase().replace(' ', '-')}`} />{order.source}</span></td><td className="date-cell">{order.date}</td><td className="amount-cell">${order.amount.toFixed(2)}</td><td><span className={`status status-${order.status.toLowerCase()}`}><span />{order.status}</span></td><td><button className="icon-button row-more" aria-label={`Open ${order.id}`} onClick={() => onNotify(`${order.id} details opened`)}><Ellipsis size={17} /></button></td></tr>
}

const paymentMethods = [
  { name: 'Credit / debit card', amount: '$62,438', share: '58%', color: '#5f7df7' },
  { name: 'Apple Pay', amount: '$21,346', share: '20%', color: '#79c8ad' },
  { name: 'PayPal', amount: '$15,982', share: '15%', color: '#f6b76b' },
  { name: 'Other', amount: '$6,965', share: '7%', color: '#b7a5f4' },
]

function PaymentsPage({ onNotify }: { onNotify: Notify }) {
  return <div className="content-wrap route-page">
    <PageHeading kicker="PAYMENTS & PAYOUTS" title="Payments" description="Follow payment volume, processing, and your next payout." actions={<button className="secondary-button" onClick={() => onNotify('Payment settings opened')}><Settings2 size={15} /> Payment settings</button>} />
    <div className="kpi-grid route-kpis">
      <StatTile label="Payment volume" value="$106,731" change="12.8%" icon={CircleDollarSign} tone="blue" />
      <StatTile label="Successful payments" value="2,802" change="7.9%" icon={Check} tone="green" />
      <StatTile label="Refunded" value="$2,148" change="-2.3%" icon={ArrowDownRight} tone="orange" />
      <StatTile label="Processing fees" value="$3,408" change="4.2%" icon={CreditCard} tone="purple" />
    </div>
    <div className="route-two-column payments-grid">
      <Panel title="Next payout" description="Estimated arrival · Oct 22, 2026" className="payout-panel">
        <div className="payout-amount">$8,420<span>.56</span></div><div className="payout-status"><span /> Scheduled to Studio North · •••• 1842</div>
        <div className="payout-progress"><span style={{ width: '72%' }} /></div><div className="payout-steps"><span>Paid by customers</span><strong>On the way</strong><span>In your bank</span></div>
        <button className="text-link" onClick={() => onNotify('Payout details opened')}>View payout details <ArrowRight size={14} /></button>
      </Panel>
      <Panel title="Payment methods" description="How customers paid this month">
        <div className="payment-method-list">{paymentMethods.map((method) => <div className="payment-method-row" key={method.name}><span className="legend-dot" style={{ background: method.color }} /><span>{method.name}</span><strong>{method.amount}</strong><small>{method.share}</small></div>)}</div>
        <button className="text-link" onClick={() => onNotify('Payment methods report opened')}>Payment report <ArrowRight size={14} /></button>
      </Panel>
    </div>
    <Panel title="Recent payouts" description="Payouts sent to your connected bank account" action={<button className="text-link" onClick={() => onNotify('All payouts opened')}>View all <ArrowRight size={14} /></button>}>
      <div className="table-scroll"><table className="management-table"><thead><tr><th>PAYOUT</th><th>DATE</th><th>DESTINATION</th><th>AMOUNT</th><th>STATUS</th><th /></tr></thead><tbody>{[
        { id: 'PO-392814', date: 'Oct 18, 2026', destination: 'Chase ···· 1842', amount: '$6,280.42', status: 'Paid' },
        { id: 'PO-392771', date: 'Oct 15, 2026', destination: 'Chase ···· 1842', amount: '$7,842.18', status: 'Paid' },
        { id: 'PO-392628', date: 'Oct 12, 2026', destination: 'Chase ···· 1842', amount: '$5,619.03', status: 'Paid' },
      ].map((payout) => <tr key={payout.id}><td className="order-id">{payout.id}</td><td className="date-cell">{payout.date}</td><td>{payout.destination}</td><td className="amount-cell">{payout.amount}</td><td><span className="status status-paid"><span />{payout.status}</span></td><td><button className="icon-button row-more" aria-label={`Open ${payout.id}`} onClick={() => onNotify(`${payout.id} details opened`)}><ArrowUpRightFromSquare size={15} /></button></td></tr>)}</tbody></table></div>
    </Panel>
    <PageFooter />
  </div>
}

function SettingsPage({ onNotify }: { onNotify: Notify }) {
  const [saved, setSaved] = useState(false)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [orderAlerts, setOrderAlerts] = useState(true)
  const [marketing, setMarketing] = useState(false)
  const save = () => { setSaved(true); onNotify('Settings saved successfully'); window.setTimeout(() => setSaved(false), 1800) }
  return <div className="content-wrap route-page settings-page">
    <PageHeading kicker="WORKSPACE PREFERENCES" title="Settings" description="Manage your workspace details, preferences, and notifications." actions={<button className="primary-button" onClick={save}>{saved ? <Check size={15} /> : null}{saved ? 'Saved' : 'Save changes'}</button>} />
    <div className="settings-tabs"><button className="settings-tab settings-tab-active"><UsersRound size={15} /> Profile</button><button className="settings-tab" onClick={() => onNotify('Store settings selected')}><ShoppingBag size={15} /> Store</button><button className="settings-tab" onClick={() => onNotify('Notification settings selected')}><Mail size={15} /> Notifications</button><button className="settings-tab" onClick={() => onNotify('Security settings selected')}><Settings2 size={15} /> Security</button></div>
    <div className="settings-layout">
      <Panel title="Profile information" description="Update the personal details associated with your account.">
        <div className="profile-edit"><span className="profile-avatar large-profile-avatar">AM</span><button className="secondary-button" onClick={() => onNotify('Photo picker is available in the full product')}>Change photo</button><small>JPG or PNG · 2 MB max</small></div>
        <div className="settings-form-grid"><label>First name<input defaultValue="Alex" /></label><label>Last name<input defaultValue="Morgan" /></label><label className="field-span">Email address<input defaultValue="alex@studionorth.co" type="email" /></label><label className="field-span">Role<select defaultValue="Owner"><option>Owner</option><option>Admin</option><option>Analyst</option></select></label></div>
      </Panel>
      <Panel title="Email notifications" description="Choose which updates make it to your inbox.">
        <div className="toggle-list"><ToggleRow title="Weekly performance digest" description="A summary of your store’s activity every Monday." checked={weeklyDigest} onChange={setWeeklyDigest} /><ToggleRow title="New order alerts" description="Get an email when a new order comes in." checked={orderAlerts} onChange={setOrderAlerts} /><ToggleRow title="Product news and tips" description="Occasional product updates and best practices." checked={marketing} onChange={setMarketing} /></div>
      </Panel>
      <Panel title="Workspace details" description="Information about the workspace you are viewing.">
        <div className="settings-form-grid"><label className="field-span">Workspace name<input defaultValue="Studio North" /></label><label className="field-span">Store URL<input defaultValue="studio-north.example.com" /></label><label className="field-span">Default currency<select defaultValue="USD · US Dollar"><option>USD · US Dollar</option><option>EUR · Euro</option><option>GBP · British Pound</option></select></label></div>
      </Panel>
      <section className="panel demo-notice"><div className="insight-orb"><Sparkles size={16} /></div><div><strong>Demo workspace</strong><p>These settings are local to this browser session. No account or server data is changed.</p></div><span>Sample data</span></section>
    </div>
    <PageFooter />
  </div>
}

function ToggleRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <div className="toggle-row"><div><strong>{title}</strong><p>{description}</p></div><button className={`toggle ${checked ? 'toggle-on' : ''}`} role="switch" aria-checked={checked} aria-label={title} onClick={() => onChange(!checked)}><span /></button></div>
}

const integrationItems = [
  { name: 'Shopify', category: 'Ecommerce', description: 'Sync orders, products, and customer data from your store.', icon: ShoppingBag, color: 'green', connected: true },
  { name: 'Stripe', category: 'Payments', description: 'Bring payments, payouts, and refunds into one view.', icon: CreditCard, color: 'purple', connected: true },
  { name: 'Google Analytics', category: 'Analytics', description: 'Connect sessions and acquisition data to store performance.', icon: Globe2, color: 'orange', connected: false },
  { name: 'Klaviyo', category: 'Marketing', description: 'Compare email and SMS campaigns with customer orders.', icon: Mail, color: 'blue', connected: false },
  { name: 'Meta Ads', category: 'Advertising', description: 'Understand how paid social contributes to your revenue.', icon: Sparkles, color: 'blue', connected: false },
]

function IntegrationsPage({ onNotify }: { onNotify: Notify }) {
  const [connected, setConnected] = useState(() => new Set(integrationItems.filter((item) => item.connected).map((item) => item.name)))
  const toggle = (name: string) => {
    setConnected((current) => {
      const next = new Set(current)
      if (next.has(name)) { next.delete(name); onNotify(`${name} disconnected`) }
      else { next.add(name); onNotify(`${name} connected in demo mode`) }
      return next
    })
  }
  return <div className="content-wrap route-page">
    <PageHeading kicker="CONNECTED TOOLS" title="Integrations" description="Bring the tools you already use into one connected view." actions={<button className="secondary-button" onClick={() => onNotify('Integration catalog opened')}><Plus size={15} /> Browse catalog</button>} />
    <section className="integration-callout"><div className="integration-callout-icon"><Link2 size={17} /></div><div><strong>One workspace, more context</strong><p>Connected services add more detail to your reports and help keep everything in sync.</p></div><span><i /> Secure connections</span></section>
    <div className="integration-section-heading"><div><h2>Available integrations</h2><p>Connect your existing tools to Northstar.</p></div><button className="text-link" onClick={() => onNotify('Integration documentation opened')}>Need help? <ArrowRight size={14} /></button></div>
    <div className="integration-grid">{integrationItems.map((item) => { const Icon = item.icon; const isConnected = connected.has(item.name); return <article className="panel integration-card" key={item.name}><div className="integration-card-top"><div className={`integration-logo integration-${item.color}`}><Icon size={19} /></div><span className={`integration-category category-${item.color}`}>{item.category}</span></div><h3>{item.name}</h3><p>{item.description}</p><div className="integration-card-footer">{isConnected ? <span className="connected-label"><span /> Connected</span> : <span className="integration-setup">2 min setup</span>}<button className={isConnected ? 'secondary-button' : 'connect-button'} onClick={() => toggle(item.name)}>{isConnected ? 'Disconnect' : 'Connect'}{!isConnected && <ArrowUpRightFromSquare size={13} />}</button></div></article>})}</div>
    <Panel title="Recently synced" description="Latest data activity across your connected tools"><div className="sync-list"><div><span className="sync-logo integration-green"><ShoppingBag size={14} /></span><span><strong>Shopify</strong><small>Orders and customers synced</small></span><time>2 minutes ago</time><span className="sync-complete"><Check size={13} /> Complete</span></div><div><span className="sync-logo integration-purple"><CreditCard size={14} /></span><span><strong>Stripe</strong><small>Payments and payouts synced</small></span><time>8 minutes ago</time><span className="sync-complete"><Check size={13} /> Complete</span></div></div></Panel>
    <PageFooter />
  </div>
}

export function SecondaryPage({ page, onNotify, onNavigate }: { page: string; onNotify: Notify; onNavigate?: (path: string) => void }) {
  if (page === 'Revenue') return <RevenuePage onNotify={onNotify} />
  if (page === 'Customers') return <CustomersPage onNotify={onNotify} />
  if (page === 'Products') return <ProductsPage onNotify={onNotify} />
  if (page === 'Orders') return <OrdersPage onNotify={onNotify} />
  if (page === 'Payments') return <PaymentsPage onNotify={onNotify} />
  if (page === 'Settings') return <SettingsPage onNotify={onNotify} />
  if (page === 'Integrations') return <IntegrationsPage onNotify={onNotify} />
  return <NotFoundPage onNotify={onNotify} onNavigate={onNavigate} />
}

function NotFoundPage({ onNotify, onNavigate }: { onNotify: Notify; onNavigate?: (path: string) => void }) {
  return <div className="content-wrap route-page not-found-page"><div className="not-found-card"><span>404</span><h1>This view is not here yet</h1><p>Head back to your overview to continue exploring the demo.</p><button className="primary-button" onClick={() => { if (onNavigate) onNavigate('/overview'); else onNotify('Use the Overview link in the sidebar to return') }}><ArrowRight size={15} /> Go to overview</button></div></div>
}

function PageFooter() {
  return <footer className="page-footer"><span>© 2026 Northstar Analytics</span><span>All figures are sample data for demonstration.</span><span className="footer-status"><span /> Demo data is up to date</span></footer>
}
