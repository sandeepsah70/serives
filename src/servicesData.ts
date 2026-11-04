import type { ServiceItem } from './types'

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'pan-new',
    label: 'PAN Card New',
    category: 'PAN Services',
    fee: 107,
    color: '#7C3AED',
    description: 'Instant New NSDL/UTI PAN card registration with physical slip and delivery.',
    requirements: ['Aadhar Card', 'Applicant Photo', 'Signature', 'Mobile Number']
  },
  {
    id: 'pan-corr',
    label: 'PAN Correction',
    category: 'PAN Services',
    fee: 107,
    color: '#9333EA',
    description: 'Correction in PAN Card details (Name, DOB, Father Name or Photo/Sign update).',
    requirements: ['Existing PAN Copy', 'Aadhar Card Proof', 'Correction Details']
  },
  {
    id: 'pan-finder',
    label: 'PAN Finder',
    category: 'PAN Services',
    fee: 50,
    color: '#2563EB',
    description: 'Find lost PAN Card number instantly via Aadhar number.',
    requirements: ['12-digit Aadhar Number', 'Registered Mobile']
  },
  {
    id: 'pan-no-dob',
    label: 'Without Birth Proof PAN',
    category: 'PAN Services',
    fee: 120,
    color: '#DC2626',
    description: 'Special PAN application process for applicants without birth proof document.',
    requirements: ['Alternative Identity Proof', 'Gazetted Officer Affidavit', 'Photo']
  },
  {
    id: 'dl-rc',
    label: 'DL / RC Download',
    category: 'Transport Services',
    fee: 50,
    color: '#EA580C',
    description: 'Instant official Parivahan Driving License and Vehicle RC PDF download.',
    requirements: ['DL Number / Vehicle Registration Number', 'State / RTO Code']
  },
  {
    id: 'll-exam',
    label: 'Learning License Exam',
    category: 'Transport Services',
    fee: 350,
    color: '#7C3AED',
    description: 'Online Learning License exam slot booking and test assistance.',
    requirements: ['Application Number', 'Aadhar Number', 'Applicant Date of Birth']
  },
  {
    id: 'tec-cert',
    label: 'TEC Certificate',
    category: 'CSC Services',
    fee: 1479,
    color: '#059669',
    description: 'Telecentre Entrepreneur Course (TEC) Certificate for CSC VLE ID application.',
    requirements: ['Aadhar Card', 'Email ID', 'Mobile Number', 'Educational Details']
  },
  {
    id: 'utility-bill',
    label: 'Electricity / Utility Bill',
    category: 'Bill Payments',
    fee: 20,
    color: '#0284C7',
    description: 'All India State Electricity, Gas, Water bill instant payment with receipt.',
    requirements: ['Consumer / Account Number', 'Sub-division / Board', 'Mobile Number']
  },
  {
    id: 'voter-id',
    label: 'Voter ID Verification',
    category: 'Identity Services',
    fee: 40,
    color: '#16A34A',
    description: 'National Voter Service Portal EPIC download and identity verification.',
    requirements: ['EPIC / Voter Card Number', 'State / Assembly Constituency']
  },
  {
    id: 'ration-search',
    label: 'Ration Card Search',
    category: 'Identity Services',
    fee: 30,
    color: '#D97706',
    description: 'Instant online Ration Card member list and slip download.',
    requirements: ['Ration Card Number / Head of Family Aadhar']
  },
  {
    id: 'passport-assist',
    label: 'Passport Application',
    category: 'Government Services',
    fee: 200,
    color: '#6366F1',
    description: 'Passport Seva Kendra online form fill-up and appointment scheduling.',
    requirements: ['Aadhar Card', '10th Marksheet / Birth Proof', 'Address Proof']
  }
]
