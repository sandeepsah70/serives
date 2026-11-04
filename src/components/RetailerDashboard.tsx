import React, { useState, useEffect } from 'react'
import type { Retailer, Order, ServiceItem } from '../types'
import { SERVICES_LIST } from '../servicesData'
import { supabase } from '../supabaseClient'
import {
  LayoutDashboard,
  Layers,
  ClipboardList,
  Printer,
  Wallet as WalletIcon,
  User as UserIcon,
  AlertTriangle,
  LogOut,
  Camera,
  MessageCircle,
  FileText,
  Search,
  CreditCard,
  Edit3,
  Smartphone,
  Car,
  FileCheck,
  BookOpen,
  GraduationCap,
  Sparkles,
  Coins,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface RetailerDashboardProps {
  retailer: Retailer
  onUpdateRetailer: (ret: Retailer) => void
  onLogout: () => void
}

export const RetailerDashboard: React.FC<RetailerDashboardProps> = ({
  retailer,
  onUpdateRetailer,
  onLogout
}) => {
  const [activeMenu, setActiveMenu] = useState<
    'dashboard' | 'services' | 'orders' | 'prints' | 'wallet' | 'account' | 'complaints'
  >('dashboard')

  const [orders, setOrders] = useState<Order[]>([])
  const [complaintsCount, setComplaintsCount] = useState(0)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)

  // Order apply modal form state
  const [applicantName, setApplicantName] = useState('')
  const [applicantMobile, setApplicantMobile] = useState('')
  const [referenceNo, setReferenceNo] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [submittingOrder, setSubmittingOrder] = useState(false)
  const [orderMsg, setOrderMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Wallet add modal
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [rechargeAmt, setRechargeAmt] = useState('500')

  // Complaint state
  const [complaintSubject, setComplaintSubject] = useState('')
  const [complaintMsg, setComplaintMsg] = useState('')
  const [complaintSuccess, setComplaintSuccess] = useState(false)

  // Load orders & complaints from Supabase
  const loadData = async () => {
    try {
      const { data: ords } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', retailer.id)
        .order('created_at', { ascending: false })
      if (ords) setOrders(ords as Order[])

      const { data: comps } = await supabase
        .from('complaints')
        .select('id')
        .eq('user_id', retailer.id)
      if (comps) setComplaintsCount(comps.length)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
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

      await supabase.from('orders').insert(newOrder)

      const newBal = Math.max(0, Number(retailer.wallet) - selectedService.fee)
      const updated = { ...retailer, wallet: newBal }
      await supabase.from('retailers').update({ wallet: newBal }).eq('id', retailer.id)
      onUpdateRetailer(updated)

      setOrders((prev) => [newOrder, ...prev])
      setOrderMsg({
        type: 'success',
        text: `Application submitted successfully! Order ID: ${newOrder.id}`
      })

      setTimeout(() => {
        setSelectedService(null)
        setActiveMenu('orders')
      }, 1200)
    } catch (err: unknown) {
      if (err instanceof Error) setOrderMsg({ type: 'error', text: err.message })
      else setOrderMsg({ type: 'error', text: 'Failed to submit application.' })
    } finally {
      setSubmittingOrder(false)
    }
  }

  const handleRechargeWallet = async () => {
    const add = parseFloat(rechargeAmt)
    if (isNaN(add) || add <= 0) return

    const newBal = Number(retailer.wallet) + add
    const updated = { ...retailer, wallet: newBal }
    await supabase.from('retailers').update({ wallet: newBal }).eq('id', retailer.id)
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
    setComplaintsCount((c) => c + 1)
    setComplaintSuccess(true)
    setComplaintSubject('')
    setComplaintMsg('')
    setTimeout(() => setComplaintSuccess(false), 3000)
  }

  // Icons mapper for exact screenshot matching
  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'pan-no-dob':
        return <FileText className="h-6 w-6 text-white" />
      case 'pan-finder':
        return <Search className="h-6 w-6 text-white" />
      case 'pan-new':
        return <CreditCard className="h-6 w-6 text-white" />
      case 'pan-corr':
        return <Edit3 className="h-6 w-6 text-white" />
      case 'voter-mobile-otp':
        return <Smartphone className="h-6 w-6 text-white" />
      case 'dl-download':
        return <Car className="h-6 w-6 text-white" />
      case 'rc-download':
        return <FileCheck className="h-6 w-6 text-white" />
      case 'll-exam':
        return <BookOpen className="h-6 w-6 text-white" />
      case 'tec-cert':
        return <GraduationCap className="h-6 w-6 text-white" />
      default:
        return <FileText className="h-6 w-6 text-white" />
    }
  }

  const identityServices = SERVICES_LIST.filter((s) => s.category === 'IDENTITY SERVICES')
  const transportServices = SERVICES_LIST.filter((s) => s.category === 'TRANSPORT SERVICES')
  const educationServices = SERVICES_LIST.filter((s) => s.category === 'EDUCATION SERVICES')

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex font-sans antialiased">
      {/* 1. LEFT SIDEBAR (Dark - exactly as in screenshot) */}
      <aside className="w-64 bg-[#0d0d0d] text-white flex flex-col justify-between shrink-0 border-r border-white/5 select-none min-h-screen">
        <div>
          {/* Logo Header */}
          <div className="py-6 px-5 flex flex-col items-center justify-center border-b border-white/5">
            <img
              src="./treta-hero-logo.png"
              alt="Treta Enterprises"
              className="h-16 w-16 object-contain mb-1.5"
            />
            <span className="text-[11px] font-extrabold text-[#E85D04] tracking-widest uppercase">
              TRETA ENTERPRISES
            </span>
          </div>

          {/* Sidebar Wallet Card */}
          <div className="mx-3 mt-4 mb-3 p-3 bg-[#1c140e] border border-[#E85D04]/25 rounded-2xl">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E85D04]">
                <Coins size={16} />
                <span>Wallet</span>
              </div>
              <span className="text-sm font-extrabold text-[#E85D04]">
                ₹{Number(retailer.wallet).toFixed(0)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/50">
              <Sparkles size={11} className="text-amber-400" />
              <span>1 Free service available</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-2 space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeMenu === 'dashboard'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard size={17} className={activeMenu === 'dashboard' ? 'text-[#E85D04]' : ''} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveMenu('services')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeMenu === 'services'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers size={17} />
              <span>Services</span>
            </button>

            <button
              onClick={() => setActiveMenu('orders')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeMenu === 'orders'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <ClipboardList size={17} />
              <span>My Orders</span>
              {orders.length > 0 && (
                <span className="ml-auto bg-[#E85D04] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu('prints')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeMenu === 'prints'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Printer size={17} />
              <span>Print Manage</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('wallet')
                setShowWalletModal(true)
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeMenu === 'wallet'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <WalletIcon size={17} />
              <span>Wallet</span>
            </button>

            <button
              onClick={() => setActiveMenu('account')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeMenu === 'account'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserIcon size={17} />
              <span>My Account</span>
            </button>

            <button
              onClick={() => setActiveMenu('complaints')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeMenu === 'complaints'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <AlertTriangle size={17} />
              <span>Complaint</span>
            </button>
          </nav>
        </div>

        {/* Logout at bottom */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 font-medium text-xs transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. RIGHT CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar (White) */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="font-extrabold text-[#E85D04] text-lg tracking-tight select-none">
            Treta Enterprises
          </div>

          <div className="flex items-center gap-4">
            {/* Wallet Pill */}
            <div
              onClick={() => setShowWalletModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fff7ed] border border-[#fed7aa] cursor-pointer hover:bg-[#ffedd5] transition-all"
            >
              <Coins size={15} className="text-[#E85D04]" />
              <span className="text-xs font-bold text-[#E85D04]">
                ₹{Number(retailer.wallet).toFixed(0)}
              </span>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 select-none">
              <div className="text-right">
                <span className="text-xs font-bold text-gray-900 block leading-tight">
                  {retailer.name}
                </span>
                <span className="text-[10px] text-gray-400 capitalize block">retailer</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#E85D04] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {retailer.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Body Canvas */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {activeMenu === 'dashboard' || activeMenu === 'services' ? (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Welcome Row with Big Wallet */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Welcome, {retailer.name}
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">Your Treta Enterprises portal</p>
                </div>

                <div
                  onClick={() => setShowWalletModal(true)}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#fff7ed] border border-[#fed7aa] cursor-pointer shadow-sm hover:shadow transition-all"
                >
                  <Coins size={20} className="text-[#E85D04]" />
                  <span className="text-xl font-extrabold text-[#E85D04]">
                    ₹ {Number(retailer.wallet).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* 3 Quick Stat Cards */}
              <div className="flex items-center justify-between gap-4">
                <div className="grid grid-cols-3 gap-4 flex-1 max-w-xl">
                  {/* Services Card */}
                  <div
                    onClick={() => setActiveMenu('services')}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 cursor-pointer hover:border-gray-300 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Layers size={18} />
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-gray-900 leading-none">10</div>
                      <div className="text-[11px] text-gray-400 font-medium mt-1">Services</div>
                    </div>
                  </div>

                  {/* Prints Card */}
                  <div
                    onClick={() => setActiveMenu('prints')}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 cursor-pointer hover:border-gray-300 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#E85D04] flex items-center justify-center shrink-0">
                      <Printer size={18} />
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-gray-900 leading-none">0</div>
                      <div className="text-[11px] text-gray-400 font-medium mt-1">Prints</div>
                    </div>
                  </div>

                  {/* Complaints Card */}
                  <div
                    onClick={() => setActiveMenu('complaints')}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 cursor-pointer hover:border-gray-300 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-gray-900 leading-none">
                        {complaintsCount}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium mt-1">Complaints</div>
                    </div>
                  </div>
                </div>

                {/* Right Camera / Action Button */}
                <button
                  onClick={() => alert('Screenshot captured!')}
                  className="w-11 h-11 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900 hover:shadow flex items-center justify-center transition-all shrink-0"
                  title="Capture Portal View"
                >
                  <Camera size={18} />
                </button>
              </div>

              {/* 3. SERVICE CATEGORY 1: IDENTITY SERVICES */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    IDENTITY SERVICES
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                  {identityServices.map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => handleOpenApply(svc)}
                      className="bg-white border border-gray-200/80 hover:border-[#E85D04] hover:shadow-md rounded-2xl p-4 flex flex-col items-center text-center justify-between gap-3 cursor-pointer transition-all group min-h-[150px]"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: svc.color }}
                      >
                        {getServiceIcon(svc.id)}
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-[#E85D04] transition-colors line-clamp-2 leading-tight">
                          {svc.label}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-[#E85D04]">₹{svc.fee}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. SERVICE CATEGORY 2: TRANSPORT SERVICES */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]"></span>
                  <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    TRANSPORT SERVICES
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                  {transportServices.map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => handleOpenApply(svc)}
                      className="bg-white border border-gray-200/80 hover:border-[#E85D04] hover:shadow-md rounded-2xl p-4 flex flex-col items-center text-center justify-between gap-3 cursor-pointer transition-all group min-h-[150px]"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: svc.color }}
                      >
                        {getServiceIcon(svc.id)}
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-[#E85D04] transition-colors line-clamp-2 leading-tight">
                          {svc.label}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-[#E85D04]">₹{svc.fee}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. SERVICE CATEGORY 3: EDUCATION SERVICES */}
              <div className="pt-4 pb-12">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    EDUCATION SERVICES
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                  {educationServices.map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => handleOpenApply(svc)}
                      className="bg-white border border-gray-200/80 hover:border-[#E85D04] hover:shadow-md rounded-2xl p-4 flex flex-col items-center text-center justify-between gap-3 cursor-pointer transition-all group min-h-[150px]"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: svc.color }}
                      >
                        {getServiceIcon(svc.id)}
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-[#E85D04] transition-colors line-clamp-2 leading-tight">
                          {svc.label}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-[#E85D04]">₹{svc.fee}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeMenu === 'orders' ? (
            /* Orders View */
            <div className="max-w-6xl mx-auto bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">My Applications & Orders</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Live applications submitted to Treta Enterprises portal
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="text-xs font-semibold text-[#E85D04] hover:underline"
                >
                  Refresh Orders
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <ClipboardList size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No applications submitted yet.</p>
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="mt-3 text-xs font-bold text-[#E85D04] hover:underline"
                  >
                    Go to Dashboard & Apply →
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] border-b border-gray-200">
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
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((ord) => {
                        const statusColors = {
                          pending: 'bg-amber-50 text-amber-600 border-amber-200',
                          processing: 'bg-blue-50 text-blue-600 border-blue-200',
                          completed: 'bg-green-50 text-green-600 border-green-200',
                          rejected: 'bg-red-50 text-red-600 border-red-200'
                        }
                        return (
                          <tr key={ord.id} className="hover:bg-gray-50">
                            <td className="p-3.5 font-mono font-bold text-gray-900">{ord.id}</td>
                            <td className="p-3.5 font-semibold text-gray-900">{ord.service_name}</td>
                            <td className="p-3.5 font-medium">{ord.applicant_name}</td>
                            <td className="p-3.5 text-gray-500">{ord.mobile}</td>
                            <td className="p-3.5 font-mono text-gray-400">{ord.reference_no}</td>
                            <td className="p-3.5 font-bold text-[#E85D04]">₹{ord.fee}</td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${
                                  statusColors[ord.status] || ''
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-gray-400">
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
          ) : activeMenu === 'prints' ? (
            /* Print Manage View */
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center py-16">
              <Printer size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-base text-gray-900">Print Management Desk</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No pending certificates or slips in print queue. Slips appear here automatically when orders are approved by Admin.
              </p>
            </div>
          ) : activeMenu === 'complaints' ? (
            /* Complaints Desk */
            <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-base text-gray-900 mb-1">Treta Helpdesk & Complaint</h3>
              <p className="text-xs text-gray-500 mb-6">
                Submit issue with any PAN slip, DL download or order reference.
              </p>

              {complaintSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Complaint ticket submitted! Admin will resolve it shortly.</span>
                </div>
              )}

              <form onSubmit={handleSendComplaint} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Subject / Issue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PAN slip download link not received"
                    value={complaintSubject}
                    onChange={(e) => setComplaintSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E85D04]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Details
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your issue with reference ID..."
                    value={complaintMsg}
                    onChange={(e) => setComplaintMsg(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E85D04]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Submit Complaint
                </button>
              </form>
            </div>
          ) : (
            /* Account View */
            <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-base text-gray-900 mb-4">Retailer Account Details</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Retailer Name:</span>
                  <span className="font-bold text-gray-900">{retailer.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Mobile Number:</span>
                  <span className="font-mono font-semibold text-gray-900">{retailer.mobile}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-900">{retailer.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Wallet Balance:</span>
                  <span className="font-bold text-[#E85D04]">₹{Number(retailer.wallet).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Portal Member Since:</span>
                  <span className="text-gray-600">{new Date(retailer.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating WhatsApp Help Button (as in screenshot) */}
      <a
        href="https://wa.me/917042702156"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-xl hover:shadow-2xl transition-all select-none"
      >
        <MessageCircle size={17} />
        <span>Help</span>
      </a>

      {/* Application Form Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl text-gray-900">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: selectedService.color }}
              >
                {getServiceIcon(selectedService.id)}
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">
                  {selectedService.label}
                </h3>
                <span className="text-xs text-[#E85D04] font-bold">
                  Fee: ₹{selectedService.fee}
                </span>
              </div>
            </div>

            {orderMsg && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  orderMsg.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {orderMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{orderMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Applicant Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#E85D04]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Applicant Mobile *
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={applicantMobile}
                    onChange={(e) => setApplicantMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#E85D04]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Ref / Aadhar Number
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#E85D04]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Notes / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Father's Name, DOB, or correction notes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#E85D04]"
                />
              </div>

              <div className="bg-[#fff7ed] p-3 rounded-xl border border-[#fed7aa] flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">Wallet Balance:</span>
                <span className="font-bold text-[#E85D04]">
                  ₹{Number(retailer.wallet).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-2/3 py-2.5 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-[#E85D04]/20 disabled:opacity-50"
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit & Pay ₹{selectedService.fee}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-gray-900">
            <button
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-base text-gray-900 mb-1">Recharge Wallet</h3>
            <p className="text-xs text-gray-500 mb-4">
              Add balance to your Treta Enterprises portal wallet.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['200', '500', '1000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRechargeAmt(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      rechargeAmt === amt
                        ? 'bg-[#E85D04] text-white border-[#E85D04]'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    + ₹{amt}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Custom Amount (₹)
                </label>
                <input
                  type="number"
                  value={rechargeAmt}
                  onChange={(e) => setRechargeAmt(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E85D04]"
                />
              </div>

              <button
                type="button"
                onClick={handleRechargeWallet}
                className="w-full py-3 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#E85D04]/20 transition-all"
              >
                Add ₹{rechargeAmt} to Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
