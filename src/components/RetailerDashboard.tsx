import React, { useState, useEffect } from 'react'
import type { Retailer, Order, ServiceItem } from '../types'
import { SERVICES_LIST } from '../servicesData'
import { supabase } from '../supabaseClient'
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  MessageSquare,
  Plus,
  Loader2,
  X,
  CreditCard,
  Send
} from 'lucide-react'

interface RetailerDashboardProps {
  retailer: Retailer
  onUpdateRetailer: (ret: Retailer) => void
  onAdminClick: () => void
}

export const RetailerDashboard: React.FC<RetailerDashboardProps> = ({
  retailer,
  onUpdateRetailer,
  onAdminClick
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'orders' | 'complaints'>('services')
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  // Apply form state
  const [applicantName, setApplicantName] = useState('')
  const [applicantMobile, setApplicantMobile] = useState('')
  const [referenceNo, setReferenceNo] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [submittingOrder, setSubmittingOrder] = useState(false)
  const [orderMsg, setOrderMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Wallet add modal state
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState('500')

  // Complaint state
  const [complaintSubject, setComplaintSubject] = useState('')
  const [complaintMsg, setComplaintMsg] = useState('')
  const [complaintSent, setComplaintSent] = useState(false)

  // Load orders for this retailer from Supabase
  const loadOrders = async () => {
    setLoadingOrders(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', retailer.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading orders:', error)
      } else if (data) {
        setOrders(data as Order[])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [retailer.id])

  const handleOpenApply = (svc: ServiceItem) => {
    setSelectedService(svc)
    setApplicantName('')
    setApplicantMobile(retailer.mobile)
    setReferenceNo(`REF-${Math.floor(100000 + Math.random() * 900000)}`)
    setOrderNotes('')
    setOrderMsg(null)
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService) return

    if (!applicantName.trim() || !applicantMobile.trim()) {
      setOrderMsg({ type: 'error', text: 'Please fill in applicant name and mobile.' })
      return
    }

    if (retailer.wallet < selectedService.fee) {
      setOrderMsg({
        type: 'error',
        text: `Insufficient wallet balance (₹${retailer.wallet}). Fee is ₹${selectedService.fee}. Please add money.`
      })
      return
    }

    setSubmittingOrder(true)
    try {
      const newOrder: Order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        user_id: retailer.id,
        retailer_name: retailer.name,
        service_name: selectedService.label,
        applicant_name: applicantName.trim(),
        mobile: applicantMobile.trim(),
        reference_no: referenceNo.trim() || `REF-${Date.now().toString().slice(-6)}`,
        fee: selectedService.fee,
        status: 'pending',
        notes: orderNotes.trim(),
        created_at: new Date().toISOString()
      }

      // 1. Insert into Supabase
      const { error: insErr } = await supabase.from('orders').insert(newOrder)
      if (insErr) {
        console.error('Order insert error:', insErr)
      }

      // 2. Deduct wallet
      const newBalance = Number(retailer.wallet) - selectedService.fee
      const updatedRet = { ...retailer, wallet: newBalance }
      await supabase
        .from('retailers')
        .update({ wallet: newBalance })
        .eq('id', retailer.id)

      onUpdateRetailer(updatedRet)
      setOrders((prev) => [newOrder, ...prev])

      setOrderMsg({
        type: 'success',
        text: `Application submitted successfully! Order ID: ${newOrder.id}. Fee ₹${selectedService.fee} deducted.`
      })

      setTimeout(() => {
        setSelectedService(null)
        setActiveTab('orders')
      }, 1500)
    } catch (err: unknown) {
      if (err instanceof Error) setOrderMsg({ type: 'error', text: err.message })
      else setOrderMsg({ type: 'error', text: 'Failed to submit application.' })
    } finally {
      setSubmittingOrder(false)
    }
  }

  const handleRechargeWallet = async () => {
    const amt = parseFloat(rechargeAmount)
    if (isNaN(amt) || amt <= 0) return

    const newBalance = Number(retailer.wallet) + amt
    const updated = { ...retailer, wallet: newBalance }
    await supabase.from('retailers').update({ wallet: newBalance }).eq('id', retailer.id)
    onUpdateRetailer(updated)
    setShowWalletModal(false)
  }

  const handleSendComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!complaintSubject.trim() || !complaintMsg.trim()) return

    const newComplaint = {
      id: `TKT-${Date.now().toString().slice(-5)}`,
      user_id: retailer.id,
      retailer_name: retailer.name,
      subject: complaintSubject.trim(),
      message: complaintMsg.trim(),
      status: 'open',
      created_at: new Date().toISOString()
    }

    await supabase.from('complaints').insert(newComplaint)
    setComplaintSent(true)
    setComplaintSubject('')
    setComplaintMsg('')
    setTimeout(() => setComplaintSent(false), 3000)
  }

  const categories = ['All', 'PAN Services', 'Transport Services', 'CSC Services', 'Bill Payments', 'Identity Services']

  const filteredServices = SERVICES_LIST.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory
    const matchesSearch =
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Top Banner with Retailer & Wallet */}
      <div className="bg-gradient-to-r from-white/5 via-white/[0.07] to-white/5 border border-white/10 rounded-3xl p-5 sm:p-7 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-[#E85D04] font-bold">
              Retailer Desk
            </span>
            <span className="text-white/20">•</span>
            <span className="text-xs text-white/50">{retailer.mobile}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {retailer.name}
          </h1>
          <p className="text-white/50 text-xs mt-1">
            Apply for customer PAN, DL/RC, TEC certificates, and manage orders with 1-click execution.
          </p>
        </div>

        {/* Wallet Balance Card */}
        <div className="flex items-center gap-4 bg-black/60 border border-white/15 px-5 py-4 rounded-2xl w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E85D04]/20 border border-[#E85D04]/40 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-[#E85D04]" />
            </div>
            <div>
              <span className="text-[11px] text-white/50 block font-medium">Available Balance</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white">
                ₹{Number(retailer.wallet).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowWalletModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-[#E85D04]/20"
          >
            <Plus size={14} />
            <span>Add Money</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'services'
                ? 'bg-[#E85D04] text-white shadow-md'
                : 'bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            Services Catalog ({SERVICES_LIST.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#E85D04] text-white shadow-md'
                : 'bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            <span>My Applications / Orders</span>
            {orders.length > 0 && (
              <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-md text-[10px]">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'complaints'
                ? 'bg-[#E85D04] text-white shadow-md'
                : 'bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            Support / Complaints
          </button>
        </div>

        <button
          onClick={onAdminClick}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-xl transition-all"
        >
          <span>Open Admin Desk</span>
          <span className="text-[10px]">→</span>
        </button>
      </div>

      {/* Tab 1: Services Catalog */}
      {activeTab === 'services' && (
        <div>
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-3 text-white/40" />
              <input
                type="text"
                placeholder="Search services (e.g. PAN, DL, TEC, Ration)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E85D04]"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-white/5 text-white/50 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((svc) => (
              <div
                key={svc.id}
                className="bg-white/5 border border-white/10 hover:border-[#E85D04]/60 rounded-2xl p-5 flex flex-col justify-between transition-all hover:bg-white/[0.07] group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${svc.color}25` }}
                    >
                      <CreditCard size={20} style={{ color: svc.color }} />
                    </div>
                    <span className="text-xs font-extrabold text-[#E85D04] bg-[#E85D04]/10 border border-[#E85D04]/30 px-2.5 py-1 rounded-lg">
                      ₹{svc.fee}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white group-hover:text-[#E85D04] transition-colors mb-1">
                    {svc.label}
                  </h3>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-2 font-semibold">
                    {svc.category}
                  </span>
                  <p className="text-xs text-white/60 mb-4 leading-relaxed">
                    {svc.description}
                  </p>

                  <div className="mb-4">
                    <span className="text-[10px] text-white/40 block font-semibold mb-1">
                      Requirements:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {svc.requirements.map((req) => (
                        <span
                          key={req}
                          className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/70"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenApply(svc)}
                  className="w-full mt-2 py-2.5 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#E85D04]/20 active:scale-98"
                >
                  <span>Apply Now (₹{svc.fee})</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: My Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText size={16} className="text-[#E85D04]" />
              <span>Application Submissions</span>
            </h3>
            <button
              onClick={loadOrders}
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              Refresh Data
            </button>
          </div>

          {loadingOrders ? (
            <div className="p-12 text-center text-white/40 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-[#E85D04]" size={24} />
              <span className="text-xs">Loading orders from Supabase...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-white/40">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No applications submitted yet.</p>
              <button
                onClick={() => setActiveTab('services')}
                className="mt-3 text-xs text-[#E85D04] hover:underline"
              >
                Browse services to create an application →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-white/50 uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Service</th>
                    <th className="p-3.5">Applicant Name</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">Ref No.</th>
                    <th className="p-3.5">Fee</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {orders.map((ord) => {
                    const statusColors = {
                      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                      processing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                      completed: 'bg-green-500/10 text-green-400 border-green-500/30',
                      rejected: 'bg-red-500/10 text-red-400 border-red-500/30'
                    }

                    return (
                      <tr key={ord.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-3.5 font-mono text-white font-semibold">{ord.id}</td>
                        <td className="p-3.5 font-medium text-white">{ord.service_name}</td>
                        <td className="p-3.5">{ord.applicant_name}</td>
                        <td className="p-3.5 text-white/60">{ord.mobile}</td>
                        <td className="p-3.5 font-mono text-xs text-white/50">
                          {ord.reference_no}
                        </td>
                        <td className="p-3.5 font-semibold text-[#E85D04]">₹{ord.fee}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-wider ${
                              statusColors[ord.status] || ''
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-white/40 text-[11px]">
                          {new Date(ord.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Complaints Desk */}
      {activeTab === 'complaints' && (
        <div className="max-w-xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="text-[#E85D04]" size={20} />
            <h3 className="font-bold text-base text-white">Treta Support & Helpdesk</h3>
          </div>
          <p className="text-xs text-white/50 mb-6">
            Facing issues with a PAN card slip, DL download, or wallet recharge? Raise a ticket and
            our support desk will process it immediately.
          </p>

          {complaintSent && (
            <div className="mb-4 p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Ticket submitted successfully! Admin has been notified.</span>
            </div>
          )}

          <form onSubmit={handleSendComplaint} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-white/70 block mb-1">
                Subject / Issue Category
              </label>
              <input
                type="text"
                placeholder="e.g. PAN slip not generated for ORD-2026-901"
                value={complaintSubject}
                onChange={(e) => setComplaintSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E85D04]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-white/70 block mb-1">
                Description / Message
              </label>
              <textarea
                rows={4}
                placeholder="Describe your issue with reference ID, applicant name..."
                value={complaintMsg}
                onChange={(e) => setComplaintMsg(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E85D04]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#E85D04]/20 transition-all"
            >
              <Send size={14} />
              <span>Submit Ticket</span>
            </button>
          </form>
        </div>
      )}

      {/* Apply Service Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-black border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl text-white">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${selectedService.color}25` }}
              >
                <CreditCard size={20} style={{ color: selectedService.color }} />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  Apply for {selectedService.label}
                </h3>
                <span className="text-xs text-[#E85D04] font-bold">
                  Service Fee: ₹{selectedService.fee}
                </span>
              </div>
            </div>

            {orderMsg && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  orderMsg.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {orderMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{orderMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">
                  Applicant Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E85D04]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-white/70 block mb-1">
                    Applicant Mobile *
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={applicantMobile}
                    onChange={(e) => setApplicantMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E85D04]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-white/70 block mb-1">
                    Ref / Aadhar No.
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E85D04]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">
                  Application Notes / Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Father's Name, DOB, or correction notes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E85D04]"
                />
              </div>

              {/* Wallet Summary */}
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                <span className="text-white/60">Current Wallet:</span>
                <span className="font-bold text-white">₹{Number(retailer.wallet).toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="w-1/3 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-2/3 py-2.5 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-[#E85D04]/30 disabled:opacity-50"
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Confirm & Pay ₹{selectedService.fee}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-black border border-white/20 rounded-3xl p-6 shadow-2xl text-white">
            <button
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-lg text-white mb-1">Recharge Wallet</h3>
            <p className="text-xs text-white/50 mb-5">
              Add balance to your retailer portal wallet instantly.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['200', '500', '1000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRechargeAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      rechargeAmount === amt
                        ? 'bg-[#E85D04] text-white border-[#E85D04]'
                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    + ₹{amt}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">
                  Custom Amount (₹)
                </label>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#E85D04]"
                />
              </div>

              <button
                type="button"
                onClick={handleRechargeWallet}
                className="w-full py-3 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#E85D04]/30 transition-all"
              >
                Add ₹{rechargeAmount} to Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
