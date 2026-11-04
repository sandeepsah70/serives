import React, { useState, useEffect } from 'react'
import type { Retailer, Order, Complaint } from '../types'
import { supabase } from '../supabaseClient'
import {
  Shield,
  Users,
  FileCheck2,
  Clock,
  Search,
  RefreshCw,
  Wallet,
  MessageSquare,
  Eye,
  ArrowLeft,
  X,
  Lock,
  User,
  KeyRound,
  LogOut,
  AlertCircle
} from 'lucide-react'

interface AdminPortalProps {
  onBackToHome: () => void
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToHome }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'orders' | 'retailers' | 'complaints'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [walletModalRetailer, setWalletModalRetailer] = useState<Retailer | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('500')

  // Check if admin is logged in
  useEffect(() => {
    const savedAdmin = localStorage.getItem('treta_admin_auth')
    if (savedAdmin === 'true') {
      setIsAdminLoggedIn(true)
      loadAllData()
    }
  }, [])

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAdminError(null)

    if (adminUsername.trim() === 'admin' && adminPassword === 'admin123') {
      setIsAdminLoggedIn(true)
      localStorage.setItem('treta_admin_auth', 'true')
      loadAllData()
    } else {
      setAdminError('Invalid credentials! Username is "admin" and Password is "admin123".')
    }
  }

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false)
    localStorage.removeItem('treta_admin_auth')
  }

  const handleFillAdminCredentials = () => {
    setAdminUsername('admin')
    setAdminPassword('admin123')
    setAdminError(null)
  }

  // Load all data from Supabase
  const loadAllData = async () => {
    setLoading(true)
    try {
      const { data: ordData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (ordData) setOrders(ordData as Order[])

      const { data: retData } = await supabase
        .from('retailers')
        .select('*')
        .order('created_at', { ascending: false })
      if (retData) setRetailers(retData as Retailer[])

      const { data: compData } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })
      if (compData) setComplaints(compData as Complaint[])
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (err) {
      console.error('Error updating order status:', err)
    }
  }

  const handleSaveWalletAdjustment = async () => {
    if (!walletModalRetailer) return
    const add = parseFloat(adjustAmount)
    if (isNaN(add)) return

    const newBal = Number(walletModalRetailer.wallet) + add
    await supabase.from('retailers').update({ wallet: newBal }).eq('id', walletModalRetailer.id)
    setRetailers((prev) =>
      prev.map((r) => (r.id === walletModalRetailer.id ? { ...r, wallet: newBal } : r))
    )
    setWalletModalRetailer(null)
  }

  const handleToggleComplaint = async (tktId: string, curStatus: string) => {
    const newStatus = curStatus === 'open' ? 'resolved' : 'open'
    await supabase.from('complaints').update({ status: newStatus }).eq('id', tktId)
    setComplaints((prev) =>
      prev.map((c) => (c.id === tktId ? { ...c, status: newStatus as 'open' | 'resolved' } : c))
    )
  }

  // 1. ADMIN LOGIN GATE
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black border border-white/20 rounded-3xl p-7 shadow-2xl text-white">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
              <Shield className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Treta <span className="text-[#E85D04]">Master Admin</span>
            </h2>
            <p className="text-xs text-white/50 mt-1">Authorized Access Only</p>
          </div>

          {/* Prominent Credentials Box */}
          <div className="mb-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                🔑 Admin Credentials
              </span>
              <button
                type="button"
                onClick={handleFillAdminCredentials}
                className="flex items-center gap-1 bg-amber-400 hover:bg-amber-500 text-black font-extrabold px-2.5 py-1 rounded-lg text-[10px] transition-all"
              >
                <KeyRound size={12} />
                <span>Auto Fill</span>
              </button>
            </div>
            <div className="space-y-1 font-mono text-white/80">
              <div>Username: <strong className="text-white">admin</strong></div>
              <div>Password: <strong className="text-white">admin123</strong></div>
            </div>
          </div>

          {adminError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{adminError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1">
                Admin Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3 text-white/40" />
                <input
                  type="text"
                  placeholder="admin"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-white/40" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#E85D04]/30 transition-all active:scale-98"
            >
              Sign In to Master Admin
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={onBackToHome}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              ← Back to Retailer Portal
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 2. ADMIN DASHBOARD CONTENT
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const completedOrders = orders.filter((o) => o.status === 'completed').length
  const totalRetailers = retailers.length
  const totalWalletVolume = retailers.reduce((acc, r) => acc + Number(r.wallet || 0), 0)

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      o.id.toLowerCase().includes(q) ||
      o.applicant_name.toLowerCase().includes(q) ||
      o.service_name.toLowerCase().includes(q) ||
      o.mobile.includes(q) ||
      o.reference_no.toLowerCase().includes(q) ||
      o.retailer_name.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 max-w-7xl mx-auto selection:bg-[#E85D04]/30">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors"
            title="Back to portal"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-amber-400" />
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Treta Enterprises <span className="text-[#E85D04]">Master Admin</span>
              </h1>
            </div>
            <p className="text-white/50 text-xs mt-0.5">
              Live Control Desk • Connected to Supabase Project <code>odgyrlkenxufbfdeqsvx</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold rounded-xl transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#E85D04]' : ''} />
            <span>Refresh Live Data</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition-all"
          >
            <LogOut size={14} />
            <span>Admin Logout</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>Total Retailers</span>
            <Users size={16} className="text-[#E85D04]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalRetailers}</div>
          <span className="text-[10px] text-green-400 font-medium">Registered Retailers</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>Total Applications</span>
            <FileCheck2 size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalOrders}</div>
          <span className="text-[10px] text-white/40">Total orders submitted</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>Pending Approvals</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{pendingOrders}</div>
          <span className="text-[10px] text-amber-400/80">Requires processing</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>Retailers Wallet Volume</span>
            <Wallet size={16} className="text-green-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-green-400">
            ₹{totalWalletVolume.toFixed(2)}
          </div>
          <span className="text-[10px] text-white/40">Total in retailer balances</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-[#E85D04] text-white shadow-md'
              : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <FileCheck2 size={15} />
          <span>All Applications / Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('retailers')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'retailers'
              ? 'bg-[#E85D04] text-white shadow-md'
              : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <Users size={15} />
          <span>Registered Retailers ({retailers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'complaints'
              ? 'bg-[#E85D04] text-white shadow-md'
              : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <MessageSquare size={15} />
          <span>Support & Complaints ({complaints.length})</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/40">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-3 text-white/40" />
              <input
                type="text"
                placeholder="Search order ID, applicant, service, mobile, ref no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E85D04]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/50 text-[11px]">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black border border-white/15 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E85D04]"
              >
                <option value="all">All ({orders.length})</option>
                <option value="pending">Pending ({pendingOrders})</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed ({completedOrders})</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/50 uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Service</th>
                  <th className="p-3.5">Applicant Details</th>
                  <th className="p-3.5">Retailer</th>
                  <th className="p-3.5">Fee</th>
                  <th className="p-3.5">Current Status</th>
                  <th className="p-3.5">Status Updater</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-white/40">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const statusColors = {
                      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                      processing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                      completed: 'bg-green-500/10 text-green-400 border-green-500/30',
                      rejected: 'bg-red-500/10 text-red-400 border-red-500/30'
                    }

                    return (
                      <tr key={ord.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="p-3.5 font-mono text-white font-bold">{ord.id}</td>
                        <td className="p-3.5">
                          <span className="font-semibold text-white block">{ord.service_name}</span>
                          <span className="text-[10px] text-white/40 font-mono">
                            {ord.reference_no}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-white">{ord.applicant_name}</div>
                          <div className="text-[11px] text-white/50 font-mono">{ord.mobile}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="text-white block font-medium">{ord.retailer_name}</span>
                          <span className="text-[10px] text-white/40 font-mono">{ord.user_id}</span>
                        </td>
                        <td className="p-3.5 font-bold text-[#E85D04]">₹{ord.fee}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-wider ${
                              statusColors[ord.status] || ''
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            {ord.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'completed')}
                                className="px-2 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded text-[10px] font-bold"
                              >
                                Complete
                              </button>
                            )}
                            {ord.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'processing')}
                                className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold"
                              >
                                Process
                              </button>
                            )}
                            {ord.status !== 'rejected' && ord.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'rejected')}
                                className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] font-bold"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Retailers */}
      {activeTab === 'retailers' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Users size={16} className="text-[#E85D04]" />
              <span>Registered Retailers</span>
            </h3>
            <span className="text-xs text-white/40">{retailers.length} Retailers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/50 uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-3.5">Retailer</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Wallet Balance</th>
                  <th className="p-3.5">Joined</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {retailers.map((ret) => (
                  <tr key={ret.id} className="hover:bg-white/[0.04]">
                    <td className="p-3.5 font-semibold text-white">{ret.name}</td>
                    <td className="p-3.5 font-mono text-white">{ret.mobile}</td>
                    <td className="p-3.5 text-white/60">{ret.email || 'N/A'}</td>
                    <td className="p-3.5 font-bold text-green-400">
                      ₹{Number(ret.wallet).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-white/40">
                      {new Date(ret.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => setWalletModalRetailer(ret)}
                        className="px-2.5 py-1 bg-[#E85D04]/10 hover:bg-[#E85D04]/20 border border-[#E85D04]/40 text-[#E85D04] rounded-lg text-[11px] font-bold"
                      >
                        Adjust Wallet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Complaints */}
      {activeTab === 'complaints' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-[#E85D04]" />
              <span>Complaints & Tickets</span>
            </h3>
            <span className="text-xs text-white/40">{complaints.length} Tickets</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/50 uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-3.5">Ticket ID</th>
                  <th className="p-3.5">Retailer</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-white/40">
                      No complaints or tickets reported.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.04]">
                      <td className="p-3.5 font-mono text-white font-bold">{c.id}</td>
                      <td className="p-3.5 font-medium text-white">{c.retailer_name}</td>
                      <td className="p-3.5 font-semibold text-white">{c.subject}</td>
                      <td className="p-3.5 max-w-xs text-white/60">{c.message}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                            c.status === 'resolved'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleComplaint(c.id, c.status)}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] font-semibold"
                        >
                          Mark as {c.status === 'open' ? 'Resolved' : 'Open'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-black border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl text-white">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-[#E85D04]" size={20} />
              <h3 className="font-extrabold text-lg text-white">
                Application Details: {selectedOrder.id}
              </h3>
            </div>

            <div className="space-y-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/10 mb-6">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/50">Service Applied:</span>
                <span className="font-bold text-white">{selectedOrder.service_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/50">Applicant Name:</span>
                <span className="font-semibold text-white">{selectedOrder.applicant_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/50">Applicant Mobile:</span>
                <span className="font-mono text-white">{selectedOrder.mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/50">Reference / Aadhar:</span>
                <span className="font-mono text-[#E85D04] font-bold">
                  {selectedOrder.reference_no}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/50">Retailer:</span>
                <span className="text-white">
                  {selectedOrder.retailer_name} ({selectedOrder.user_id})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/50">Fee Charged:</span>
                <span className="font-bold text-green-400">₹{selectedOrder.fee}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/50">Status:</span>
                <span className="font-bold uppercase text-[#E85D04]">{selectedOrder.status}</span>
              </div>
              {selectedOrder.notes && (
                <div className="pt-2">
                  <span className="text-white/50 block mb-1">Notes / Instructions:</span>
                  <div className="p-2 bg-black/60 rounded-lg text-white/80">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed')}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-black font-bold text-xs rounded-xl transition-all"
              >
                Mark as Completed
              </button>
              <button
                onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'processing')}
                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all"
              >
                Mark as In Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Wallet Modal */}
      {walletModalRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-black border border-white/20 rounded-3xl p-6 shadow-2xl text-white">
            <button
              onClick={() => setWalletModalRetailer(null)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-base text-white mb-1">
              Adjust Retailer Wallet: {walletModalRetailer.name}
            </h3>
            <p className="text-xs text-white/50 mb-4">
              Current balance: ₹{Number(walletModalRetailer.wallet).toFixed(2)}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">
                  Amount to Add / Deduct (₹)
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#E85D04]"
                />
              </div>

              <button
                onClick={handleSaveWalletAdjustment}
                className="w-full py-2.5 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#E85D04]/30"
              >
                Update Wallet Balance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
