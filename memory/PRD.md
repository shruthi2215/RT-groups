# RT Groups - Real Estate Business Website PRD

## Original Problem Statement
Create a premium, modern, and minimal real estate business website with smooth animations and a professional corporate feel for RT Groups.

**Business Overview**:
- Real estate buying & selling (as a mediator)
- Building construction (end-to-end from scratch)
- Manpower supply for construction projects

**Tagline**: Your Space, Our Promise

## Company Info
- **Name**: RT Groups
- **Email**: contact@rtgroups.info
- **Phone/WhatsApp**: 8105854999
- **Location**: NO.22 5th Cross Road, Vaikuntam Layout Lakshmi Narayanapura, ACES Layout, Bangalore 560037
- **Status**: Newly Started

## User Personas
1. **Property Buyers/Sellers**: Browse properties, save favorites, inquire
2. **Construction Clients**: Book consultations, request services
3. **Contractors**: Manpower supply inquiries
4. **Admin**: Manage users, bookings, inquiries, view analytics

## Tech Stack
- Backend: FastAPI + MongoDB + JWT Auth + Twilio + EmergentIntegrations (OpenAI GPT-5.2)
- Frontend: React + Tailwind + Framer Motion + Chart.js + Shadcn/UI
- Design: Dark navy + Gold accent (Playfair Display + Outfit fonts)

## What's Been Implemented (Feb 2026)

### Backend (100% tested - 33/33 pass)
- JWT-based auth (register/login)
- User management with role (admin/user)
- Twilio SMS OTP endpoints (requires real credentials)
- Properties CRUD with filters (type/location/price range)
- Favorites (toggle/list) per user
- Bookings (create/list/update status) - role-based access
- Inquiries (public create, admin list)
- AI Chat (OpenAI GPT-5.2 via EMERGENT_LLM_KEY)
- Analytics stats + traffic data (admin only)
- Auto-seeding: admin user + 3 sample properties

### Frontend Pages
- **Home**: Hero ("Your Space, Our Promise"), Services, Stats, How It Works, Featured Projects, Testimonials, CTA
- **Services**: Detailed service breakdown
- **Properties**: Search + filters (type/location/price), favorites, inquire
- **About**: Company info, values, stats
- **Contact**: Book Demo form + Inquiry form
- **Login/Register**: Tab-based auth
- **Dashboard**: Admin analytics with charts, bookings mgmt, user list, inquiries

### Key Features
- Premium Dark Navy + Gold design
- Framer Motion scroll animations
- Floating WhatsApp button (8105854999)
- AI Chat widget (bottom-left)
- Real analytics via Chart.js
- Responsive design
- Mobile-first

## Admin Credentials
- Email: admin@rtgroups.info
- Password: RTGroups@2026

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Premium UI with brand identity
- [x] Authentication system
- [x] Properties with filters
- [x] AI Chatbot integration
- [x] WhatsApp integration
- [x] Booking system
- [x] Admin dashboard

### P1 (Important)
- [ ] Real Twilio credentials for SMS OTP
- [ ] Forgot password flow
- [ ] Email notifications for bookings/inquiries
- [ ] Property image gallery (multiple images per listing)
- [ ] Property detail page

### P2 (Nice to have)
- [ ] Dark mode toggle (currently dark-only)
- [ ] SEO meta tags
- [ ] Property listing approval workflow
- [ ] Testimonials admin panel
- [ ] Blog section for SEO
- [ ] Lazy loading for property images
- [ ] Property comparison feature
- [ ] Virtual tour integration

## Next Tasks
1. Get real Twilio credentials from user to enable SMS OTP
2. Add property detail page with full info + multiple images
3. Add dark mode toggle as per requirement
4. Add image upload for admin property creation
