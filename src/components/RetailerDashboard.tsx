import React, { useState, useEffect } from 'react'
import type { Retailer, Order, ServiceItem } from '../types'
import { SERVICES_LIST } from '../servicesData'
import { supabase } from '../supabaseClient'
import { PaymentQRModal } from './PaymentQRModal'
import {
  LayoutDashboard,
  Layers,
  ClipboardList,
  Printer,
  Wallet as WalletIcon,
  User as UserIcon,
  AlertTriangle,
  LogOut,
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
  AlertCircle,
  QrCode,
  ShieldCheck
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

  // QR Payment Modal State
  const [showQRModal, setShowQRModal] = useState(false)
  const [pendingOrderData, setPendingOrderData] = useState<{
    orderId: string
    service: ServiceItem
    name: string
    mobile: string
    refNo: string
    notes: string
  } | null>(null)

  // Wallet add modal
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [rechargeAmt, setRechargeAmt] = useState('500')
  const [showWalletQR, setShowWalletQR] = useState(false)

  // Receipt Modal State
  const [viewReceiptOrder, setViewReceiptOrder] = useState<Order | null>(null)

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

  // 1. Process payment via QR code
  const handleInitiateQRPayment = () => {
    if (!selectedService) return
    if (!applicantName.trim() || !applicantMobile.trim()) {
      setOrderMsg({ type: 'error', text: 'Please fill in applicant name and mobile.' })
      return
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`
    setPendingOrderData({
      orderId,
      service: selectedService,
      name: applicantName.trim(),
      mobile: applicantMobile.trim(),
      refNo: referenceNo.trim() || `REF-${Date.now().toString().slice(-6)}`,
      notes: orderNotes.trim()
    })
    setShowQRModal(true)
  }

  // Handle successful QR payment confirmation
  const handleQRPaymentSuccess = async (utrNumber: string) => {
    if (!pendingOrderData) return

    setSubmittingOrder(true)
    try {
      const newOrder: Order = {
        id: pendingOrderData.orderId,
        user_id: retailer.id,
        retailer_name: retailer.name,
        service_name: pendingOrderData.service.label,
        applicant_name: pendingOrderData.name,
        mobile: pendingOrderData.mobile,
        reference_no: pendingOrderData.refNo,
        fee: pendingOrderData.service.fee,
        status: 'completed',
        notes: `Paid via PhonePe UPI QR (UTR: ${utrNumber}). ${pendingOrderData.notes}`,
        created_at: new Date().toISOString()
      }

      await supabase.from('orders').insert(newOrder)
      setOrders((prev) => [newOrder, ...prev])

      setShowQRModal(false)
      setSelectedService(null)
      setPendingOrderData(null)
      setActiveMenu('orders')
      setViewReceiptOrder(newOrder)
    } catch (err: unknown) {
      console.error(err)
    } finally {
      setSubmittingOrder(false)
    }
  }

  // 2. Process payment via Wallet (ALLOWS NEGATIVE CREDIT BALANCE!)
  const handleSubmitOrderWallet = async (e: React.FormEvent) => {
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

      // Balance can go NEGATIVE (Overdraft credit allowed!)
      const currentWallet = Number(retailer.wallet || 0)
      const newBalance = currentWallet - selectedService.fee

      const updated = { ...retailer, wallet: newBalance }
      await supabase.from('retailers').update({ wallet: newBalance }).eq('id', retailer.id)
      onUpdateRetailer(updated)

      setOrders((prev) => [newOrder, ...prev])
      setOrderMsg({
        type: 'success',
        text: `Application submitted! ₹${selectedService.fee} debited. Balance: ₹${newBalance.toFixed(0)}`
      })

      setTimeout(() => {
        setSelectedService(null)
        setActiveMenu('orders')
      }, 1000)
    } catch (err: unknown) {
      if (err instanceof Error) setOrderMsg({ type: 'error', text: err.message })
      else setOrderMsg({ type: 'error', text: 'Failed to submit application.' })
    } finally {
      setSubmittingOrder(false)
    }
  }

  // Wallet recharge (turns negative balance positive!)
  const handleRechargeWallet = async () => {
    const add = parseFloat(rechargeAmt)
    if (isNaN(add) || add <= 0) return

    const currentWallet = Number(retailer.wallet || 0)
    const newBal = currentWallet + add
    const updated = { ...retailer, wallet: newBal }
    await supabase.from('retailers').update({ wallet: newBal }).eq('id', retailer.id)
    onUpdateRetailer(updated)
    setShowWalletModal(false)
    setShowWalletQR(false)
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

  // Icons mapper matching screenshot
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
      case 'voter-pdf-original':
        return <FileText className="h-6 w-6 text-white" />
      default:
        return <FileText className="h-6 w-6 text-white" />
    }
  }

  const identityServices = SERVICES_LIST.filter((s) => s.category === 'IDENTITY SERVICES')
  const transportServices = SERVICES_LIST.filter((s) => s.category === 'TRANSPORT SERVICES')
  const educationServices = SERVICES_LIST.filter((s) => s.category === 'EDUCATION SERVICES')

  const walletVal = Number(retailer.wallet || 0)
  const isNegative = walletVal < 0

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex font-sans antialiased">
      {/* A. LEFT SIDEBAR (Width: ~228px, Background: #101010, Text: #FFFFFF, Accent: #FF6500) */}
      <aside className="w-[228px] bg-[#101010] text-[#FFFFFF] flex flex-col justify-between shrink-0 border-r border-[#222222] select-none min-h-screen">
        <div>
          {/* Treta Logo Top Center */}
          <div className="py-6 px-4 flex flex-col items-center justify-center border-b border-[#222222]">
            <img
              src="./treta-hero-logo.png"
              alt="Treta Enterprises"
              className="h-14 w-14 object-contain mb-1"
            />
            <span className="text-[11px] font-extrabold text-[#FF6500] tracking-widest uppercase">
              TRETA ENTERPRISES
            </span>
          </div>

          {/* Wallet under Logo: Orange border */}
          <div
            onClick={() => setShowWalletModal(true)}
            className={`mx-3 mt-4 mb-2 p-3 rounded-2xl cursor-pointer transition-all border ${
              isNegative
                ? 'bg-red-950/40 border-red-500/40'
                : 'bg-[#1c140e] border-[#FF6500] hover:bg-[#251810]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div
                className={`flex items-center gap-2 text-xs font-semibold ${
                  isNegative ? 'text-red-400' : 'text-[#FF6500]'
                }`}
              >
                <Coins size={16} />
                <span>Wallet</span>
              </div>
              <span
                className={`text-sm font-extrabold font-mono ${
                  isNegative ? 'text-red-400' : 'text-[#FF6500]'
                }`}
              >
                {isNegative ? `-₹${Math.abs(walletVal).toFixed(0)}` : `₹${walletVal.toFixed(0)}`}
              </span>
            </div>
            {/* Free Service under Wallet: Dark gray */}
            <div className="flex items-center justify-between text-[10px] text-[#888888]">
              <span className="flex items-center gap-1">
                <Sparkles size={11} className="text-[#FF6500]" />
                <span>1 Free service available</span>
              </span>
              {isNegative && (
                <span className="text-[9px] bg-red-500/20 text-red-300 px-1 py-0.2 rounded font-bold">
                  Credit
                </span>
              )}
            </div>
          </div>

          {/* Navigation Items (Orange icons) */}
          <nav className="px-2 space-y-1 text-xs font-medium mt-3">
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeMenu === 'dashboard'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard size={17} className="text-[#FF6500]" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveMenu('services')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeMenu === 'services'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers size={17} className="text-[#FF6500]" />
              <span>Services</span>
            </button>

            <button
              onClick={() => setActiveMenu('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeMenu === 'orders'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <ClipboardList size={17} className="text-[#FF6500]" />
              <span>My Orders</span>
              {orders.length > 0 && (
                <span className="ml-auto bg-[#FF6500] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu('prints')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeMenu === 'prints'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Printer size={17} className="text-[#FF6500]" />
              <span>Print Manage</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('wallet')
                setShowWalletModal(true)
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeMenu === 'wallet'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <WalletIcon size={17} className="text-[#FF6500]" />
              <span>Wallet</span>
            </button>

            <button
              onClick={() => setActiveMenu('account')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeMenu === 'account'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserIcon size={17} className="text-[#FF6500]" />
              <span>My Account</span>
            </button>

            <button
              onClick={() => setActiveMenu('complaints')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeMenu === 'complaints'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <AlertTriangle size={17} className="text-[#FF6500]" />
              <span>Complaint</span>
            </button>
          </nav>

          {/* Quick Services Section with Colored Bullets */}
          <div className="px-4 mt-6 pt-4 border-t border-[#222222]">
            <span className="text-[10px] uppercase font-bold text-[#777777] tracking-wider block mb-2">
              Quick Services
            </span>
            <div className="space-y-1.5 text-[11px] text-[#aaaaaa]">
              <div
                onClick={() => handleOpenApply(SERVICES_LIST[2])}
                className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>New PAN Card</span>
              </div>
              <div
                onClick={() => handleOpenApply(SERVICES_LIST[5])}
                className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>DL PDF Download</span>
              </div>
              <div
                onClick={() => handleOpenApply(SERVICES_LIST[8])}
                className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>TEC Certificate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout (Red Color) */}
        <div className="p-3 border-t border-[#222222]">
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
        {/* B. Top Header: Height ~52px, Background: White, Title: Orange #F05B00, Right wallet & profile */}
        <header className="h-[52px] bg-white border-b border-gray-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40 select-none">
          <div className="font-extrabold text-[#F05B00] text-base sm:text-lg tracking-tight">
            Treta Enterprises
          </div>

          <div className="flex items-center gap-3">
            {/* Wallet Balance: Light orange background, rounded pill */}
            <div
              onClick={() => setShowWalletModal(true)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-all border ${
                isNegative
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-[#fff7ed] border-[#fed7aa] text-[#F05B00] hover:bg-[#ffedd5]'
              }`}
            >
              <Coins size={14} />
              <span className="text-xs font-bold font-mono">
                {isNegative ? `-₹${Math.abs(walletVal).toFixed(0)}` : `₹${walletVal.toFixed(0)}`}
              </span>
            </div>

            {/* Profile Avatar & Name */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-black block leading-tight">
                  {retailer.name}
                </span>
                <span className="text-[10px] text-gray-400 capitalize block leading-tight">
                  {retailer.user_type || 'retailer'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F05B00] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {retailer.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* C. Main Dashboard */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {activeMenu === 'dashboard' || activeMenu === 'services' ? (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Welcome Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-black tracking-tight">
                    Welcome, {retailer.name}
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">Your Treta Enterprises portal</p>
                </div>

                {/* Right side balance button: Light orange, rounded rectangle */}
                <div
                  onClick={() => setShowWalletModal(true)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border cursor-pointer shadow-sm hover:shadow transition-all ${
                    isNegative
                      ? 'bg-red-50 border-red-300 text-red-600'
                      : 'bg-[#fff7ed] border-[#fed7aa] text-[#F05B00]'
                  }`}
                >
                  <Coins size={18} />
                  <span className="text-lg font-extrabold font-mono">
                    {isNegative ? `- ₹ ${Math.abs(walletVal).toFixed(0)}` : `₹ ${walletVal.toFixed(0)}`}
                  </span>
                  <span className="ml-2 text-[10px] bg-white border border-[#fed7aa] px-2 py-0.5 rounded-full font-bold shadow-xs">
                    + Add
                  </span>
                </div>
              </div>

              {/* Statistics Cards (Each approx 345 × 70px, white bg, light gray border, 12px rounded) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 10 Services */}
                <div
                  onClick={() => setActiveMenu('services')}
                  className="h-[70px] bg-white border border-[#DDDDDD] rounded-[12px] p-3 flex items-center gap-3.5 shadow-sm cursor-pointer hover:border-gray-400 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Layers size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-black leading-tight">10</div>
                    <div className="text-xs text-gray-500 font-medium">Services</div>
                  </div>
                </div>

                {/* 0 Prints */}
                <div
                  onClick={() => setActiveMenu('prints')}
                  className="h-[70px] bg-white border border-[#DDDDDD] rounded-[12px] p-3 flex items-center gap-3.5 shadow-sm cursor-pointer hover:border-gray-400 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F05B00] flex items-center justify-center shrink-0">
                    <Printer size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-black leading-tight">
                      {orders.filter((o) => o.status === 'completed').length}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Prints</div>
                  </div>
                </div>

                {/* 0 Complaints */}
                <div
                  onClick={() => setActiveMenu('complaints')}
                  className="h-[70px] bg-white border border-[#DDDDDD] rounded-[12px] p-3 flex items-center gap-3.5 shadow-sm cursor-pointer hover:border-gray-400 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-black leading-tight">
                      {complaintsCount}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Complaints</div>
                  </div>
                </div>
              </div>

              {/* D. Service Cards in Exact Order */}

              {/* 1. Identity Services · Purple */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    IDENTITY SERVICES
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3.5">
                  {identityServices.map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => handleOpenApply(svc)}
                      className="w-[167px] h-[131px] bg-white border border-[#DDDDDD] hover:border-[#F05B00] rounded-[12px] p-3 flex flex-col items-center text-center justify-between cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md select-none group"
                    >
                      {/* Icon: 48 × 48px */}
                      <div
                        className="w-[48px] h-[48px] rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0"
                        style={{ backgroundColor: svc.color }}
                      >
                        {getServiceIcon(svc.id)}
                      </div>

                      {/* Service Name: 13px bold */}
                      <span className="text-[13px] font-bold text-gray-900 group-hover:text-[#F05B00] transition-colors leading-tight line-clamp-2">
                        {svc.label}
                      </span>

                      {/* Price: 11px orange #FF6500 */}
                      <span className="text-[11px] font-bold text-[#FF6500]">₹{svc.fee}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Transport Services · Orange */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                  <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    TRANSPORT SERVICES
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3.5">
                  {transportServices.map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => handleOpenApply(svc)}
                      className="w-[167px] h-[131px] bg-white border border-[#DDDDDD] hover:border-[#F05B00] rounded-[12px] p-3 flex flex-col items-center text-center justify-between cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md select-none group"
                    >
                      <div
                        className="w-[48px] h-[48px] rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0"
                        style={{ backgroundColor: svc.color }}
                      >
                        {getServiceIcon(svc.id)}
                      </div>

                      <span className="text-[13px] font-bold text-gray-900 group-hover:text-[#F05B00] transition-colors leading-tight line-clamp-2">
                        {svc.label}
                      </span>

                      <span className="text-[11px] font-bold text-[#FF6500]">₹{svc.fee}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Education Services · Blue */}
              <div className="pt-4 pb-12">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    EDUCATION SERVICES
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3.5">
                  {educationServices.map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => handleOpenApply(svc)}
                      className="w-[167px] h-[131px] bg-white border border-[#DDDDDD] hover:border-[#F05B00] rounded-[12px] p-3 flex flex-col items-center text-center justify-between cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md select-none group"
                    >
                      <div
                        className="w-[48px] h-[48px] rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0"
                        style={{ backgroundColor: svc.color }}
                      >
                        {getServiceIcon(svc.id)}
                      </div>

                      <span className="text-[13px] font-bold text-gray-900 group-hover:text-[#F05B00] transition-colors leading-tight line-clamp-2">
                        {svc.label}
                      </span>

                      <span className="text-[11px] font-bold text-[#FF6500]">₹{svc.fee}</span>
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
                  className="text-xs font-semibold text-[#F05B00] hover:underline"
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
                    className="mt-3 text-xs font-bold text-[#F05B00] hover:underline"
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
                        <th className="p-3.5">Receipt</th>
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
                            <td className="p-3.5 font-bold text-[#F05B00]">₹{ord.fee}</td>
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
                            <td className="p-3.5">
                              <button
                                onClick={() => setViewReceiptOrder(ord)}
                                className="flex items-center gap-1 text-[11px] font-bold text-[#F05B00] hover:underline"
                              >
                                <FileText size={13} />
                                <span>Slip</span>
                              </button>
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
                All approved PAN slips, DL smart cards, and TEC certificates can be printed directly
                with official QR stamp.
              </p>
              {orders.length > 0 && (
                <div className="mt-6">
                  <span className="text-xs font-semibold text-gray-700 block mb-3">
                    Recent Available Slips:
                  </span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {orders.slice(0, 3).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setViewReceiptOrder(o)}
                        className="px-3 py-1.5 bg-[#fff7ed] border border-[#fed7aa] text-[#F05B00] rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <FileText size={14} />
                        <span>
                          {o.service_name} ({o.applicant_name})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#F05B00]"
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
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#F05B00]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#F05B00] hover:bg-[#d95c00] text-white font-bold text-xs rounded-xl shadow-md transition-all"
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
                  <span
                    className={`font-bold font-mono text-sm ${
                      isNegative ? 'text-red-600' : 'text-[#F05B00]'
                    }`}
                  >
                    {isNegative ? `-₹${Math.abs(walletVal).toFixed(2)} (Due Credit)` : `₹${walletVal.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Portal Member Since:</span>
                  <span className="text-gray-600">
                    {new Date(retailer.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating WhatsApp Help Button: Bottom Right, #16CE65 green pill */}
      <a
        href="https://wa.me/917042702156"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#16CE65] hover:bg-[#13b558] text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-xl hover:shadow-2xl transition-all select-none"
      >
        <MessageCircle size={17} />
        <span>Help</span>
      </a>

      {/* Application Form Modal with UPI QR & Wallet Options */}
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
                <span className="text-xs text-[#F05B00] font-bold">
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

            <form onSubmit={handleSubmitOrderWallet} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Applicant Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F05B00]"
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
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F05B00]"
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
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F05B00]"
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
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#F05B00]"
                />
              </div>

              {/* Wallet info */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  isNegative
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-[#fff7ed] border-[#fed7aa] text-gray-700'
                }`}
              >
                <div>
                  <span className="font-semibold block">Wallet Balance:</span>
                  <span className="text-[10px] text-gray-500">
                    {isNegative
                      ? 'Credit limit active. You can still order!'
                      : 'Orders will deduct from here.'}
                  </span>
                </div>
                <span
                  className={`font-mono font-bold text-sm ${
                    isNegative ? 'text-red-600' : 'text-[#F05B00]'
                  }`}
                >
                  {isNegative ? `-₹${Math.abs(walletVal).toFixed(0)}` : `₹${walletVal.toFixed(0)}`}
                </span>
              </div>

              {/* Payment Buttons: QR Pay & Wallet Pay */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleInitiateQRPayment}
                  className="w-full py-3 bg-[#F05B00] hover:bg-[#d95c00] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#F05B00]/25 transition-all active:scale-98"
                >
                  <QrCode size={16} />
                  <span>Pay Now via PhonePe QR Code (₹{selectedService.fee})</span>
                </button>

                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <Coins size={14} className="text-[#F05B00]" />
                      <span>Pay via Wallet Balance (Allow Negative Credit)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Payment QR Code Modal (Uses User's PhonePe QR) */}
      {pendingOrderData && (
        <PaymentQRModal
          isOpen={showQRModal}
          amount={pendingOrderData.service.fee}
          serviceTitle={pendingOrderData.service.label}
          orderId={pendingOrderData.orderId}
          applicantName={pendingOrderData.name}
          onClose={() => setShowQRModal(false)}
          onSuccess={handleQRPaymentSuccess}
        />
      )}

      {/* Add Money Modal (Uses PhonePe QR) */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-gray-900 border border-gray-100">
            <button
              onClick={() => {
                setShowWalletModal(false)
                setShowWalletQR(false)
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-base text-gray-900 mb-1">Recharge Wallet</h3>
            <p className="text-xs text-gray-500 mb-4">
              Add balance to clear negative credit or add funds.
            </p>

            {showWalletQR ? (
              <div className="text-center py-2">
                <div className="bg-white p-2 rounded-xl border border-gray-200 inline-block shadow-md mb-3">
                  <img
                    src="./payment-qr.jpg"
                    alt="Official PhonePe QR"
                    className="w-44 h-44 object-contain mx-auto"
                  />
                </div>
                <div className="text-xs text-gray-700 font-semibold mb-3">
                  Scan & Pay ₹{rechargeAmt} to PhonePe QR
                </div>
                <button
                  type="button"
                  onClick={handleRechargeWallet}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  I Have Paid — Credit ₹{rechargeAmt} to Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {['200', '500', '1000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmt(amt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        rechargeAmt === amt
                          ? 'bg-[#F05B00] text-white border-[#F05B00]'
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
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F05B00]"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowWalletQR(true)}
                    className="w-full py-2.5 bg-[#F05B00] hover:bg-[#d95c00] text-white font-bold text-xs rounded-xl shadow-md shadow-[#F05B00]/20 flex items-center justify-center gap-1.5"
                  >
                    <QrCode size={15} />
                    <span>Pay via PhonePe QR (₹{rechargeAmt})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRechargeWallet}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl"
                  >
                    Instant Credit Balance
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Government / Treta Slip Receipt Modal */}
      {viewReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl text-gray-900 border border-gray-200">
            <button
              onClick={() => setViewReceiptOrder(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            {/* Official Slip Header */}
            <div className="border-b-2 border-dashed border-gray-200 pb-4 mb-4 text-center">
              <img
                src="./treta-hero-logo.png"
                alt="Treta Enterprises"
                className="h-10 mx-auto object-contain mb-1"
              />
              <h3 className="font-extrabold text-sm uppercase text-gray-900 tracking-wider">
                TRETA ENTERPRISES
              </h3>
              <p className="text-[10px] text-gray-500 font-semibold uppercase">
                Customer Application Acknowledgement Slip
              </p>
            </div>

            {/* Slip Details Table */}
            <div className="space-y-2 text-xs mb-5 bg-gray-50 p-4 rounded-2xl border border-gray-100 font-sans">
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-mono font-bold text-gray-900">{viewReceiptOrder.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Service:</span>
                <span className="font-bold text-gray-900">{viewReceiptOrder.service_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Applicant:</span>
                <span className="font-semibold text-gray-900">{viewReceiptOrder.applicant_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Mobile:</span>
                <span className="font-mono text-gray-900">{viewReceiptOrder.mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Ref / Aadhar No:</span>
                <span className="font-mono font-bold text-[#F05B00]">
                  {viewReceiptOrder.reference_no}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Fee Amount:</span>
                <span className="font-extrabold text-green-600">₹{viewReceiptOrder.fee}.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Payment Status:</span>
                <span className="font-extrabold uppercase text-green-600 flex items-center gap-1">
                  <ShieldCheck size={14} /> Verified / Paid
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Issued On:</span>
                <span className="text-gray-700">
                  {new Date(viewReceiptOrder.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Print Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#F05B00] hover:bg-[#d95c00] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer size={15} />
                <span>Print Official Slip</span>
              </button>

              <button
                type="button"
                onClick={() => setViewReceiptOrder(null)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
