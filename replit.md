# AI Resume Builder & ATS Optimizer

## Overview

An AI-powered resume builder and Applicant Tracking System (ATS) optimizer that helps users create resumes tailored to specific job descriptions. The application analyzes job postings, extracts key requirements, and provides real-time ATS compatibility scoring. Users can build resumes through an interactive editor and export them in PDF or DOCX formats.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool

**UI Component Library**: Radix UI primitives with shadcn/ui components styled using the "new-york" preset

**Styling Strategy**: 
- Tailwind CSS for utility-first styling
- Custom CSS variables for theming (light/dark mode support)
- Material Design principles combined with productivity tool aesthetics (Notion/Linear inspired)
- Typography using Inter font family for general content and JetBrains Mono for technical data

**State Management**:
- React Query (@tanstack/react-query) for server state management with infinite stale time
- Local React state for UI interactions
- Custom hooks for reusable stateful logic (theme, mobile detection, toast notifications)

**Routing**: Wouter for lightweight client-side routing

**Form Handling**: React Hook Form with Zod resolvers for type-safe validation

**Design System**:
- Spacing primitives: Tailwind units (2, 4, 6, 8, 12, 16)
- Border radius: Custom values (9px, 6px, 3px)
- Hover/active states: Elevation system using CSS variables
- Responsive: Mobile-first with collapsible sections

### Backend Architecture

**Runtime**: Node.js with Express.js server

**Language**: TypeScript with ES modules

**API Design**: RESTful JSON API with the following key endpoints:
- POST `/api/analyze` - Analyzes resume against job description, extracts keywords, calculates ATS score
- POST `/api/optimize` - Generates AI-optimized resume suggestions
- POST `/api/export` - Generates PDF or DOCX resume files

**Validation**: Zod schemas shared between client and server for type safety

**Error Handling**: Centralized error handling with appropriate HTTP status codes and JSON error responses

**Development Experience**:
- Hot Module Replacement (HMR) via Vite in development
- Request/response logging middleware
- Runtime error overlay for debugging

### Data Storage

**Database**: PostgreSQL via Neon serverless driver

**ORM**: Drizzle ORM for type-safe database interactions

**Schema Management**: 
- Schema definitions in `shared/schema.ts` using Zod
- Database migrations managed through Drizzle Kit
- Shared types between database layer and application layer

**Current Implementation**: In-memory storage fallback (`MemStorage` class) for development, with interfaces designed for easy PostgreSQL integration

**Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)

### External Dependencies

**AI Service**: OpenAI API (GPT-5 model)
- Keyword extraction from job descriptions
- Resume optimization suggestions
- ATS score calculation
- Structured JSON responses using OpenAI's function calling

**Document Generation**:
- **jsPDF**: PDF generation with custom formatting
- **docx**: Microsoft Word (.docx) file generation with proper styling

**UI Component Dependencies**:
- Radix UI ecosystem for accessible, unstyled primitives
- cmdk for command palette functionality
- lucide-react for icon system
- date-fns for date manipulation
- class-variance-authority and clsx for conditional styling

**Development Tools**:
- TypeScript for type safety across the stack
- Replit-specific plugins for development (cartographer, dev banner, runtime error modal)
- PostCSS with Tailwind and Autoprefixer

### Key Architectural Decisions

**Monorepo Structure**:
- `/client` - React frontend application
- `/server` - Express backend
- `/shared` - Shared TypeScript types and schemas
- Single package.json for simplified dependency management

**Type Safety Strategy**:
- End-to-end type safety using TypeScript
- Shared Zod schemas ensure runtime validation matches TypeScript types
- API request/response types derived from shared schemas

**Build and Deployment**:
- Client: Vite builds to `dist/public`
- Server: esbuild bundles to `dist/index.js`
- Single production command serves both static files and API

**API Communication**:
- Centralized `apiRequest` helper in `lib/queryClient.ts`
- Automatic error handling and JSON parsing
- Credentials included for session-based auth

**Theme System**:
- CSS custom properties for all colors
- System preference detection with manual override
- Persistent theme selection via localStorage
- Programmatic theme switching through context provider

**Resume Data Model**:
- Structured sections: Personal Info, Summary, Experience, Education, Skills
- Unique IDs for array items to support editing
- Optional fields to accommodate various resume formats
- Export format agnostic (same data model for PDF and DOCX)