# RT Groups - Real Estate Business Website PRD

## Original Problem Statement
Premium real estate business website for RT Groups with services: Property Buying & Selling, Construction, Manpower Supply.

## Company Info
- **Name**: RT Groups
- **Tagline**: Your Space, Our Promise
- **Email**: contact@rtgroups.info
- **Phone/WhatsApp**: 8105854999
- **Location**: NO.22 5th Cross Road, Vaikuntam Layout, Lakshmi Narayanapura, ACES Layout, Bangalore 560037
- **Status**: Newly Started

## Tech Stack
- Backend: FastAPI + MongoDB + JWT Auth + Twilio + OpenAI GPT-5.2 (Emergent LLM key) + Emergent Object Storage
- Frontend: React + Tailwind + Framer Motion + Chart.js + Shadcn/UI
- Design: Dark navy + Gold (toggleable to light mode)

## What's Been Implemented

### Iteration 1 (Feb 2026)
- All public pages: Home, Services, Properties (search/filters/favorites), About, Contact, Login
- Admin Dashboard with analytics, bookings, inquiries, user management
- AI Chat widget (bottom-left, GPT-5.2)
- Floating WhatsApp button (8105854999)
- JWT auth (register/login), Twilio SMS OTP endpoints (placeholder creds)
- 33/33 backend tests passing

### Iteration 2 (Feb 2026)
- **Admin Image Upload** via Emergent Object Storage (/api/upload/image, /api/files/{path})
- **Property Manager** in Dashboard (add properties with image gallery upload)
- **Property Detail Page** (/properties/:id) with image gallery, thumbnails, full info, CTAs (WhatsApp/Call/Book Visit)
- **Dark/Light Theme Toggle** with CSS variables, persisted to localStorage
- 42/42 backend tests passing

## Admin Credentials
- Email: admin@rtgroups.info
- Password: RTGroups@2026

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Premium UI with RT Groups brand identity
- [x] Authentication system
- [x] Properties CRUD with filters & search
- [x] AI Chatbot integration
- [x] WhatsApp integration
- [x] Booking system
- [x] Admin dashboard with analytics
- [x] Image upload for properties
- [x] Property detail page with gallery
- [x] Dark/light mode toggle

### P1 (Important)
- [ ] Real Twilio credentials for SMS OTP (user to provide)
- [ ] Email notifications for bookings/inquiries (via Resend/SendGrid)
- [ ] Forgot password flow
- [ ] Property delete/edit from dashboard

### P2 (Nice to have)
- [ ] SEO meta tags per page
- [ ] Sitemap & robots.txt
- [ ] Testimonials admin panel
- [ ] Blog section for SEO
- [ ] Lazy loading images
- [ ] Property comparison feature
- [ ] Virtual tour integration
- [ ] Launch promotional banner with countdown

## Next Tasks
1. Get real Twilio credentials to enable SMS OTP
2. Add email notifications for new bookings/inquiries
3. Add property edit/delete from admin dashboard
4. Launch promo banner
