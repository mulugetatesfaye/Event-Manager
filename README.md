EventHub - Professional Event Management Platform
A full-stack event management application built with Next.js 15, featuring multi-role authentication, real-time event registration, and comprehensive admin dashboard.

🚀 Features
Core Functionality
Multi-Role System: Admin, Organizer, and Attendee roles with different permissions
Event Management: Create, read, update, and delete events
Event Registration: Users can register for events with capacity tracking
Real-time Updates: Instant registration updates and capacity monitoring
Event Discovery: Browse, search, and filter events by category
User Dashboard: Role-based dashboards with analytics
Event Categories: Organize events with color-coded categories
Responsive Design: Mobile-friendly interface with Tailwind CSS
User Roles & Permissions
Attendee (Default)
Browse and search events
Register for events
View registrations
Cancel registrations
Organizer
All Attendee permissions
Create events
Edit own events
Delete own events
View event analytics
Manage registrations
Admin
All Organizer permissions
Manage all events
Manage users and roles
Create/delete categories
Access admin dashboard
🛠️ Tech Stack
Frontend
Framework: Next.js 15 (App Router)
Language: TypeScript
Styling: Tailwind CSS
UI Components: shadcn/ui + Radix UI
Icons: Lucide React
Notifications: Sonner
Forms: React Hook Form + Zod validation
Date Handling: date-fns
Backend
Runtime: Node.js
API: Next.js API Routes
Authentication: Clerk
Database: PostgreSQL
ORM: Prisma
Data Fetching: TanStack Query (React Query)
Development Tools
Package Manager: npm
Linting: ESLint
Type Checking: TypeScript
Database GUI: Prisma Studio
📁 Project Structure
text

event-manager/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group routes
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx      # Sign-in page
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx      # Sign-up page
│   │   └── layout.tsx            # Auth layout
│   ├── (dashboard)/              # Dashboard group routes
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Main dashboard
│   │   │   ├── my-events/        # Organizer events
│   │   │   ├── registrations/    # User registrations
│   │   │   ├── analytics/        # Event analytics
│   │   │   ├── users/            # User management (Admin)
│   │   │   ├── categories/       # Category management (Admin)
│   │   │   └── settings/         # User settings
│   │   └── layout.tsx            # Dashboard layout with sidebar
│   ├── api/                      # API Routes
│   │   ├── categories/
│   │   │   ├── route.ts          # GET, POST categories
│   │   │   └── [id]/
│   │   │       └── route.ts      # PUT, DELETE category
│   │   ├── events/
│   │   │   ├── route.ts          # GET, POST events
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET, PUT, DELETE event
│   │   │       └── register/
│   │   │           └── route.ts  # POST, DELETE registration
│   │   ├── users/
│   │   │   ├── route.ts          # GET all users (Admin)
│   │   │   ├── me/
│   │   │   │   ├── route.ts      # GET current user
│   │   │   │   ├── events/
│   │   │   │   │   └── route.ts  # GET user's events
│   │   │   │   └── registrations/
│   │   │   │       └── route.ts  # GET user's registrations
│   │   │   ├── [id]/
│   │   │   │   └── role/
│   │   │   │       └── route.ts  # PUT update user role
│   │   │   └── upgrade/
│   │   │       └── route.ts      # POST upgrade to organizer
│   │   └── webhook/
│   │       └── clerk/
│   │           └── route.ts      # POST Clerk webhook
│   ├── events/
│   │   ├── page.tsx              # Events listing
│   │   ├── create/
│   │   │   └── page.tsx          # Create event
│   │   └── [id]/
│   │       ├── page.tsx          # Event details
│   │       └── edit/
│   │           └── page.tsx      # Edit event
│   ├── upgrade/
│   │   └── page.tsx              # Upgrade account page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Global styles
├── components/
│   ├── events/
│   │   ├── event-card.tsx        # Event card component
│   │   └── event-form.tsx        # Event create/edit form
│   ├── layout/
│   │   ├── navbar.tsx            # Navigation bar
│   │   └── footer.tsx            # Footer
│   ├── providers/
│   │   └── query-provider.tsx    # React Query provider
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── dialog.tsx
│       ├── table.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sonner.tsx
│       └── ... (other UI components)
├── hooks/
│   ├── use-events.ts             # Event-related hooks
│   ├── use-user.ts               # User-related hooks
│   ├── use-categories.ts         # Category-related hooks
│   └── index.ts                  # Hook exports
├── lib/
│   ├── prisma.ts                 # Prisma client
│   ├── utils.ts                  # Utility functions
│   └── get-or-create-user.ts     # User creation helper
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeding
├── types/
│   └── index.ts                  # TypeScript type definitions
├── scripts/
│   └── upgrade-user.ts           # User upgrade script
├── .env.local                    # Environment variables (not in git)
├── .gitignore
├── middleware.ts                 # Clerk middleware
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
⚙️ Environment Variables
Create a .env.local file in the root directory:

