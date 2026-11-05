import type { ServiceItem } from './types'

export const SERVICES_LIST: ServiceItem[] = [
  // 1. Identity Services (Purple)
  {
    id: 'pan-no-dob',
    label: 'Without Birth Proof PAN',
    category: 'IDENTITY SERVICES',
    fee: 150,
    color: '#DC2626',
    description: 'PAN card application without requiring standard birth proof documents.',
    requirements: ['Aadhar Card', 'Passport Photo', 'Signature']
  },
  {
    id: 'pan-finder',
    label: 'PAN Finder',
    category: 'IDENTITY SERVICES',
    fee: 100,
    color: '#2563EB',
    description: 'Find lost PAN Card number instantly through 12-digit Aadhar number.',
    requirements: ['12-Digit Aadhar Number', 'Registered Mobile']
  },
  {
    id: 'pan-new',
    label: 'PAN Card New',
    category: 'IDENTITY SERVICES',
    fee: 130,
    color: '#7C3AED',
    description: 'New NSDL / UTI PAN card application with physical card delivery.',
    requirements: ['Aadhar Card', 'Photo', 'Signature', 'Mobile Number']
  },
  {
    id: 'pan-corr',
    label: 'PAN Card Correction',
    category: 'IDENTITY SERVICES',
    fee: 130,
    color: '#9333EA',
    description: 'Correction in PAN details: Name, DOB, Father Name or Photo/Sign update.',
    requirements: ['Existing PAN Number', 'Aadhar Card Proof', 'Correction Details']
  },
  {
    id: 'voter-mobile-otp',
    label: 'Voter Mobile Number Link OTP',
    category: 'IDENTITY SERVICES',
    fee: 50,
    color: '#EA580C',
    description: 'Link your mobile number to Voter ID card via online OTP authentication.',
    requirements: ['Voter EPIC Number', 'Active Mobile Number for OTP']
  },

  // 2. Transport Services (Orange)
  {
    id: 'dl-download',
    label: 'DL PDF Download',
    category: 'TRANSPORT SERVICES',
    fee: 100,
    color: '#DC2626',
    description: 'Download official Parivahan Driving License Smart Card PDF copy.',
    requirements: ['Driving License Number', 'Date of Birth']
  },
  {
    id: 'rc-download',
    label: 'RC PDF Download',
    category: 'TRANSPORT SERVICES',
    fee: 100,
    color: '#EA580C',
    description: 'Official Vehicle RC Smart Card Certificate PDF download.',
    requirements: ['Vehicle Registration Number', 'Chassis / Engine Number']
  },
  {
    id: 'll-exam',
    label: 'Learning License Exam',
    category: 'TRANSPORT SERVICES',
    fee: 150,
    color: '#7C3AED',
    description: 'Learning License online exam slot booking and test portal assistance.',
    requirements: ['Application Number', 'Date of Birth', 'Aadhar Card']
  },

  // 3. Education Services (Blue)
  {
    id: 'tec-cert',
    label: 'TEC Exam Certificate',
    category: 'EDUCATION SERVICES',
    fee: 800,
    color: '#2563EB',
    description: 'Telecentre Entrepreneur Course (TEC) exam clearance & certificate for CSC ID.',
    requirements: ['Aadhar Card', 'Mobile Number', 'Email ID']
  },
  {
    id: 'voter-pdf-original',
    label: 'Instant voter Pdf Original',
    category: 'EDUCATION SERVICES',
    fee: 50,
    color: '#16A34A',
    description: 'Download color original Voter ID Card PDF from NVSP database.',
    requirements: ['Voter EPIC Number / Reference Number', 'State']
  }
]
