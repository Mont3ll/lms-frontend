# LMS Platform - Frontend

A modern Learning Management System frontend built with Next.js 15, React 19, TypeScript, and TailwindCSS 4.

## Features

- **Role-Based Dashboards**: Separate interfaces for Admins, Instructors, and Learners
- **Course Management**: Create, edit, and manage courses with modules and content items
- **Assessment Engine**: Create quizzes, take assessments, and view results with auto-grading
- **Learning Paths**: Curated learning journeys with progress tracking
- **Personalized Learning**: AI-generated learning paths based on skills and goals
- **Skill Management**: Track learner skills with proficiency levels and gap analysis
- **Remedial Learning**: Generate targeted learning paths from assessment results
- **Certificate Management**: View and download earned certificates
- **Analytics Dashboard**: Customizable dashboards with charts and reports
- **File Management**: Upload and organize files in folders
- **Notifications**: In-app notification system
- **Dark Mode**: Theme toggle with system preference support
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router and Turbopack
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/)
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/) (new-york style)
- **State Management**: [TanStack Query](https://tanstack.com/query) (React Query v5)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Tables**: [TanStack Table](https://tanstack.com/table)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Drag & Drop**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **Date Utilities**: [date-fns](https://date-fns.org/)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/          # Public routes (login, register, etc.)
│   ├── admin/             # Admin dashboard and management
│   │   ├── analytics/     # Analytics dashboards
│   │   ├── courses/       # Course oversight
│   │   ├── settings/      # Platform settings, AI models, prompts
│   │   ├── skills/        # Skill taxonomy management
│   │   ├── tenants/       # Multi-tenant management
│   │   └── users/         # User management
│   ├── instructor/        # Instructor dashboard
│   │   ├── assessments/   # Assessment creation and grading
│   │   ├── courses/       # Course creation and editing
│   │   ├── learning-paths/# Learning path management
│   │   └── reports/       # Instructor reports
│   ├── learner/           # Learner dashboard
│   │   ├── assessments/   # Take assessments, view results
│   │   ├── catalog/       # Browse available courses
│   │   ├── certificates/  # View earned certificates
│   │   ├── courses/       # Enrolled courses and content
│   │   ├── learning-paths/# Learning paths and generation
│   │   └── skills/        # Personal skill tracking
│   └── dashboard/         # Role-based dashboard redirect
├── components/
│   ├── features/          # Feature-specific components
│   │   ├── assessments/   # Assessment-related components
│   │   ├── courses/       # Course-related components
│   │   ├── learning-paths/# Learning path components
│   │   ├── skills/        # Skill tracking components
│   │   └── ...
│   ├── layouts/           # Layout components (Header, Sidebar, etc.)
│   ├── modals/            # Modal dialog components
│   ├── providers/         # React context providers
│   └── ui/                # shadcn/ui base components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   ├── api/               # API client functions
│   ├── api.ts             # Axios instance configuration
│   ├── auth.ts            # Authentication utilities
│   ├── constants.ts       # Query keys and constants
│   ├── types.ts           # TypeScript type definitions
│   ├── utils.ts           # Utility functions
│   └── validators.ts      # Zod validation schemas
└── features/              # Feature modules
```

## Getting Started

### Prerequisites

- Node.js (Version specified in `.nvmrc` or latest LTS recommended)
- npm, yarn, or pnpm

### Installation

1. **Install Dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Environment Variables:**

   Create a `.env.local` file in the `frontend` directory:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   ```

   Ensure the backend server is running and accessible at the specified URL.

3. **Run Development Server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command         | Description                             |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start development server with Turbopack |
| `npm run build` | Create production build                 |
| `npm run start` | Start production server                 |
| `npm run lint`  | Run ESLint                              |

## Code Conventions

### TypeScript

- Use strict mode (enabled in `tsconfig.json`)
- Prefer named exports over default exports
- Use `@/*` path aliases for imports (e.g., `@/components/ui/button`)
- Define props interfaces for components

### Components

- Use function components with TypeScript
- Use `cn()` utility for conditional className merging
- Follow shadcn/ui patterns for consistency

```tsx
import { cn } from "@/lib/utils";

interface MyComponentProps {
  className?: string;
  title: string;
}

export function MyComponent({ className, title }: MyComponentProps) {
  return <div className={cn("base-styles", className)}>{title}</div>;
}
```

### API Integration

Use the `apiClient` from `@/lib/api.ts` for all API calls:

```tsx
import { apiClient } from "@/lib/api";

// GET request
const response = await apiClient.get<Course[]>("/courses/");

// POST request
const newCourse = await apiClient.post<Course>("/courses/", data);

// Error handling
import { getApiErrorMessage } from "@/lib/api";

try {
  await apiClient.post("/courses/", data);
} catch (error) {
  const message = getApiErrorMessage(error);
  toast.error(message);
}
```

### State Management with TanStack Query

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";

// Fetching data
const { data, isLoading } = useQuery({
  queryKey: QUERY_KEYS.COURSES,
  queryFn: fetchCourses,
});

// Mutations with cache invalidation
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: createCourse,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES });
  },
});
```

### Form Handling

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema, CourseFormData } from "@/lib/validators";

const form = useForm<CourseFormData>({
  resolver: zodResolver(courseSchema),
  defaultValues: {
    title: "",
    description: "",
  },
});
```

## Role-Based Access

The application has three main user roles with distinct interfaces:

### Admin (`/admin/*`)

- Manage tenants and users
- Configure platform settings
- Manage AI model configurations and prompt templates
- Manage skill taxonomy
- View platform-wide analytics
- Oversee all courses

### Instructor (`/instructor/*`)

- Create and manage courses
- Build modules and content items
- Create assessments with various question types
- Grade submitted assessments
- View course analytics and reports
- Create learning paths

### Learner (`/learner/*`)

- Browse course catalog
- Enroll in courses
- View course content and progress
- Take assessments
- Track skills and proficiency
- Generate personalized learning paths
- View certificates

## Adding shadcn/ui Components

This project uses shadcn/ui with the "new-york" style. To add new components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

Components are added to `src/components/ui/`.

## Environment Variables

| Variable                   | Description          | Required |
| -------------------------- | -------------------- | -------- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | Yes      |

## Related Documentation

- [Backend README](https://github.com/Mont3ll/lms-backend/README.md) - Backend setup and API documentation
