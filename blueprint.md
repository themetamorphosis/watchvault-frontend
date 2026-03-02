# Project Blueprint

## Overview
WatchVault is a personal watchlist tracker for Movies, TV Shows, and Anime. Built with Next.js 16 (App Router), Tailwind CSS v4, Framer Motion, and a custom glassmorphism design system.

## Current State & Architecture

### App Shell
- **Top navigation bar** (glassmorphism, sticky): Logo, primary tabs (Dashboard, Library, Discovery, AI Agent, Social), global search, profile menu
- **Route group** `(app)` wraps all authenticated routes with `AppShell` component
- **Background**: Dark cinematic (#050505) with subtle radial gradients + noise overlay

### Navigation
- **Primary tabs**: `/dashboard`, `/library`, `/discovery`, `/ai`, `/social`
- **Library sub-tabs**: `/library/movies`, `/library/tv`, `/library/anime`
- **Discovery/AI/Social**: Under development placeholders with feature previews

### Library Architecture
- **Library layout**: Sub-navigation tabs, collapsible filter sidebar (desktop), drawer (mobile)
- **Filter sidebar**: Status filters (All/Watched/Pending/Wishlist/Favorites), My Lists, Genres
- **Search filter bar**: Search input + genre/year/sort dropdowns + grid/list view toggle
- **Poster grid**: Hover intelligence with gradient overlay, status chip, progress bar, quick actions
- **Continue Watching row**: Horizontal scrollable cards with progress bars

### Dashboard
- **Hero insight card**: Hours watched, top genre, longest series
- **KPI counters**: Movies, TV Shows, Anime, Favorites (animated CountUp)
- **Analytics**: Status breakdown donut chart + quick stats list

### Design System (globals.css)
- Liquid glass, bento cards, aurora backgrounds, floating orbs
- App header, nav tabs, sub-tabs, filter sidebar, search filter bar
- Poster card, skeleton loaders, donut chart, toast notifications
- Profile menu, global search, mobile drawer, continue watching cards
- Under development page animations

### Components
- **Layout**: `TopNavBar`, `AppShell`, `LibrarySubTabs`
- **Content**: `GlassCard`, `PosterCard`, `EmptyState`, `ContinueWatchingRow`
- **Forms**: `SearchFilterBar`, `FilterSidebar` (+ MobileFilterDrawer)
- **Pages**: `UnderDevelopmentPage`
- **Legacy**: `LibraryPage`, `MediaCard`, `ExpandableCardOverlay` (kept as reference)

## Most Recent Change: Dashboard Statistics Integration
Currently working on fixing the dashboard statistics to stop using hardcoded visual mockups and dynamically calculate and present the user's actual `watchlist` items. This involves computing Hours Watched, Top Genre, Longest Series, and individual status counts.