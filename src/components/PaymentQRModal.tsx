import React, { useState, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  Copy,
  Clock,
  ShieldCheck,
  Check,
  Smartphone,
  Loader2,
  ArrowRight
} from 'lucide-react'

interface PaymentQRModalProps {
  isOpen: boolean
  amount: number
  serviceTitle: string
  orderId: string
  applicantName: string
  onClose: () => void
  onSuccess: (utrNumber: string) => void
}

export const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
  isOpen,
  amount,
  serviceTitle,
  orderId,
  applicantName,
  onClose,
  onSuccess
}) => {
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [copied, setCopied] = useState(false)
  const [utr, setUtr] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const upiId = '7042702156@upi'

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(300)
      setIsVerifying(false)
      setIsSuccess(false)
      setUtr('')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  if (!isOpen) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmPayment = () => {
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess(utr || `UPI${Date.now().toString().slice(-8)}`)
      }, 1200)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl text-gray-900 border border-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          /* Payment Success View */
          <div className="py-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-green-50">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">Payment Verified!</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              ₹{amount} successfully received for {serviceTitle}
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs max-w-xs mx-auto space-y-1.5 text-left mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-mono font-bold text-gray-800">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Applicant:</span>
                <span className="font-medium text-gray-800">{applicantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-bold text-green-600 uppercase">Paid & Confirmed</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400">Opening your application receipt...</p>
          </div>
        ) : (
          /* QR Code Payment View */
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <img
                  src="./treta-hero-logo.png"
                  alt="Treta Enterprises"
                  className="h-8 w-8 object-contain"
                />
                <div>
                  <h3 className="font-bold text-sm text-gray-900 leading-none">
                    Treta UPI Payment Gateway
                  </h3>
                  <span className="text-[10px] text-gray-400 font-medium">Instant QR Settlement</span>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-mono font-bold border border-amber-200">
                <Clock size={13} />
                <span>{formattedTime}</span>
              </div>
            </div>

            {/* Service & Amount Pill */}
            <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-2xl p-3.5 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#F26700] font-semibold block uppercase tracking-wider">
                  {serviceTitle}
                </span>
                <span className="text-xs text-gray-700 font-medium">
                  Applicant: <strong>{applicantName}</strong>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block font-medium">Amount to Pay</span>
                <span className="text-2xl font-extrabold text-[#F26700]">₹{amount}</span>
              </div>
            </div>

            {/* User Uploaded PhonePe QR Code Display */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-gray-200/80 shadow-inner mb-4">
              <div className="relative p-2 bg-white rounded-xl shadow-md border border-gray-100">
                <img
                  src="./payment-qr.jpg"
                  alt="Official PhonePe UPI QR Code"
                  className="w-48 h-48 object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback to dynamic QR if needed
                    const target = e.target as HTMLImageElement
                    target.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=7042702156@upi&pn=Treta%20Enterprises&am=${amount}&cu=INR`
                  }}
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-2 font-medium">
                <Smartphone size={14} className="text-[#F26700]" />
                <span>Scan with PhonePe, Google Pay, Paytm or BHIM</span>
              </div>
            </div>

            {/* UPI ID with Copy Button */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-gray-400 block">UPI ID:</span>
                <span className="font-mono font-bold text-gray-800">{upiId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="flex items-center gap-1 bg-white hover:bg-gray-100 text-gray-700 font-bold px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] shadow-sm transition-all"
              >
                {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Optional UTR Input & Confirmation */}
            <div className="space-y-2 mb-4">
              <input
                type="text"
                placeholder="Enter 12-digit UPI Ref / UTR Number"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#F26700] font-mono"
              />
            </div>

            {/* Confirm Payment Button */}
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={isVerifying}
              className="w-full py-3 bg-[#F26700] hover:bg-[#d95c00] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#F26700]/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
            >
              {isVerifying ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying UPI Payment...</span>
                </>
              ) : (
                <>
                  <span>I Have Paid — Confirm Order</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 text-center mt-3">
              <ShieldCheck size={13} className="text-green-600" />
              <span>100% Secure 256-Bit Encrypted UPI Transaction</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
