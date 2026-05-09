# Project Architecture: SimplyDSE

## Core Principle
**This project is a React frontend experience layer for an existing WordPress-powered SaaS platform.**

## Master Directive
**WordPress remains the backend, CMS, authentication, and data layer.**

## Architecture Overview
- **Frontend**: React (Vite, TypeScript, Tailwind CSS, Framer Motion).
- **Backend/Source of Truth**: WordPress (Existing installation on Hostinger).
- **Integration Layer**: WordPress REST API.

## Strategic Intent
The React layer is designed to provide a premium, high-performance "Experience Layer" (UI/UX) while leveraging the robust backend, user management, and content capabilities of the existing WordPress SaaS infrastructure.

## Key Directives for All Agents
1. **Maintain Headless Separation**: Do not implement backend logic (database, auth, etc.) within the React app unless it is a "fetch" or "push" to the WordPress API.
2. **UI Fidelity**: Maintain the "Senior Motion Designer" standards for premium, cinematic motion and aesthetics.
3. **API First**: When adding dynamic content (blog posts, user data), prioritize fetching from the WordPress REST API endpoints.
4. **Subdomain Deployment**: The React build (`dist` folder) is intended for deployment on a subdomain (e.g., `app.simplydse.com`) to run alongside the primary WordPress site.

---
*Created by Antigravity (Senior Motion Designer & Architect)*
