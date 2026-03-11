# 💬 CodeLeap Network

A modern, responsive social network for sharing posts.
Built with Next.js 16, React 19, Tailwind CSS v4, and Firebase Auth,
focused on performance, fluid typography, accessibility, and clean code.

![Project Status](https://img.shields.io/badge/Status-Completed-green)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Demo](#-demo)
- [Technologies](#-technologies--tools)
- [Features](#-implemented-features)
- [Architecture](#-project-architecture)
- [Full Visual Flow](#-full-visual-flow)
- [Folder Structure](#-folder-structure)
- [Design System](#-design-system)
- [Components](#-components)
- [Custom Hooks](#-custom-hooks)
- [Accessibility](#-accessibility)
- [Installation](#-installation--setup)
- [Scripts](#-available-scripts)
- [Design Reference](#-design-reference)
- [Author](#-author)

---

## 🎯 Overview

CodeLeap Network is a Twitter/Instagram-style social feed where users can create, edit, and delete posts, like, repost, comment with @mentions, attach images, and filter/sort the feed — all with infinite scroll and Firebase authentication.

### Key Features:

- ✅ **Fully Responsive** with fluid typography (`font-size: clamp()`)
- ✅ **Firebase Authentication** (Google + Email/Password) with simple fallback
- ✅ **Full CRUD** for posts via REST API
- ✅ **Infinite Scroll** with IntersectionObserver + TanStack Query
- ✅ **Permanent Likes** (no unlike, Instagram-style)
- ✅ **Reposts** with toggle on/off and counter
- ✅ **Automatic Views** via IntersectionObserver (once per session)
- ✅ **Comments** with highlighted @mentions
- ✅ **Smooth Animations** with Framer Motion
- ✅ **Clean Code** with ESLint, Prettier, and strict TypeScript

---

## 🌐 Deploy

> Coming soon: production deployment link

---

## 🚀 Technologies & Tools

### Core

| Technology   | Version | Description                         |
| ------------ | ------- | ----------------------------------- |
| Next.js      | 16.1.6  | React framework with App Router     |
| React        | 19.2.3  | UI library with hooks               |
| TypeScript   | 5       | Static typing                       |
| Tailwind CSS | v4      | Utility-first styling with `@theme` |

### State & Data

| Technology           | Version | Description                           |
| -------------------- | ------- | ------------------------------------- |
| TanStack React Query | 5.90+   | Cache, mutations, and infinite scroll |
| Firebase             | 12.10+  | Authentication (Google + Email)       |
| react-hook-form      | 7.71+   | Form management                       |
| zod                  | 4.3+    | Schema validation                     |

### UI & Animations

| Technology    | Version | Description              |
| ------------- | ------- | ------------------------ |
| Framer Motion | 12.35+  | Enter/exit animations    |
| lucide-react  | 0.577+  | SVG icons                |
| sonner        | 2.0+    | Toast notifications      |
| date-fns      | 4.1+    | Relative date formatting |

### Code Quality

| Tool              | Description              |
| ----------------- | ------------------------ |
| ESLint            | TypeScript/JSX linter    |
| Prettier          | Automatic code formatter |
| TypeScript strict | Strict type checking     |

---

## ✨ Implemented Features

### 1. 🔐 Authentication

- Login/Register with **Firebase Auth** (Email + Google)
- Password strength indicators on registration
- Fallback to simple authentication (username) when Firebase is unavailable
- Session persistence via `localStorage`

### 2. 📝 Post CRUD

- Create with title, content, and **optional image** (`[img:URL]`)
- Inline editing via modal
- Deletion with confirmation modal
- Validation with `react-hook-form` + `zod`

### 3. ❤️ Social Interactions

- **Permanent Like** — no unlike option (Instagram-style)
- **Repost** — toggle on/off with counter
- **Views** — automatic counting via IntersectionObserver (once per session)
- **Comments** — with `@mention` support highlighted in blue

### 4. 📱 Responsive Design

- **Fluid typography** with `clamp()` (320px → 1200px)
- Adaptive layout across all screen sizes
- Responsive cards, modals, and forms

### 5. 🔄 Infinite Scroll

- Pagination via `useInfiniteQuery` (TanStack Query)
- Sentinel element with IntersectionObserver
- Filter by username and sort order (newest/oldest)

### 6. 🎬 Animations

- Card entrance with fade + slide (Framer Motion)
- Heart pulse on like
- Smooth modal transitions (scale + opacity)
- `AnimatePresence` for animated exit

---

## 🏗️ Project Architecture

The project follows the **Next.js App Router** architecture with client-side components and clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS APP ROUTER ARCHITECTURE             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐                                               │
│  │   layout.tsx  │ ◀── Root layout (Providers, fonts, metadata) │
│  └──────┬───────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Providers                            │   │
│  │  ┌─────────────┐ ┌──────────┐ ┌──────────┐              │   │
│  │  │ QueryClient │ │ AuthProv │ │ Toaster  │              │   │
│  │  └─────────────┘ └──────────┘ └──────────┘              │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      page.tsx                            │   │
│  │  ┌──────────┐ ┌────────────┐ ┌────────────┐             │   │
│  │  │AppHeader │ │CreatePost  │ │ PostList   │             │   │
│  │  └──────────┘ │  Form      │ │ (∞ scroll) │             │   │
│  │               └────────────┘ └─────┬──────┘             │   │
│  └────────────────────────────────────┼─────────────────────┘   │
│                                       │                         │
│                                       ▼                         │
│                              ┌─────────────────┐                │
│                              │    PostCard      │                │
│                              │  ┌─────────────┐│                │
│                              │  │Like│Repost  ││                │
│                              │  │Comment│View ││                │
│                              │  └─────────────┘│                │
│                              └─────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌─────────────┐      ┌─────────────┐      ┌──────────────────────┐
│  User Action │─────▶│  React Hook │─────▶│  TanStack Query      │
│  (click/type)│      │  (custom)   │      │  (cache + mutations) │
└─────────────┘      └─────────────┘      └──────────┬───────────┘
                                                      │
                                          ┌───────────┴───────────┐
                                          │                       │
                                          ▼                       ▼
                                  ┌──────────────┐    ┌──────────────────┐
                                  │  REST API    │    │  localStorage    │
                                  │  (CodeLeap)  │    │  (likes/reposts/ │
                                  │              │    │   views/comments)│
                                  └──────────────┘    └──────────────────┘
```

---

## 🔄 Full Visual Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE USER FLOW                               │
└──────────────────────────────────────────────────────────────────────────┘

  ┌─────────┐      NO      ┌──────────────┐    Firebase?    ┌──────────┐
  │  Access │──────────────▶│  LoginModal  │───── YES ──────▶│ Firebase │
  │  /      │ authenticated?│              │                 │ Auth     │
  └─────────┘               │  ┌─────────┐│     NO          │ Google + │
       │                    │  │ Simple  ││◀────────────────│ Email    │
       │ YES                │  │username ││                 └──────────┘
       │                    │  └─────────┘│
       ▼                    └──────┬───────┘
  ┌─────────────────┐              │
  │    AppHeader    │◀─────────────┘ login OK
  │  "CodeLeap Net" │
  │  [Logout]       │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐    submit     ┌──────────────────────┐
  │  CreatePostForm │──────────────▶│  POST /careers/      │
  │  Title          │               │  (REST API)          │
  │  Content        │               └──────────┬───────────┘
  │  [Image]        │                          │ invalidate cache
  └────────┬────────┘                          │
           │                                   ▼
           ▼                          ┌──────────────────┐
  ┌─────────────────┐                 │  TanStack Query  │
  │  FilterBar      │                 │  refetch posts   │
  │  Sort ↕ Search  │                 └──────────────────┘
  └────────┬────────┘                          │
           │                                   │
           ▼                                   ▼
  ┌──────────────────────────────────────────────────────┐
  │                     PostList                         │
  │                                                      │
  │  ┌─────────────────────────────────────────────────┐ │
  │  │  PostCard                                       │ │
  │  │  ┌────────────────────────────────────────────┐ │ │
  │  │  │ Header: Title   [🗑️ Delete] [✏️ Edit]      │ │ │
  │  │  ├────────────────────────────────────────────┤ │ │
  │  │  │ @username              25 minutes ago      │ │ │
  │  │  │                                            │ │ │
  │  │  │ Post content with @mentions                │ │ │
  │  │  │ [attached image]                           │ │ │
  │  │  │                                            │ │ │
  │  │  │ ❤️ Like  💬 Comment  🔁 Repost  👁️ Views   │ │ │
  │  │  │                                            │ │ │
  │  │  │ ┌─ Comments ─────────────────────────────┐ │ │ │
  │  │  │ │ @user1: comment with @mention          │ │ │ │
  │  │  │ │ @user2: another comment                │ │ │ │
  │  │  │ │ [write a comment...            ] [▶️]   │ │ │ │
  │  │  │ └────────────────────────────────────────┘ │ │ │
  │  │  └────────────────────────────────────────────┘ │ │
  │  └─────────────────────────────────────────────────┘ │
  │                                                      │
  │  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐  │
  │    PostCard ...  PostCard ...  (infinite scroll)   │  │
  │  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘  │
  │                                                      │
  │  ┌──────────────────┐                                │
  │  │ 🔽 Sentinel      │ ◀── IntersectionObserver       │
  │  │ (load more)      │     triggers fetchNextPage()   │
  │  └──────────────────┘                                │
  └──────────────────────────────────────────────────────┘

  ┌──────────────── Modals ─────────────────┐
  │                                         │
  │  ┌─────────────┐   ┌─────────────────┐  │
  │  │ DeleteModal │   │   EditModal     │  │
  │  │ "Are you   │   │ Title:  [____]  │  │
  │  │  sure?"    │   │ Content:[____]  │  │
  │  │ [Cancel]    │   │ [Cancel] [Save] │  │
  │  │ [Delete]    │   │                 │  │
  │  └─────────────┘   └─────────────────┘  │
  │                                         │
  │  ┌─────────────────────────────────┐    │
  │  │ LogoutModal                     │    │
  │  │ "Leaving so soon?"             │    │
  │  │ [Stay]  [Yes, log out]         │    │
  │  └─────────────────────────────────┘    │
  └─────────────────────────────────────────┘
```

### Social Interactions Flow

```
  ❤️ LIKE                🔁 REPOST              👁️ VIEW
  ─────────              ──────────             ──────────
  Click                  Click                  Viewport
    │                      │                   intersection
    ▼                      ▼                      │
  already     ──YES──▶ nothing  reposted? ──YES──▶ remove   already seen
  liked?                        │                  this session?
    │                          NO                    │
    NO                          │                   NO
    │                           ▼                    │
    ▼                    toggleRepost()              ▼
  addLike()                  │              recordView()
    │                        ▼                     │
    ▼                    localStorage              ▼
  localStorage           reposts + count       localStorage
  likes + count                                view counts
                                                   +
                                              sessionStorage
                                              (session dedup)
```

---

## 📂 Folder Structure

```
codeleap/
├── 📄 package.json                          # Dependencies and scripts
├── 📄 next.config.ts                        # Next.js configuration
├── 📄 tsconfig.json                         # TypeScript configuration
├── 📄 eslint.config.mjs                     # ESLint configuration
├── 📄 postcss.config.mjs                    # PostCSS configuration
├── 📄 README.md                             # This documentation
│
├── 📁 public/                               # Static assets
│   └── 📁 icon/
│       ├── 🖼️ ic_baseline-delete-forever.svg # Delete icon
│       └── 🖼️ bx_bx-edit.svg                # Edit icon
│
└── 📁 src/                                  # Source code
    │
    ├── 📁 app/                              # App Router (Next.js)
    │   ├── 📄 layout.tsx                    # Root layout (providers, fonts)
    │   ├── 📄 page.tsx                      # Main page (feed)
    │   ├── 📄 error.tsx                     # Error boundary
    │   ├── 📄 not-found.tsx                 # 404 page
    │   └── 📄 globals.css                   # Global styles + design tokens
    │
    ├── 📁 components/                       # React components
    │   ├── 📁 auth/
    │   │   └── 📄 LoginModal.tsx            # Login/Register (Firebase + simple)
    │   ├── 📁 feed/
    │   │   ├── 📄 AppHeader.tsx             # Sticky header + logout modal
    │   │   ├── 📄 CreatePostForm.tsx        # Post creation form
    │   │   ├── 📄 PostCard.tsx              # Full card with interactions
    │   │   └── 📄 PostList.tsx              # Feed with filter + infinite scroll
    │   ├── 📁 modals/
    │   │   ├── 📄 DeletePostModal.tsx       # Deletion confirmation
    │   │   └── 📄 EditPostModal.tsx         # Post editing
    │   ├── 📁 states/
    │   │   ├── 📄 EmptyState.tsx            # Empty feed
    │   │   ├── 📄 ErrorState.tsx            # Loading error
    │   │   └── 📄 LoadingSkeleton.tsx       # Skeleton loading
    │   └── 📁 ui/
    │       ├── 📄 Button.tsx                # 5 variants, 3 sizes, loading
    │       ├── 📄 Input.tsx                 # Input with label + error
    │       ├── 📄 Textarea.tsx              # Textarea with label + error
    │       ├── 📄 Modal.tsx                 # Animated modal (ESC, overlay)
    │       ├── 📄 Skeleton.tsx              # Loading placeholder
    │       └── 📄 index.ts                  # Barrel exports
    │
    ├── 📁 contexts/
    │   └── 📄 AuthContext.tsx               # Authentication provider
    │
    ├── 📁 hooks/                            # Custom hooks
    │   ├── 📄 useCreatePost.ts              # Create mutation
    │   ├── 📄 useDeletePost.ts              # Delete mutation
    │   ├── 📄 useUpdatePost.ts              # Update mutation
    │   ├── 📄 usePosts.ts                   # Infinite post query
    │   ├── 📄 useLikes.ts                   # Likes system
    │   ├── 📄 useReposts.ts                 # Reposts system
    │   ├── 📄 useViews.ts                   # Auto view tracking
    │   └── 📄 useIntersectionObserver.ts    # Generic observer
    │
    ├── 📁 lib/                              # Utilities
    │   ├── 📄 api.ts                        # HTTP client (REST API)
    │   ├── 📄 firebase.ts                   # Conditional Firebase init
    │   ├── 📄 providers.tsx                 # Providers wrapper
    │   └── 📄 utils.ts                      # cn() + formatTimeAgo()
    │
    └── 📁 types/
        └── 📄 api.ts                        # TypeScript interfaces
```

---

## 🎨 Design System

### Color Palette

| Token                   | Value     | Usage                         |
| ----------------------- | --------- | ----------------------------- |
| `--color-primary`       | `#7695ec` | Buttons, links, header, focus |
| `--color-primary-dark`  | `#5a7be8` | Primary hover                 |
| `--color-primary-light` | `#eef2fd` | Highlight background          |
| `--color-danger`        | `#ef4444` | Delete button, errors         |
| `--color-danger-dark`   | `#dc2626` | Danger hover                  |
| `--color-success`       | `#47b960` | Active repost, success        |
| `--color-page-bg`       | `#dddddd` | Page background               |

### Fluid Typography

| Token                    | Value (`clamp()`)                            | Range         |
| ------------------------ | -------------------------------------------- | ------------- |
| `--font-size-heading`    | `clamp(1.125rem, 1rem + 0.5vw, 1.375rem)`    | 18px → 22px   |
| `--font-size-heading-xl` | `clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)`     | 20px → 24px   |
| `--font-size-subheading` | `clamp(0.938rem, 0.85rem + 0.4vw, 1.125rem)` | 15px → 18px   |
| `--font-size-label`      | `clamp(0.875rem, 0.82rem + 0.25vw, 1rem)`    | 14px → 16px   |
| `--font-size-body`       | `clamp(0.8rem, 0.76rem + 0.2vw, 0.875rem)`   | 12.8px → 14px |
| `--font-size-caption`    | `clamp(0.688rem, 0.66rem + 0.15vw, 0.75rem)` | 11px → 12px   |

### Spacing & Shadows

| Token         | Value                          | Usage          |
| ------------- | ------------------------------ | -------------- |
| `--shadow-sm` | `0 1px 4px rgba(0,0,0,0.08)`   | Subtle hover   |
| `--shadow-md` | `0 4px 20px rgba(0,0,0,0.1)`   | Elevated cards |
| `--shadow-lg` | `0 16px 48px rgba(0,0,0,0.16)` | Modals         |

---

## 🧩 Components

### UI Components

| Component  | Props                                      | Description                       |
| ---------- | ------------------------------------------ | --------------------------------- |
| `Button`   | `variant`, `size`, `isLoading`             | 5 variants × 3 sizes + spinner    |
| `Input`    | `label`, `error`                           | Input with `forwardRef` for forms |
| `Textarea` | `label`, `error`                           | Fixed textarea, 3 rows, no resize |
| `Modal`    | `isOpen`, `onClose`, `closeOnOverlayClick` | Overlay + ESC + focus trap        |
| `Skeleton` | `className`                                | Animated pulsing placeholder      |

### Feed Components

| Component        | Description                                      |
| ---------------- | ------------------------------------------------ |
| `AppHeader`      | Sticky header with logout modal                  |
| `CreatePostForm` | Validated form with image attachment             |
| `PostList`       | Feed with sort, filter, and infinite scroll      |
| `PostCard`       | Full card: like, repost, view, comment, @mention |

### State Components

| Component         | When Displayed          |
| ----------------- | ----------------------- |
| `LoadingSkeleton` | While posts are loading |
| `EmptyState`      | Feed has no posts       |
| `ErrorState`      | Failed to load posts    |

---

## 🪝 Custom Hooks

| Hook                        | Responsibility                                        |
| --------------------------- | ----------------------------------------------------- |
| `usePosts()`                | `useInfiniteQuery` — feed pagination (PAGE_SIZE = 10) |
| `useCreatePost()`           | POST mutation + cache invalidation                    |
| `useUpdatePost()`           | PATCH mutation + invalidation                         |
| `useDeletePost()`           | DELETE mutation + invalidation                        |
| `useLikes()`                | Permanent like — `addLike()`, no unlike, localStorage |
| `useReposts()`              | Toggle repost — `toggleRepost()`, localStorage        |
| `useViews()`                | Auto-tracking — IntersectionObserver + sessionStorage |
| `useIntersectionObserver()` | Generic observer for scroll sentinel                  |

---

## ♿ Accessibility

### Implemented Features

| Feature             | Implementation                                        |
| ------------------- | ----------------------------------------------------- |
| ARIA Labels         | All buttons and interactive elements                  |
| ARIA Pressed        | Like and repost state                                 |
| ARIA Modal          | `role="dialog"` + `aria-modal="true"`                 |
| Focus Trap          | Auto-focus on modal panel                             |
| Keyboard Navigation | `Escape` closes modals                                |
| Focus Visible       | Blue ring with animated `outline-offset`              |
| Semantic HTML       | `<header>`, `<main>`, `<article>`, `<time>`, `<form>` |
| Scroll Lock         | `body overflow: hidden` when modal is open            |
| Alt Texts           | Images with descriptive alt or `aria-hidden`          |

---

## 🔧 Installation & Setup

### Prerequisites

- Node.js v18 or higher
- pnpm v9 or higher

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/glauccoeng-prog/CodeLeap.git
cd CodeLeap/codeleap

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev

# 4. Open in your browser
# http://localhost:3000
```

### Production Build

```bash
# Generate optimized build
pnpm build

# Serve the build locally
pnpm start
```

---

## 📜 Available Scripts

| Command           | Runs                 | Description                |
| ----------------- | -------------------- | -------------------------- |
| `pnpm dev`        | `next dev`           | Development server         |
| `pnpm build`      | `next build`         | Optimized production build |
| `pnpm start`      | `next start`         | Serves the generated build |
| `pnpm lint`       | `eslint`             | Checks for lint errors     |
| `pnpm type-check` | `tsc --noEmit`       | Checks TypeScript types    |
| `pnpm format`     | `prettier --write .` | Formats all code           |

---

## 🎨 Design Reference

This project was built based on the Figma designs for CodeLeap Network:

### Implemented Screens

1. **Login/Signup** — Authentication modal (Firebase + simple)
2. **Main Screen** — Post feed with header, creation, and listing
3. **Delete Modal** — Post deletion confirmation
4. **Edit Modal** — Title and content editing

---

## 👨‍💻 Author

**Glaucco Siqueira**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/glaucco-siqueira/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/glauccoeng-prog)
