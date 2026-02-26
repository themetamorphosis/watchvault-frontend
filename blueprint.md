# Project Blueprint

## Overview
This blueprint tracks the ongoing development of the application. The current goal is to refine the UI/UX by implementing a professional, industry-grade button overhaul across all Media Library components. This involves replacing hidden interaction menus (e.g. kebab menus) with sleek, single-click glassmorphic action buttons for increased accessibility and an Apple/Linear aesthetic.

## Current State & Existing Features
The application is a Next.js project using App Router, with integration for Firebase Studio, Prisma for database access, and other configurations.
The media library uses `LibraryPage`, `MediaCard`, and `ExpandableCardOverlay` to view, search, and manage a user's movie, tv, and anime catalog.

## Current Task: Redesign Media Library Buttons
1. Refactor `MediaCard.tsx` to remove the dropdown menu, replacing it with an elegant hover-revealed action strip (Favorite, Edit, Delete).
2. Refactor `ExpandableCardOverlay.tsx` to replace its dropdown menu with an always-visible top-right action strip (Edit, Delete, Close).
3. Refactor `LibraryPage.tsx` top toolbar buttons to have a unified layout, consistent padding, and premium glassmorphism styling.
4. Verify styles and clean up unused states in these components.