env

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Clerk Webhook (for user sync)
WEBHOOK_SECRET=whsec_your_webhook_secret

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/event_manager?schema=public"
🚀 Getting Started
Prerequisites
Node.js 18+ installed
PostgreSQL database running
Clerk account (clerk.com)
Installation
Clone the repository

Bash

git clone <your-repo-url>
cd event-manager
Install dependencies

Bash

npm install
Set up environment variables

Copy .env.example to .env.local
Fill in your Clerk keys from Clerk Dashboard
Add your PostgreSQL connection string
Set up the database

Bash

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed the database with categories
npm run db:seed
Run the development server

Bash

npm run dev
Open your browser
Navigate to http://localhost:3000

📊 Database Schema
Models
User
id - UUID (Primary Key)
clerkId - String (Unique, from Clerk)
email - String (Unique)
firstName - String (Optional)
lastName - String (Optional)
role - Enum: ADMIN, ORGANIZER, ATTENDEE
imageUrl - String (Optional)
Timestamps: createdAt, updatedAt
Event
id - UUID (Primary Key)
title - String
description - Text (Optional)
imageUrl - String (Optional)
location - String
venue - String (Optional)
startDate - DateTime
endDate - DateTime
capacity - Integer
price - Float
status - Enum: DRAFT, PUBLISHED, CANCELLED, COMPLETED
organizerId - Foreign Key to User
creatorId - Foreign Key to User
categoryId - Foreign Key to Category (Optional)
Timestamps: createdAt, updatedAt
Category
id - UUID (Primary Key)
name - String (Unique)
slug - String (Unique)
description - Text (Optional)
color - String (Hex color, Optional)
Timestamps: createdAt, updatedAt
Registration
id - UUID (Primary Key)
userId - Foreign Key to User
eventId - Foreign Key to Event
status - String (PENDING, CONFIRMED, CANCELLED)
Unique constraint on userId + eventId
Timestamps: createdAt, updatedAt
🔌 API Routes
Events
GET /api/events - Get all published events (with pagination & filters)
POST /api/events - Create new event (Organizer/Admin only)
GET /api/events/[id] - Get single event details
PUT /api/events/[id] - Update event (Owner/Admin only)
DELETE /api/events/[id] - Delete event (Owner/Admin only)
Event Registration
POST /api/events/[id]/register - Register for event
DELETE /api/events/[id]/register - Cancel registration
Users
GET /api/users - Get all users (Admin only)
GET /api/users/me - Get current user
GET /api/users/me/events - Get current user's created events
GET /api/users/me/registrations - Get current user's registrations
PUT /api/users/[id]/role - Update user role (Admin only)
POST /api/users/upgrade - Upgrade account to organizer
Categories
GET /api/categories - Get all categories
POST /api/categories - Create category (Admin only)
PUT /api/categories/[id] - Update category (Admin only)
DELETE /api/categories/[id] - Delete category (Admin only)
Webhooks
POST /api/webhook/clerk - Clerk user sync webhook
🎨 UI Components
All UI components are from shadcn/ui. To add more:

