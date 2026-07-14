# Cloudinary Showcase (Watchly)

A full-stack SaaS application for uploading, compressing, and streaming videos — powered by **Cloudinary**, **Next.js 16**, and **PostgreSQL**.

---

## ✨ Features

- 🎬 **Video Upload** — Upload large videos (up to 100MB) with chunked streaming directly to Cloudinary
- 🗜️ **Auto Compression** — Cloudinary processes videos asynchronously with `eager_async` transformations
- 📊 **Compression Stats** — See original vs compressed size and compression percentage per video
- 🖼️ **Social Share** — Generate optimized images for social media sharing
- 🌗 **Dark / Light Mode** — Toggle with persistent preference via `localStorage`
- 🔐 **Authentication** — Clerk-powered sign-in / sign-up with protected routes
- 📱 **Responsive UI** — Sidebar drawer layout, works on mobile and desktop

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + DaisyUI v5 |
| **Auth** | Clerk (`@clerk/nextjs`) |
| **Media Storage** | Cloudinary (`cloudinary` SDK + `next-cloudinary`) |
| **Database** | PostgreSQL (via `pg`) |
| **ORM** | Prisma v7 (`@prisma/client`) |
| **HTTP Client** | Axios |
| **Notifications** | react-hot-toast |
| **Icons** | lucide-react |
| **Date Formatting** | dayjs |
| **File Size Formatting** | filesize |

---

## 📁 File Structure

```
cloudinarysaas/
├── app/
│   ├── (app)/                    # Protected app routes (authenticated)
│   │   ├── layout.tsx            # Sidebar + Navbar layout with theme toggle
│   │   ├── home/                 # Home page — video grid
│   │   ├── video-upload/         # Video upload page
│   │   └── social-share/        # Social share image generator
│   ├── (auth)/                   # Public auth routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── api/
│   │   ├── video-upload/
│   │   │   └── route.ts          # POST — streams video to Cloudinary
│   │   ├── image-upload/
│   │   │   └── route.ts          # POST — uploads image to Cloudinary
│   │   └── videos/
│   │       └── route.ts          # GET — fetches all videos from DB
│   ├── globals.css               # Global styles + light/dark theme rules
│   ├── layout.tsx                # Root layout (ClerkProvider, fonts)
│   └── page.tsx                  # Root redirect
├── components/
│   └── VideoCard.tsx             # Video card with preview, stats, download
├── prisma/
│   ├── schema.prisma             # Database schema (Video model)
│   └── migrations/               # Prisma migration history
├── generated/
│   └── prisma/                   # Auto-generated Prisma client
├── lib/
│   └── prisma.ts                 # Prisma client singleton
├── proxy.ts                      # Clerk middleware (route protection)
├── next.config.ts                # Next.js config (body size limits)
├── prisma.config.ts              # Prisma config
├── types.ts                      # Shared TypeScript types
└── .env                          # Environment variables
```

---

## 🗄️ Database Schema

```prisma
model Video {
  id             String   @id @default(cuid())
  title          String
  description    String?
  publicId       String              // Cloudinary public ID
  originalSize   String              // In bytes
  compressedSize String              // In bytes
  duration       Float               // In seconds
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## ⚙️ Environment Variables

Create a `.env` file at the root with the following:

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

```bash
npx prisma migrate deploy
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/video-upload` | Upload a video file to Cloudinary and save metadata to DB |
| `POST` | `/api/image-upload` | Upload an image file to Cloudinary |
| `GET` | `/api/videos` | Fetch all videos from the database |

---

## 🔐 Route Protection

All `/(app)/*` routes and `/api/*` routes (except `/api/videos`) are protected by Clerk middleware defined in [`proxy.ts`](./proxy.ts). Unauthenticated users are redirected to `/sign-in`.

---

## 📝 Implementation Notes

- **Large video uploads** use streaming (via Web `ReadableStream`) instead of buffering the entire file in memory, preventing OOM errors for files >10MB.
- **Cloudinary transformations** use `eager_async: true` — videos are transcoded to optimised MP4 in the background after upload, not synchronously (required for files >~10MB).
- The `next.config.ts` sets `experimental.proxyClientMaxBodySize: '100mb'` to allow large request bodies through Next.js 16's proxy layer.
- Theme toggle persists via `localStorage` and applies `data-theme` on the `<html>` element to drive DaisyUI's full theming system.
