Inner Circle — Full PRD & Implementation Package

Phase 2: Clean PRD (Technical Specification)
1. App Goal
Inner Circle is BackScoop's curated private network that connects Southeast Asian founders, operators, and investors through high-quality, hand-selected introductions. Members apply via a waitlist, are vetted and approved by admins, pay for a monthly membership (Basic $20/mo or Prestige $98/mo), and receive 1–2 personally matched introductions per month. The platform manages the full lifecycle: application → approval → payment → member profiling → admin-driven match suggestions → intro delivery.
2. User Roles
RoleDescriptionPermissionsguestUnauthenticated visitorView landing page, submit waitlist applicationapplicantSubmitted application, pending reviewView application statusmemberApproved + paid subscriberView dashboard, edit profile/preferences, view past & upcoming intros, manage subscriptionadminBackScoop teamReview/approve/reject applications, manage members, view/approve match suggestions, send intro emails, manage plans, view analytics
3. Core Entities (Data Model)
Entities:

- user: id, email, name, role (guest/applicant/member/admin), avatar_url, created_at, updated_at

- application: id, user_id, email, name, linkedin_url, company, role_title, status (pending/approved/rejected), reviewed_by, reviewed_at, created_at, updated_at

- member_profile: id, user_id, industry, expertise_areas, looking_for, bio, linkedin_url, company, role_title, tier (basic/prestige), created_at, updated_at

- subscription: id, user_id, stripe_customer_id, stripe_subscription_id, tier (basic/prestige), status (active/cancelled/past_due/trialing), current_period_start, current_period_end, created_at, updated_at

- introduction: id, member_a_id, member_b_id, matched_by (admin user_id), status (suggested/approved/sent/completed/declined), intro_message, sent_at, feedback_a, feedback_b, month_year, created_at, updated_at

- introduction_feedback: id, introduction_id, member_id, rating (1-5), notes, created_at

Relationships:
- application.user_id → user.id (one-to-one)
- member_profile.user_id → user.id (one-to-one)
- subscription.user_id → user.id (one-to-one)
- introduction.member_a_id → user.id (many-to-one)
- introduction.member_b_id → user.id (many-to-one)
- introduction.matched_by → user.id (many-to-one)
- introduction_feedback.introduction_id → introduction.id (many-to-one)
- introduction_feedback.member_id → user.id (many-to-one)
4. Essential Features (MVP Scope)
Priority 1 — Core Infrastructure

Public landing page with waitlist signup form (name, email, LinkedIn, company/role)
Email/password authentication (signup + login)
Stripe integration for subscription billing (Basic $20/mo, Prestige $98/mo)

