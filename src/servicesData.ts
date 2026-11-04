import type { ServiceItem } from './types'

export const SERVICES_LIST: ServiceItem[] = [
  // IDENTITY SERVICES
  {
    id: 'pan-no-dob',
    label: 'Without Birth Proof PAN',
    category: 'IDENTITY SERVICES',
    fee: 150,
    color: '#E11D48',
    description: 'Special PAN application process for applicants without birth proof document.',
    requirements: ['Alternative Identity Proof', 'Gazetted Officer Affidavit', 'Photo']
  },
  {
    id: 'pan-finder',
    label: 'PAN Finder',
    category: 'IDENTITY SERVICES',
    fee: 100,
    color: '#2563EB',
    description: 'Find lost PAN Card number instantly via Aadhar number.',
    requirements: ['12-digit Aadhar Number', 'Registered Mobile']
  },
  {
    id: 'pan-new',
    label: 'PAN Card New',
    category: 'IDENTITY SERVICES',
    fee: 130,
    color: '#7C3AED',
    description: 'Instant New NSDL/UTI PAN card registration with physical slip and delivery.',
    requirements: ['Aadhar Card', 'Applicant Photo', 'Signature', 'Mobile Number']
  },
  {
    id: 'pan-corr',
    label: 'PAN Card Correction',
    category: 'IDENTITY SERVICES',
    fee: 130,
    color: '#9333EA',
    description: 'Correction in PAN Card details (Name, DOB, Father Name or Photo/Sign update).',
    requirements: ['Existing PAN Copy', 'Aadhar Card Proof', 'Correction Details']
  },
  {
    id: 'voter-mobile-otp',
    label: 'Voter Mobail Number Link OTP',
    category: 'IDENTITY SERVICES',
    fee: 50,
    color: '#EA580C',
    description: 'Instant Voter ID Mobile Number Linking via NVSP OTP service.',
    requirements: ['EPIC / Voter Card Number', 'New Mobile Number for OTP']
  },

  // TRANSPORT SERVICES
  {
    id: 'dl-download',
    label: 'DL PDF Download',
    category: 'TRANSPORT SERVICES',
    fee: 100,
    color: '#EA580C',
    description: 'Instant official Parivahan Driving License PDF download with QR verification.',
    requirements: ['DL Number', 'Date of Birth']
  },
  {
    id: 'rc-download',
    label: 'RC PDF Download',
    category: 'TRANSPORT SERVICES',
    fee: 100,
    color: '#D97706',
    description: 'Official Vehicle RC Smart Card PDF download.',
    requirements: ['Vehicle Registration Number', 'Chassis / Engine Number']
  },
  {
    id: 'll-exam',
    label: 'Learning License Exam',
    category: 'TRANSPORT SERVICES',
    fee: 150,
    color: '#7C3AED',
    description: 'Online Learning License exam slot booking and test assistance.',
    requirements: ['Application Number', 'Aadhar Number', 'Date of Birth']
  },

  // EDUCATION SERVICES
  {
    id: 'tec-cert',
    label: 'TEC Certificate',
    category: 'EDUCATION SERVICES',
    fee: 1479,
    color: '#2563EB',
    description: 'Telecentre Entrepreneur Course (TEC) Certificate for CSC VLE ID registration.',
    requirements: ['Aadhar Card', 'Email ID', 'Mobile Number']
  }
]
