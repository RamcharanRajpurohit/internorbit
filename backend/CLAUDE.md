# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the backend API for InternMatch, an internship matching platform. The project uses a dual-database architecture:

- **Supabase**: Handles authentication and user management via JWT tokens
- **MongoDB (via Mongoose)**: Stores application data including internships, profiles, applications, and interactions

## Available Commands

### Development
- `npm run dev` - Start development server with ts-node
- `npm run nodemon` - Start with auto-reload using nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run compiled JavaScript from dist/

### TypeScript
- `npm run ts-node` - Execute TypeScript files directly

## Architecture

### Key Components

**Entry Point**: `index.ts`
- Express server setup
- Middleware configuration (CORS, JSON parsing, logging)
- Route mounting
- Error handling
- Health check endpoint at `/health`

**Authentication Flow**:
1. Users authenticate via Supabase (frontend handles OAuth)
2. Frontend receives JWT token from Supabase
3. API calls include Bearer token in Authorization header
4. Backend verifies token with Supabase via `middleware/auth.ts`
5. User context attached to request as `req.user`

**Database Architecture**:
- `config/database.ts` - MongoDB connection via Mongoose
- `config/supabase.ts` - Supabase client configuration
- Dual ID system: Supabase user IDs for auth, MongoDB ObjectIds for data relationships

### Route Structure

All routes are prefixed with `/api/` and require authentication via `verifyToken` middleware:

- `/api/auth` - User profile management (get/update current user, initialize profile)
- `/api/internships` - Internship CRUD operations
- `/api/applications` - Internship applications management
- `/api/interactions` - User interactions (swipes, saves)
- `/api/company-profile` - Company profile management
- `/api/student-profile` - Student profile management
- `/api/resume` - Resume upload and management

### Data Models

Key models are defined in the `models/` directory:

- `internships.ts` - Internship listings with company relationships
- `company-profile.ts` - Company information
- `student.ts` - Student profiles
- `applications.ts` - Internship applications
- `resume*.ts` - Resume management and access tracking
- `swipe.ts` & `saved.ts` - User interaction patterns

### Environment Variables

Required environment variables:
- `DATABASE_URL` - MongoDB connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key (for backend operations)
- `FRONTEND_URL` - CORS allowed origin
- `PORT` - Server port (defaults to 5000)

## Development Notes

### Authentication Pattern
- All protected routes use the `verifyToken` middleware from `middleware/auth.ts`
- The middleware extracts Bearer tokens and validates with Supabase
- User information is attached to `req.user` for downstream handlers
- Use `AuthRequest` interface for typed request handlers

### Database Relationships
- Models use Mongoose's `ref` property for relationships
- Company profiles reference MongoDB ObjectIds
- User-facing IDs typically come from Supabase auth system

### Error Handling
- Global error handler in `index.ts` catches and formats errors
- Authentication errors return 401 status
- Validation errors should return 400 with descriptive messages

### File Upload
- Resume handling appears to have dedicated models for access tracking and sharing
- Check routes/resume.ts for upload endpoints and middleware