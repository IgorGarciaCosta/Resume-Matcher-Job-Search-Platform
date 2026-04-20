# Resume Matcher — AI-Powered Job Search Platform

An intelligent full-stack application that aggregates remote job listings from **7+ job boards** and uses **Google Gemini AI** to analyze how well your resume matches any job description.

![.NET 9](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite)

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

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | ASP.NET Core 9, C# |
| **Frontend** | React 19, TypeScript 6, Vite 8 |
| **Database** | SQLite + Entity Framework Core 9 |
| **AI** | Google Gemini (`gemini-2.5-flash`) |
| **PDF Parsing** | PdfPig |
| **Web Scraping** | HtmlAgilityPack |
| **Styling** | CSS Modules + Lucide React icons |

## Project Structure

```
├── Application/
│   ├── DTOs/                        # Data Transfer Objects
│   ├── Interfaces/                  # Service contracts
│   └── Services/                    # Business logic (JobSearchService, MatcherService)
├── Controllers/
│   ├── JobSearchController.cs       # GET  /api/jobsearch/search
│   └── MatcherController.cs         # POST /api/matcher/analyze
├── Domain/
│   ├── Entities/                    # Resume, JobDescription, JobApplication
│   └── Enums/
├── Infrastructure/
│   ├── Data/                        # EF Core DbContext (SQLite)
│   └── Services/                    # Job providers, AI analyzer, PDF extractor, scraper
├── client/                          # React frontend
│   └── src/
│       ├── components/              # JobSearch, JobCard, ResumeAnalyzer
│       └── services/api.ts          # API client
├── Program.cs                       # App entry point & DI configuration
└── appsettings.json                 # Configuration
```

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) (v18+)
- A **Google Gemini API key** (for resume analysis)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Resume-Matcher-Job-Search-Platform.git
cd Resume-Matcher-Job-Search-Platform
```

### 2. Configure the API key

Add your Gemini API key to `appsettings.json` (or use [User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets)):

```json
{
  "Gemini": {
    "ApiKey": "your-gemini-api-key-here",
    "Model": "gemini-2.5-flash"
  }
}
```

### 3. Run the backend

```bash
dotnet restore
dotnet run
```

The API starts at **http://localhost:5266**. Swagger UI is available at the root in development mode.

### 4. Run the frontend

```bash
cd client
npm install
npm run dev
```

The frontend starts at **http://localhost:5173**.

## API Endpoints

### Job Search

```
GET /api/jobsearch/search
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | — | Job title or keyword |
| `location` | string | — | Location filter |
| `remoteOnly` | bool | `false` | Show only remote positions |
| `page` | int | `1` | Page number |
| `pageSize` | int | `20` | Results per page (max 100) |

### Resume Analysis

```
POST /api/matcher/analyze
Content-Type: multipart/form-data
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ResumeFile` | file | Yes | PDF resume file |
| `JobUrl` | string | No | URL to a job posting (auto-scraped) |
| `JobText` | string | No | Raw job description text |

**Response:**

```json
{
  "score": 72,
  "matchingKeywords": ["React", "TypeScript", "REST APIs"],
  "missingKeywords": ["Kubernetes", "AWS"],
  "improvementSuggestions": "Consider adding cloud experience..."
}
```

## Job Search Providers

| Provider | Website |
|----------|---------|
| Remotive | remotive.com |
| Arbeitnow | arbeitnow.com |
| Jobicy | jobicy.com |
| Himalayas | himalayas.app |
| JSearch | jsearch.io |
| Adzuna | adzuna.com |
| The Muse | themuse.com |

## License

This project is for educational and personal use.