Bash

npx shadcn-ui@latest add [component-name]
Available components: button, card, input, select, dialog, table, badge, separator, toast, etc.

📜 Available Scripts
JSON

{
  "dev": "next dev",              // Start development server
  "build": "next build",          // Build for production
  "start": "next start",          // Start production server
  "lint": "next lint",            // Run ESLint
  "db:push": "prisma db push",    // Push schema to database
  "db:seed": "tsx prisma/seed.ts", // Seed database
  "db:studio": "prisma studio"    // Open Prisma Studio
}
🔧 Utility Scripts
Upgrade User to Organizer
Bash

npx tsx scripts/upgrade-user.ts user@email.com
View Database
Bash

npx prisma studio
🐛 Troubleshooting
Common Issues
Issue: "User not found" error

Solution: User is created automatically on first API call. Visit /upgrade to upgrade to organizer.
Issue: Images not loading

Solution: Ensure image domains are configured in next.config.js
Issue: 404 on API routes

Solution: Restart dev server after creating new route files
Issue: Database connection error

Solution: Check DATABASE_URL in .env.local and ensure PostgreSQL is running
Issue: Clerk authentication not working

Solution: Verify Clerk keys in .env.local and restart server
Clear Cache
Bash

# Remove Next.js cache
rm -rf .next

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
🔐 Security Features
Server-side authentication with Clerk
Role-based access control (RBAC)
Protected API routes
CSRF protection
SQL injection prevention (Prisma)
Input validation with Zod
Secure password handling (Clerk)
🎯 Key Features Explained
Event Registration System
Users can register for events with:

Capacity checking
Duplicate registration prevention
Real-time availability updates
Registration status tracking
Multi-Role Dashboard
Attendees: View registrations, browse events
Organizers: Create/manage events, view analytics
Admins: Full system access, user management
Event Management
Draft and publish workflow
Image support
Category organization
Location and venue details
Pricing support (free or paid)
🚢 Deployment
Vercel (Recommended)
Push your code to GitHub
Import project to Vercel
Add environment variables
Deploy
Environment Variables for Production
Set all .env.local variables in Vercel dashboard
Update DATABASE_URL to production database
Set WEBHOOK_SECRET for Clerk webhooks
Database
Use services like:
Supabase (PostgreSQL)
Railway
Neon
PlanetScale
📈 Future Enhancements
 Email notifications (Resend/SendGrid)
 Payment integration (Stripe)
 Event templates
 Recurring events
 Event check-in system
 QR code tickets
 Event reviews and ratings
 Social sharing
 Advanced analytics
 Export attendee lists
 Image upload (Cloudinary/UploadThing)
 Calendar integration (Google Calendar, iCal)
 Multi-language support
🤝 Contributing
Fork the repository
Create a feature branch
Commit your changes
Push to the branch
Open a Pull Request
📄 License
This project is licensed under the MIT License.

👥 Support
For support:

Open an issue on GitHub
Check existing documentation
Review troubleshooting section
🙏 Acknowledgments
Next.js
Clerk
Prisma
shadcn/ui
Tailwind CSS
Built with ❤️ using Next.js 15

Quick Reference
User Roles
ATTENDEE: Default role, can browse and register
ORGANIZER: Can create and manage events
ADMIN: Full system access
Event Statuses
DRAFT: Not visible to public
PUBLISHED: Visible and accepting registrations
CANCELLED: Event cancelled
COMPLETED: Event finished
Important Files
Database Schema: prisma/schema.prisma
API Routes: app/api/
Components: components/
Hooks: hooks/
Types: types/index.ts
Middleware: middleware.ts
First-Time Setup Checklist
 Install Node.js 18+
 Install PostgreSQL
 Create Clerk account
 Clone repository
 Run npm install
 Create .env.local with all variables
 Run npx prisma db push
 Run npm run db:seed
 Run npm run dev
 Create account and visit /upgrade
 Start building!