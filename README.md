# Services Platform

A modern web application built with **React 19**, **TypeScript**, **Vite**, and **Supabase** for Authentication & Database services.

## Features

- 🔐 **Supabase Authentication**:
  - User Sign Up with Full Name, Email, and Password
  - User Login with real-time session handling
  - User Profile overview & Sign Out
  - Error and success alerts with input validation
- ⚡ **Vite + React 19 + TypeScript**: Fast development and builds
- 🎨 **Modern Responsive UI**: Clean theme with light/dark support and Lucide icons

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/sandeepsah70/serives.git
cd serives
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
VITE_SUPABASE_URL=https://odgyrlkenxufbfdeqsvx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run development server
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```
