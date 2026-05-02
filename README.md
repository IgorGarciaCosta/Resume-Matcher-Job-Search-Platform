# Resume Matcher — AI-Powered Job Search Platform

An intelligent full-stack application that aggregates remote job listings from **7+ job boards** and uses **Google Gemini AI** to analyze how well your resume matches any job description. Features user authentication, saved analysis history, and a 3D interactive globe on the landing page.

![.NET 9](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

## Features

### Job Search

- Search across **7 job boards simultaneously** — Remotive, Arbeitnow, Jobicy, Himalayas, JSearch, Adzuna, and The Muse
- Results are **deduplicated** by title + company across all sources
- Filter by **keyword**, **location**, and **remote-only** positions
- Displays salary, job type, tags, and work mode (Remote / Hybrid / On-site)
- Graceful handling of provider failures — working sources still return results

### Resume Analyzer

- Upload a **PDF resume** and provide a job description (via URL or pasted text)
- AI returns a **match score (0–100)** with color-coded feedback
- Lists **matching keywords** found in both resume and job
- Highlights **missing keywords** you should add
- Provides **improvement suggestions** to boost your match

### Authentication & User System

- Email/password registration and login with **ASP.NET Identity**
- Session management via **HttpOnly JWT cookies** (secure, no localStorage tokens)
- User profile with photo upload support
- Protected routes on frontend with auth context

### Saved Analyses

- Save resume analysis results to your account
- View full history of past analyses (score, keywords, suggestions)
- Data persisted per user in PostgreSQL

## Tech Stack

| Layer            | Technology                                |
| ---------------- | ----------------------------------------- |
| **Backend**      | ASP.NET Core 9, C#                        |
| **Frontend**     | React 19, TypeScript 6, Vite 8            |
| **Database**     | PostgreSQL + Entity Framework Core 9      |
| **Auth**         | ASP.NET Identity + JWT (HttpOnly cookies) |
| **AI**           | Google Gemini (`gemini-2.5-flash`)        |
| **PDF Parsing**  | PdfPig                                    |
| **Web Scraping** | HtmlAgilityPack                           |
| **Styling**      | CSS Modules + Lucide React icons          |
| **Animations**   | Framer Motion                             |
| **3D**           | Three.js + react-globe.gl                 |
| **Deployment**   | Docker (Render) + Vercel (frontend)       |

## Project Structure

```
├── Application/
│   ├── DTOs/                        # Data Transfer Objects (inc. Auth/)
│   ├── Interfaces/                  # Service contracts
│   └── Services/                    # Business logic (JobSearchService, MatcherService, AuthService)
├── Controllers/
│   ├── AuthController.cs            # POST /api/auth/register, login, logout; GET /api/auth/me
│   ├── AnalysisController.cs        # POST/GET /api/analysis (saved analyses)
│   ├── JobSearchController.cs       # GET  /api/jobsearch/search
│   └── MatcherController.cs         # POST /api/matcher/analyze
├── Domain/
│   ├── Entities/                    # ApplicationUser, Resume, JobDescription, SavedAnalysis
│   └── Enums/
├── Infrastructure/
│   ├── Data/                        # EF Core DbContext (PostgreSQL)
│   └── Services/                    # Job providers, Gemini AI analyzer, PDF extractor, scraper
├── Migrations/                      # EF Core migrations (PostgreSQL)
├── client/                          # React frontend (deployed to Vercel)
│   └── src/
│       ├── components/              # JobSearch, JobCard, ResumeAnalyzer, GlobeView, ProfileDrawer
│       ├── contexts/                # AuthContext (JWT session state)
│       ├── pages/                   # Home, JobSearch, ResumeAnalyzer, SavedAnalyses, Login, Signup
│       └── services/               # API client
├── Dockerfile                       # Multi-stage Docker build for Render
├── Program.cs                       # App entry point & DI configuration
└── appsettings.json                 # Configuration
```

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (local or hosted)
- A **Google Gemini API key** (for resume analysis)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Resume-Matcher-Job-Search-Platform.git
cd Resume-Matcher-Job-Search-Platform
```

### 2. Configure environment

Add your settings to `appsettings.json` (or use [User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets)):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=resumematcher;Username=postgres;Password=your-password"
  },
  "Gemini": {
    "ApiKey": "your-gemini-api-key-here",
    "Model": "gemini-2.5-flash"
  },
  "Jwt": {
    "Key": "your-secret-key-at-least-32-characters",
    "Issuer": "ResumeMatcher",
    "Audience": "ResumeMatcher"
  }
}
```

### 3. Run the backend

```bash
dotnet restore
dotnet run
```

The API starts at **http://localhost:5266**. Swagger UI is available at the root in development mode. Migrations are applied automatically on startup.

### 4. Run the frontend

```bash
cd client
npm install
npm run dev
```

The frontend starts at **http://localhost:5173**.

## Deployment

| Service  | Platform | Notes                                              |
| -------- | -------- | -------------------------------------------------- |
| Backend  | Render   | Docker deploy, `DATABASE_URL` env var for Postgres |
| Frontend | Vercel   | SPA with catch-all rewrite to `index.html`         |

The backend auto-detects `DATABASE_URL` (Render format) and converts it to a Npgsql connection string.

## API Endpoints

### Authentication

```
POST /api/auth/register    # Create account (sets HttpOnly JWT cookie)
POST /api/auth/login       # Login (sets HttpOnly JWT cookie)
POST /api/auth/logout      # Clear session cookie
GET  /api/auth/me          # Get current user profile (requires auth)
```

### Job Search

```
GET /api/jobsearch/search
```

| Parameter    | Type   | Default | Description                |
| ------------ | ------ | ------- | -------------------------- |
| `query`      | string | —       | Job title or keyword       |
| `location`   | string | —       | Location filter            |
| `remoteOnly` | bool   | `false` | Show only remote positions |
| `page`       | int    | `1`     | Page number                |
| `pageSize`   | int    | `20`    | Results per page (max 100) |

### Resume Analysis

```
POST /api/matcher/analyze
Content-Type: multipart/form-data
```

| Field        | Type   | Required | Description                         |
| ------------ | ------ | -------- | ----------------------------------- |
| `ResumeFile` | file   | Yes      | PDF resume file                     |
| `JobUrl`     | string | No       | URL to a job posting (auto-scraped) |
| `JobText`    | string | No       | Raw job description text            |

**Response:**

```json
{
  "score": 72,
  "matchingKeywords": ["React", "TypeScript", "REST APIs"],
  "missingKeywords": ["Kubernetes", "AWS"],
  "improvementSuggestions": "Consider adding cloud experience..."
}
```

### Saved Analyses (requires auth)

```
POST /api/analysis          # Save an analysis result
GET  /api/analysis          # List all saved analyses for current user
GET  /api/analysis/{id}     # Get a specific saved analysis
DELETE /api/analysis/{id}   # Delete a saved analysis
```

## Job Search Providers

| Provider  | Website       |
| --------- | ------------- |
| Remotive  | remotive.com  |
| Arbeitnow | arbeitnow.com |
| Jobicy    | jobicy.com    |
| Himalayas | himalayas.app |
| JSearch   | jsearch.io    |
| Adzuna    | adzuna.com    |
| The Muse  | themuse.com   |

## License

This project is for educational and personal use.
