# SimplyDSE - Enterprise Multi-Tenant Compliance Platform

SimplyDSE is a professional, multi-tenant "Enterprise OS" for workplace compliance and employee health (DSE assessments). Built with Next.js 15, Supabase, and Tailwind CSS.

## 🚀 Key Features
- **Multi-Tenant Architecture**: Secure subdomain-based isolation for every organisation.
- **Enterprise Authentication**: Secure, tenant-aware login flow with SAML SSO readiness.
- **RBAC (Role Based Access Control)**: Granular permissions for Super Admins, Workspace Managers, and Staff.
- **British English Professional UI**: Localised for UK workplace compliance standards.
- **Scalable Infrastructure**: Optimised for production deployment using Next.js standalone mode.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database & Auth**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📦 Local Development

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd SimplyDSE
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🌐 Production Deployment (Hostinger)

This project is pre-configured for Hostinger's Node.js infrastructure.

1. **Standalone Build**:
   ```bash
   npm run build
   ```
2. **Deployment**:
   Follow the detailed instructions in [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md).

## 📄 Licence
Copyright © 2026 SimplyDSE. All rights reserved.
