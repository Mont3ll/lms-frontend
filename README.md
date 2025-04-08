# LMS Platform - Frontend

This directory contains the frontend application for the LMS Platform, built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Prerequisites

- Node.js (Version specified in `.nvmrc` or latest LTS recommended)
- npm or yarn or pnpm

## Getting Started

1.  **Install Dependencies:**
    Navigate to the `frontend` directory and run:

    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

2.  **Environment Variables:**
    Create a `.env.local` file in the `frontend` directory by copying `.env.example` (if provided) or creating it from scratch. Add the necessary environment variables:

    ````env
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
    # Add other variables as needed
    ```    Ensure the backend server is running and accessible at the specified `NEXT_PUBLIC_API_BASE_URL`.

    ````

3.  **Run the Development Server:**
    ````bash
    npm run dev
    # or
    # yarn dev
    # or
    # pnpm dev
    ```    Open [http://localhost:3000](http://localhost:3000) (or the specified port) in your browser to see the application.
    ````

## Building for Production

```bash
npm run build
```