Priority 2 — Admin Portal
4. Admin dashboard: view all applications with status filters (pending/approved/rejected)
5. Application review: approve or reject with one click; approval triggers email with payment link
6. Member management: view all active members, their profiles, tiers, and subscription status
7. Introduction management: view suggested matches, approve/edit, and trigger intro emails
8. Match suggestion engine: system suggests matches based on member profiles/preferences; admin approves
Priority 3 — Member Portal
9. Member onboarding: after payment, prompt to complete profile (industry, expertise, what they're looking for, bio)
10. Member dashboard: view profile, current tier, upcoming introduction, past introductions
11. Introduction history: list of all past intros with date, person introduced to, and feedback status
12. Subscription management: view plan, upgrade/downgrade, cancel (via Stripe Customer Portal)
5. Authentication Strategy

Supabase Auth with email/password signup
Magic link as secondary option for password recovery
Admin role assigned manually in database (or via seed)
Middleware protects /dashboard (member) and /admin routes
Session management via cookies (Supabase SSR)

6. Technology Stack
- Framework: Next.js 15 (App Router)
- Language: TypeScript (strict)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (email/password)
- Payments: Stripe (Checkout + Customer Portal + Webhooks)
- Email: Resend (transactional emails: approval, intro, welcome)
- Styling: Tailwind CSS + shadcn/ui
- Hosting: Vercel
7. File Structure
/app
  /page.tsx                          # Landing page (public)
  /layout.tsx                        # Root layout
  /(auth)
    /login/page.tsx
    /signup/page.tsx
    /callback/route.ts               # Supabase auth callback
  /(member)
    /dashboard/page.tsx              # Member dashboard
    /profile/page.tsx                # Edit profile
    /introductions/page.tsx          # Intro history
    /subscription/page.tsx           # Manage subscription
    /onboarding/page.tsx             # Post-payment profile setup
  /(admin)
    /admin/page.tsx                  # Admin dashboard overview
    /admin/applications/page.tsx     # Review applications
    /admin/members/page.tsx          # Manage members
    /admin/introductions/page.tsx    # Manage intros & matches
  /api
    /webhooks/stripe/route.ts        # Stripe webhook handler
    /webhooks/supabase/route.ts      # (optional) DB change hooks
  /actions
    /applications.ts                 # Apply, approve, reject
    /members.ts                      # Profile CRUD
    /introductions.ts                # Match, approve, send
    /subscriptions.ts                # Stripe operations
/components
  /ui                                # shadcn base components
  /features
    /landing                         # Hero, waitlist form, testimonials
    /admin                           # Application table, match manager
    /member                          # Dashboard cards, intro cards
    /shared                          # Navbar, footer, status badges
/lib
  /supabase
    /client.ts                       # Browser client
    /server.ts                       # Server client
    /middleware.ts                    # Auth middleware
  /stripe
    /client.ts                       # Stripe instance
    /helpers.ts                      # Checkout, portal, webhook utils
  /email
    /templates.ts                    # Email templates
    /send.ts                         # Resend integration
  /utils
    /matching.ts                     # Match suggestion logic
    /constants.ts                    # Plan tiers, prices, etc.
/types
  /database.ts                       # Supabase generated types
  /stripe.ts                         # Stripe-related types
/public
  /images                            # Landing page assets
/middleware.ts                       # Route protection

Phase 2.5: .cursorrules File
markdown# Inner Circle - Cursor Rules

## Project Overview
Inner Circle is a curated private network by BackScoop that connects Southeast Asian founders, operators, and investors through vetted, hand-selected monthly introductions. The platform manages a waitlist → approval → payment → matching → introduction pipeline with both admin and member portals.

## Tech Stack
- Framework: Next.js 15 App Router
- Language: TypeScript (strict mode)
- Database: Supabase PostgreSQL
- Auth: Supabase Auth (email/password)
- Payments: Stripe (Checkout, Customer Portal, Webhooks)
- Email: Resend (transactional)
- Styling: Tailwind CSS + shadcn/ui

## File Structure
/app
  /(auth)           # Login, signup, callback
  /(member)         # Member dashboard, profile, intros, subscription
  /(admin)          # Admin dashboard, applications, members, intros
  /api/webhooks     # Stripe + Supabase webhooks
  /actions          # Server Actions only
/components
  /ui               # shadcn base components
  /features         # Feature-specific components
/lib
  /supabase         # Supabase client setup (client.ts, server.ts)
  /stripe           # Stripe client + helpers
  /email            # Resend templates + send utility
  /utils            # Matching logic, constants
/types
  /database.ts      # Generated from Supabase
  /stripe.ts        # Stripe types

## Code Style & Patterns

### Component Patterns
- Default to Server Components
- Only use 'use client' when absolutely necessary (forms, interactivity, browser APIs)
- Keep components focused and single-purpose
- Use TypeScript for all files

### Data Fetching
- Server Components: fetch data directly from Supabase
- Client Components: use Server Actions for mutations
- Always handle loading and error states
- Use revalidatePath() after mutations

### Server Actions
- All Server Actions in /app/actions directory
- Always use 'use server' directive
- Always validate user authentication
- Always validate input data
- Return structured responses: { success: boolean, data?: any, error?: string }
- Handle errors with try/catch

### Database
- All tables must have: id (uuid), created_at, updated_at
- Enable RLS on all tables
- Use foreign keys for relationships
- Create indexes for frequently queried columns
- Never expose database credentials in client code

### Stripe Integration
- Use Stripe Checkout for initial subscription
- Use Stripe Customer Portal for self-service management
- Handle all subscription lifecycle events via webhooks
- Store stripe_customer_id and stripe_subscription_id on user/subscription records
- Never trust client-side payment confirmations — always verify via webhook

### Email Patterns
- Use Resend for all transactional emails
- Templates in /lib/email/templates.ts
- Send emails from Server Actions or webhook handlers
- Always include unsubscribe links where required

### Error Handling
- Never throw raw errors to the client
- Always return error objects from Server Actions
- Show user-friendly error messages in UI
- Log errors to console for debugging

### Type Safety
- Generate types from Supabase: supabase gen types typescript
- Import types from @/types/database
- No 'any' types except in rare edge cases
- Use Zod for runtime validation on form inputs

## Anti-Patterns (Never Do This)
- ❌ Don't use pages directory patterns (getServerSideProps, getStaticProps)
- ❌ Don't fetch data in Client Components
- ❌ Don't store secrets in environment variables prefixed with NEXT_PUBLIC_
- ❌ Don't skip RLS policies
- ❌ Don't use client-side Supabase client for authenticated operations
- ❌ Don't trust Stripe events without webhook signature verification
- ❌ Don't store card details — let Stripe handle all payment data
- ❌ Don't send intro emails without admin approval
- ❌ Don't create files without explicit instructions

## Context Instructions
When modifying:
- Server Actions → also check the component that calls it
- Database schema → regenerate TypeScript types
- Authentication → check middleware and RLS policies
- Stripe webhooks → verify event types match Stripe dashboard config
- Components → verify imports and parent component usage
- Email templates → test with Resend preview

## Testing Approach
Manual testing only for MVP. Key flows to verify:
1. Waitlist signup → application created in DB
2. Admin approve → email sent with payment link
3. Stripe Checkout → subscription created → member activated
4. Admin match → intro email sent to both parties
5. Member can view dashboard, edit profile, see intro history

Phase 3: Project Context Primer
markdown## Project Context Primer

Inner Circle is a curated networking platform built for BackScoop that manages a waitlist-to-introduction pipeline for Southeast Asian founders, operators, and investors. Members apply, get vetted by admins, pay for monthly subscriptions via Stripe, and receive 1–2 hand-matched introductions per month.

**Architecture:**
- Next.js 15 App Router with Server Components as default
- Supabase for PostgreSQL database and authentication
- Stripe for subscription billing (Checkout + Customer Portal + Webhooks)
- Resend for transactional emails (approval notifications, intro emails)
- TypeScript for type safety throughout
- Server Actions for all mutations

**Database Design:**
- Six core tables: user, application, member_profile, subscription, introduction, introduction_feedback
- RLS policies enforce user-level data isolation on all tables
- Admin role checked server-side for admin operations
- Foreign keys ensure referential integrity across the introduction graph
- Subscription table mirrors Stripe state, updated via webhooks

**Authentication & Authorization:**
- Supabase Auth with email/password
- Session management via cookies (SSR-compatible)
- Middleware protects /dashboard (members) and /admin (admins) routes
- Role-based access: guest → applicant → member, with separate admin role
- Admin role stored in user table, checked in Server Actions and middleware

**Payment Flow:**
- Admin approves application → system emails applicant with Stripe Checkout link
- Checkout creates subscription → webhook fires → system activates membership
- Members manage billing via Stripe Customer Portal (upgrade, downgrade, cancel)
- Webhook handles: checkout.session.completed, invoice.paid, customer.subscription.updated/deleted

**Matching System:**
- Members complete profiles with industry, expertise, and "looking for" preferences
- System suggests matches based on complementary profiles (not identical)
- Admins review suggestions, approve or modify, then trigger intro emails
- Introduction records track full lifecycle: suggested → approved → sent → feedback

**Component Strategy:**
- Server Components for data-heavy pages (admin tables, member dashboards)
- Client Components for forms, interactive filters, real-time status updates
- shadcn/ui for base components (tables, cards, buttons, dialogs)
- Feature components organized by domain: /landing, /admin, /member

**Data Flow:**
- Server Components fetch directly from Supabase
- Server Actions handle mutations with auth validation
- Stripe webhooks update subscription state
- revalidatePath() after mutations for cache updates
- Resend sends emails from Server Actions and webhook handlers