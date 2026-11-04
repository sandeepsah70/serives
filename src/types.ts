export interface Retailer {
  id: string
  name: string
  mobile: string
  email: string
  wallet: number
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  retailer_name: string
  service_name: string
  applicant_name: string
  mobile: string
  reference_no: string
  fee: number
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  notes?: string
  created_at: string
}

export interface Complaint {
  id: string
  user_id: string
  retailer_name: string
  subject: string
  message: string
  status: 'open' | 'resolved'
  created_at: string
}

export interface ServiceItem {
  id: string
  label: string
  category: string
  fee: number
  color: string
  description: string
  requirements: string[]
}
