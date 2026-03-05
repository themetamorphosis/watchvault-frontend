# Watch Vault Frontend

[![Deployment Status](https://img.shields.io/badge/Deployment-Live-success?style=for-the-badge)](https://watchvault.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

The frontend client for Watch Vault, a comprehensive tracking and discovery platform for movies and television series. Built with the Next.js App Router, it delivers a highly performant, responsive, and visually engaging user interface.

## 🚀 Status

**This application is actively deployed and live in production.** 

## 🏗️ Architecture & Tech Stack

This repository encompasses the client-side architecture of the Watch Vault platform.

*   **Core Framework:** [Next.js](https://nextjs.org/) utilizing the App Router architecture for server-side rendering (SSR), static site generation (SSG), and optimized routing.
*   **Language:** [TypeScript](https://www.typescriptlang.org/) for static type checking, enhanced developer experience, and maintainability.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) functioning as the primary utility-first CSS framework for rapid and consistent UI development.
*   **Containerization:** Configured for Docker (`Dockerfile`, `docker-compose.yml`) to ensure consistent environments across local development and production deployments.
*   **Data Fetching & State:** [Zustand] / React Context (depending on implementation specifics) for client-side state, alongside native Next.js server actions and fetching strategies.

## 📁 Repository Structure

```text
watchvault-frontend/
├── app/               # Next.js App Router (Routes, Layouts, Loading UI, APIs)
│   ├── (app)/         # Authenticated application routes (Library, Discovery, etc.)
│   ├── login/         # Authentication flows
│   └── globals.css    # Global stylesheet imports and Tailwind directives
├── components/        # Reusable UI components and specific feature modules
├── lib/               # Utility functions, type definitions, and shared helpers
├── public/            # Static assets (images, fonts, icons)
├── Dockerfile         # Docker image configuration for the frontend service
└── tailwind.config.ts # Tailwind CSS theme and plugin configuration
```

## 💻 Local Development Setup

Prerequisites:
*   Node.js (v18.x or higher recommended)
*   npm, yarn, pnpm, or bun

1.  **Clone the repository and install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

2.  **Environment Configuration:**
    Ensure you have the required environment variables populated. Check for a `.env.example` file or consult internal documentation for the expected development variables (e.g., backend API URLs, authentication keys).

3.  **Start the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

4.  **Access the application:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your development browser.

## 🛠️ Scripts

*   `npm run dev`: Starts the Next.js development server with Hot Module Replacement (HMR).
*   `npm run build`: Creates an optimized production build of the application.
*   `npm run start`: Starts a Node.js server to serve the production build (requires `npm run build` first).
*   `npm run lint`: Executes ESLint to verify code quality and adherence to style guidelines.

## 🤝 Contributing

(Add contribution guidelines, PR conventions, and coding standards here if applicable for internal or external developers).

