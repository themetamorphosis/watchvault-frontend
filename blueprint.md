# WatchVault Blueprint

## Overview
WatchVault is a personal watchlist tracker for Movies, TV Shows, and Anime. It allows users to manage their media journey with features like tracking watched status, adding to wishlists, marking favorites, and organizing by custom lists or genres. It uses Next.js App Router, Tailwind CSS, and Framer Motion for a fluid, cinematic UI.

## Project Outline
- **Design & Style**: Apple-inspired minimal aesthetic combined with Netflix's cinematic feel and dark glassmorphism. Fluid animations via Framer Motion. 
- **Features**:
  - `Dashboard`: Real-time statistics, donut charts for status breakdown, and dynamic insights based on user data.
  - `Libraries`: Segregated views for Movies, TV Shows, and Anime with visual grids.
  - `Discovery`: Premium discovery page with AI search bar, personalized "For You" carousel, trending rows, mood-based filtering (chip grid + results grid), curated editorial collections, and a right-side filter sheet.
  - `Navigation`: Sticky top navbar with glass pills, dynamic animated tabs.
  - `Search & Add`: TMDB integration for instant search, manual entry, data import.
  - `Filters`: comprehensive sidebar for status, favorites, sort, and genre filtering.

## Current Plan: Discovery Page Implementation
- Replaced `UnderDevelopmentPage` with a full Discovery page comprising 9 new components in `components/discovery/`.
- Sections: Hero (title + AI search bar), For You carousel, Trending Now + Gaining Popularity rows, Mood Chips + Results Grid, Curated Collections, right-side Filter Sheet.
- Added Discovery-specific CSS in `globals.css` (search bar, mood chips, carousel arrows, filter sheet, collection cards, FAB).
- Removed `comingSoon` flag from Discovery in NavBar.