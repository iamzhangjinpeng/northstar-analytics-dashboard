import { lazy, Suspense, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Command,
  CreditCard,
  Download,
  Ellipsis,
  ExternalLink,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  Menu,
  MousePointer2,
  Package,
  Search,
  Settings2,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
  X,
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
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { channelData, getTrend, orders, type MetricKey, type Order, type RangeKey } from './data'

const SecondaryPage = lazy(() => import('./secondary-pages').then(({ SecondaryPage: Page }) => ({ default: Page })))

const metricOptions: { id: MetricKey; label: string; color: string }[] = [
  { id: 'revenue', label: 'Revenue', color: '#5f7df7' },
  { id: 'orders', label: 'Orders', color: '#79c8ad' },
  { id: 'visitors', label: 'Visitors', color: '#f6b76b' },
]

const navSections = [
  {
    label: 'WORKSPACE',
    items: [
      { label: 'Overview', icon: LayoutDashboard },
      { label: 'Revenue', icon: Activity },
      { label: 'Customers', icon: UsersRound },
      { label: 'Products', icon: Package },
    ],
  },
  {
    label: 'MANAGE',
    items: [
      { label: 'Orders', icon: ShoppingBag, count: '12' },
      { label: 'Payments', icon: CreditCard },
      { label: 'Integrations', icon: Link2 },
      { label: 'Settings', icon: Settings2 },
    ],
  },
]

const secondaryRoutes = [
  { path: '/revenue', page: 'Revenue' },
  { path: '/customers', page: 'Customers' },
  { path: '/products', page: 'Products' },
  { path: '/orders', page: 'Orders' },
  { path: '/payments', page: 'Payments' },
  { path: '/integrations', page: 'Integrations' },
  { path: '/settings', page: 'Settings' },
]

const pagePaths: Record<string, string> = {
  Overview: '/overview',
  ...Object.fromEntries(secondaryRoutes.map(({ path, page }) => [page, path])),
}

function formatNumber(value: number, metric: MetricKey) {
  if (metric === 'revenue') return `$${(value / 1000).toFixed(value >= 100000 ? 0 : 1)}k`
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function formatTooltipValue(value: number, metric: MetricKey) {
  if (metric === 'revenue') return `$${value.toLocaleString('en-US')}`
  if (metric === 'visitors') return `${value.toLocaleString('en-US')} visitors`
  return `${value.toLocaleString('en-US')} orders`
}

function downloadCsv(rows: Order[]) {
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

function Sidebar({ activePage, onNavigate, mobileOpen, onClose }: {
  activePage: string
  onNavigate: (page: string) => void
  mobileOpen: boolean
  onClose: () => void
}) {
  return (
    <>
      {mobileOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Sparkles size={17} strokeWidth={2.1} /></div>
          <span>northstar</span>
          <button className="icon-button collapse-button" aria-label="Collapse sidebar"><ChevronLeft size={16} /></button>
        </div>

        <button className="workspace-switcher" aria-label="Switch workspace">
          <span className="workspace-avatar">S</span>
          <span className="workspace-copy"><strong>Studio North</strong><small>Free workspace</small></span>
          <ChevronDown size={15} className="muted-icon" />
        </button>

        <div className="sidebar-sections">
          {navSections.map((section) => (
            <div className="nav-section" key={section.label}>
              <div className="nav-label">{section.label}</div>
              {section.items.map(({ label, icon: Icon, count }) => (
                <button
                  className={`nav-item ${activePage === label ? 'nav-item-active' : ''}`}
                  key={label}
                  onClick={() => { onNavigate(label); onClose() }}
                  aria-current={activePage === label ? 'page' : undefined}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{label}</span>
                  {count && <span className="nav-count">{count}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-upgrade">
            <div className="upgrade-icon"><Sparkles size={15} /></div>
            <strong>Make better decisions</strong>
            <p>Connect your store to unlock more insights.</p>
            <button onClick={() => onNavigate('Integrations')}>Explore integrations <ArrowRight size={14} /></button>
          </div>
          <button className="profile-row" onClick={() => onNavigate('Settings')}>
            <span className="profile-avatar">AM</span>
            <span className="profile-copy"><strong>Alex Morgan</strong><small>alex@studionorth.co</small></span>
            <Ellipsis size={17} className="muted-icon" />
          </button>
        </div>
      </aside>
    </>
  )
}

function KpiCard({ title, value, change, caption, icon: Icon, tone, sparkline }: {
  title: string
  value: string
  change: string
  caption: string
  icon: typeof Activity
  tone: 'blue' | 'green' | 'orange' | 'purple'
  sparkline: number[]
}) {
  const max = Math.max(...sparkline)
  return (
    <article className="kpi-card">
      <div className="kpi-topline">
        <div className={`kpi-icon kpi-icon-${tone}`}><Icon size={17} strokeWidth={1.9} /></div>
        <button className="icon-button more-button" aria-label={`More options for ${title}`}><Ellipsis size={18} /></button>
      </div>
      <div className="kpi-label">{title}</div>
      <div className="kpi-value tabular-nums">{value}</div>
      <div className="kpi-footer">
        <span className={`trend-pill ${change.startsWith('-') ? 'trend-down' : ''}`}>
          {change.startsWith('-') ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{change}
        </span>
        <span className="kpi-caption">{caption}</span>
        <svg className="sparkline" viewBox="0 0 140 28" aria-hidden="true">
          <polyline
            points={sparkline.map((point, index) => `${index * 12},${25 - (point / max) * 20}`).join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </article>
  )
}

function TrendTooltip({ active, payload, label, metric }: { active?: boolean; payload?: { value: number }[]; label?: string; metric: MetricKey }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <span>{label}</span>
      <strong>{formatTooltipValue(payload[0].value, metric)}</strong>
    </div>
  )
}

function ChannelChart({ onOpenReport }: { onOpenReport: () => void }) {
  const total = channelData.reduce((sum, channel) => sum + channel.amount, 0)
  return (
    <section className="panel channel-panel">
      <div className="panel-heading">
        <div><h2>Sales by channel</h2><p>Where your revenue comes from</p></div>
        <button className="icon-button" aria-label="Channel report options"><Ellipsis size={18} /></button>
      </div>
      <div className="channel-chart-wrap">
        <div className="donut-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={channelData} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius="70%" outerRadius="91%" paddingAngle={3} stroke="none" cornerRadius={4}>
                {channelData.map((channel) => <Cell key={channel.name} fill={channel.color} />)}
              </Pie>
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center"><strong>5</strong><span>channels</span></div>
        </div>
        <div className="channel-legend">
          {channelData.map((channel) => {
            const share = Math.round((channel.amount / total) * 100)
            return <div className="legend-row" key={channel.name}>
              <span className="legend-dot" style={{ backgroundColor: channel.color }} />
              <span className="legend-name">{channel.name}</span>
              <strong className="tabular-nums">{share}%</strong>
            </div>
          })}
        </div>
      </div>
      <div className="channel-total"><span>Revenue from all channels</span><strong className="tabular-nums">$106,731</strong></div>
      <button className="text-link" onClick={onOpenReport}>View channel report <ArrowRight size={14} /></button>
    </section>
  )
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [range, setRange] = useState<RangeKey>('30D')
  const [metric, setMetric] = useState<MetricKey>('revenue')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState('')
  const trend = getTrend(range)
  const selectedMetric = metricOptions.find((item) => item.id === metric)!
  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return orders
    return orders.filter((order) => `${order.id} ${order.customer} ${order.email} ${order.source} ${order.status}`.toLowerCase().includes(normalized))
  }, [query])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    window.setTimeout(() => { setRefreshing(false); notify('Dashboard data is up to date') }, 800)
  }

  const handleExport = () => {
    downloadCsv(filteredOrders)
    notify('Your orders CSV is ready')
  }

  const path = location.pathname.replace(/\/$/, '') || '/'
  const activePage = path === '/' || path === '/overview'
    ? 'Overview'
    : secondaryRoutes.find((route) => route.path === path)?.page ?? 'Not found'
  const pageTitle = activePage
  const navigateToPage = (page: string) => {
    navigate(pagePaths[page] ?? '/overview')
    if (page !== activePage) notify(`${page} view opened`)
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={navigateToPage} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{pageTitle}</strong></div>
          <div className="topbar-actions">
            <button className="help-link" onClick={() => notify('Help center coming soon')}><CircleHelp size={16} /> Help center</button>
            <span className="topbar-divider" />
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify('You’re all caught up')}><Bell size={18} /><i /></button>
            <button className="top-avatar" aria-label="Open profile menu" onClick={() => navigateToPage('Settings')}>AM</button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={
        <div className="content-wrap">
          <section className="page-intro">
            <div>
              <div className="eyebrow"><span className="live-dot" /> YOUR BUSINESS AT A GLANCE</div>
              <h1>Good morning, Alex <span className="wave">✦</span></h1>
              <p>Here’s what’s happening with your store today.</p>
            </div>
            <div className="intro-actions">
              <div className="range-switch" aria-label="Select date range">
                {(['7D', '30D', '90D'] as RangeKey[]).map((value) => <button className={range === value ? 'range-active' : ''} key={value} onClick={() => setRange(value)}>{value}</button>)}
              </div>
              <button className="date-button" onClick={() => notify(`Showing the last ${range === '7D' ? '7' : range === '30D' ? '30' : '90'} days`)}><CalendarDays size={15} /><span>{range === '7D' ? 'Oct 14 – Oct 20' : range === '90D' ? 'Jul 23 – Oct 20' : 'Sep 21 – Oct 20'}</span><ChevronDown size={14} /></button>
            </div>
          </section>

          <section className="kpi-grid" aria-label="Key performance indicators">
            <KpiCard title="Total revenue" value="$106,731" change="12.8%" caption="vs. last month" icon={CreditCard} tone="blue" sparkline={[4, 5, 4, 7, 6, 8, 7, 11, 9, 13, 12, 17]} />
            <KpiCard title="Total orders" value="2,847" change="8.2%" caption="vs. last month" icon={ShoppingBag} tone="green" sparkline={[5, 4, 7, 6, 8, 7, 9, 8, 11, 10, 14, 16]} />
            <KpiCard title="Store visitors" value="38,492" change="18.6%" caption="vs. last month" icon={UsersRound} tone="orange" sparkline={[3, 5, 4, 8, 6, 10, 8, 9, 12, 10, 16, 19]} />
            <KpiCard title="Conversion rate" value="3.24%" change="-0.4%" caption="vs. last month" icon={MousePointer2} tone="purple" sparkline={[16, 14, 16, 13, 15, 14, 12, 14, 11, 13, 10, 9]} />
          </section>

          <section className="analytics-grid">
            <div className="panel trend-panel">
              <div className="panel-heading trend-heading">
                <div><h2>Performance over time</h2><p>Track how your store is doing</p></div>
                <button className="icon-button chart-more" aria-label="Performance options"><Ellipsis size={18} /></button>
              </div>
              <div className="chart-toolbar">
                <div className="metric-switcher" aria-label="Choose chart metric">
                  {metricOptions.map((option) => <button key={option.id} className={metric === option.id ? 'metric-active' : ''} onClick={() => setMetric(option.id)}><span style={{ backgroundColor: option.color }} />{option.label}</button>)}
                </div>
                <div className="chart-note"><span className="chart-note-dot" />Compared to previous period</div>
              </div>
              <div className="trend-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 14, right: 10, left: -14, bottom: 0 }}>
                    <defs><linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={selectedMetric.color} stopOpacity={0.2} /><stop offset="92%" stopColor={selectedMetric.color} stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid vertical={false} stroke="#edf0f4" strokeDasharray="3 5" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8c96a8', fontSize: 11 }} tickMargin={12} interval="preserveStartEnd" />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c96a8', fontSize: 11 }} tickFormatter={(value: number) => formatNumber(value, metric)} tickMargin={8} width={53} />
                    <Tooltip content={<TrendTooltip metric={metric} />} cursor={{ stroke: '#ccd4e1', strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey={metric} stroke={selectedMetric.color} strokeWidth={2.5} fill="url(#metricFill)" activeDot={{ r: 5, fill: '#fff', stroke: selectedMetric.color, strokeWidth: 2.5 }} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-footer"><span><strong>+24.6%</strong> <span>compared to previous period</span></span><button className="text-link" onClick={() => navigateToPage('Revenue')}>View report <ArrowRight size={14} /></button></div>
            </div>
            <ChannelChart onOpenReport={() => navigateToPage('Revenue')} />
          </section>

          <section className="panel insight-banner">
            <div className="insight-orb"><Sparkles size={17} /></div>
            <div className="insight-copy"><strong>A little insight for you</strong><span>Direct traffic is up <b>24%</b> this month. Your returning customers are driving the increase.</span></div>
            <button onClick={() => navigateToPage('Revenue')}>Explore insight <ArrowRight size={14} /></button>
            <button className="icon-button insight-close" aria-label="Dismiss insight" onClick={(event) => event.currentTarget.closest('.insight-banner')?.remove()}><X size={15} /></button>
          </section>

          <section className="panel orders-panel">
            <div className="orders-heading">
              <div className="panel-heading-copy"><div className="title-with-badge"><h2>Recent orders</h2><span className="count-badge">1,284</span></div><p>A snapshot of your latest sales activity</p></div>
              <div className="orders-actions">
                <label className="search-box"><Search size={15} /><input aria-label="Search orders" placeholder="Search orders" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd><Command size={10} /> K</kbd></label>
                <button className="table-filter" onClick={() => notify('Filters: all statuses')}><SlidersHorizontal size={15} /> Filter</button>
                <button className="view-all" onClick={() => navigateToPage('Orders')}>View all <ArrowRight size={14} /></button>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>SOURCE</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th><th aria-label="Actions" /></tr></thead>
                <tbody>
                  {filteredOrders.length ? filteredOrders.map((order) => <tr key={order.id}>
                    <td className="order-id">{order.id}</td>
                    <td><div className="customer-cell"><span className={`customer-avatar avatar-${order.color}`}>{order.initials}</span><span><strong>{order.customer}</strong><small>{order.email}</small></span></div></td>
                    <td><span className="source-cell"><span className={`source-dot source-${order.source.toLowerCase().replace(' ', '-')}`} />{order.source}</span></td>
                    <td className="date-cell">{order.date}</td>
                    <td className="amount-cell tabular-nums">${order.amount.toFixed(2)}</td>
                    <td><span className={`status status-${order.status.toLowerCase()}`}><span />{order.status}</span></td>
                    <td><button className="icon-button row-more" aria-label={`More options for ${order.id}`}><Ellipsis size={17} /></button></td>
                  </tr>) : <tr><td colSpan={7} className="empty-state"><Search size={20} /><strong>No orders found</strong><span>Try another name, order ID, or channel.</span></td></tr>}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing <strong>{filteredOrders.length}</strong> of <strong>1,284</strong> orders</span><div className="pagination"><button aria-label="Previous page" disabled><ChevronLeft size={15} /></button><span>1</span><button aria-label="Next page" onClick={() => notify('You are viewing the latest orders')}><ChevronRight size={15} /></button></div></div>
          </section>

          <footer className="page-footer"><span>© 2026 Northstar Analytics</span><span>All figures are sample data for demonstration.</span><button onClick={handleRefresh}><ExternalLink size={13} /> Data updated 2 min ago</button></footer>
        </div>
          } />
          {secondaryRoutes.map(({ path: routePath, page }) => <Route key={routePath} path={routePath} element={<Suspense fallback={<div className="content-wrap route-page route-loading">Loading workspace…</div>}><SecondaryPage page={page} onNotify={notify} onNavigate={navigate} /></Suspense>} />)}
          <Route path="*" element={<Suspense fallback={<div className="content-wrap route-page route-loading">Loading workspace…</div>}><SecondaryPage page="Not found" onNotify={notify} onNavigate={navigate} /></Suspense>} />
        </Routes>
      </main>
      <div className="floating-actions">
        <button className="refresh-button" onClick={handleRefresh} disabled={refreshing}>{refreshing ? <LoaderCircle className="spin" size={15} /> : <Activity size={15} />}{refreshing ? 'Refreshing' : 'Refresh'}</button>
        {(activePage === 'Overview' || activePage === 'Orders') && <button className="export-button" onClick={handleExport}><Download size={15} /> Export CSV</button>}
      </div>
      {toast && <div className="toast" role="status"><span><Check size={15} /></span>{toast}</div>}
    </div>
  )
}
