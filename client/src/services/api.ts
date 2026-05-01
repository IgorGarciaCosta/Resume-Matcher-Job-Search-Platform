const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5266/api";

// ── Auth Types ────────────────────────────────────────────────────────────────

/** Authenticated user profile returned by the backend. */
export interface User {
  id: string;
  email: string;
  fullName: string;
  photoBase64?: string | null;
}

/** Standardized backend response for login/register operations. */
export interface AuthResponse {
  success: boolean;
  message: string;
  user: User | null;
}

// ── Auth API ──────────────────────────────────────────────────────────────────

/** Creates a new account and sets the JWT cookie via credentials: "include". */
export async function register(data: {
  email: string;
  password: string;
  fullName: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Registration failed");
  return json;
}

/** Authenticates with email/password and sets the JWT cookie. */
export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");
  return json;
}

/** Clears the JWT cookie on the server, ending the session. */
export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

/** Fetches the current user from the JWT cookie. Throws if not authenticated. */
export async function getMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

/** Updates the authenticated user's profile (name and/or photo). */
export async function updateProfile(data: {
  fullName?: string;
  photoBase64?: string | null;
}): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update profile");
  }
  return res.json();
}

// ── Job Search Types ──────────────────────────────────────────────────────────

export interface JobSearchResult {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary: string | null;
  postedAt: string | null;
  source: string;
  tags: string[];
  jobType: string | null;
}

export interface JobSearchResponse {
  jobs: JobSearchResult[];
  totalCount: number;
  page: number;
  pageSize: number;
  sources: string[];
  errors: string[];
}

export interface MatchResult {
  score: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  improvementSuggestions: string;
}

export class AiServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiServiceError";
  }
}

export async function searchJobs(params: {
  query?: string;
  location?: string;
  remoteOnly?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<JobSearchResponse> {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set("query", params.query);
  if (params.location) searchParams.set("location", params.location);
  if (params.remoteOnly) searchParams.set("remoteOnly", "true");
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString());

  const res = await fetch(`${API_BASE}/jobsearch/search?${searchParams}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Job search failed: ${res.statusText}`);
  return res.json();
}

export async function analyzeResume(data: {
  resumeFile: File;
  jobUrl?: string;
  jobText?: string;
}): Promise<MatchResult> {
  const formData = new FormData();
  formData.append("ResumeFile", data.resumeFile);
  if (data.jobUrl) formData.append("JobUrl", data.jobUrl);
  if (data.jobText) formData.append("JobText", data.jobText);

  const res = await fetch(`${API_BASE}/matcher/analyze`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    if (res.status === 502) {
      throw new AiServiceError(
        "Our AI service is temporarily unavailable. Please try again in a few moments."
      );
    }
    const text = await res.text();
    throw new Error(text || `Analysis failed: ${res.statusText}`);
  }
  return res.json();
}

// ── Saved Analyses Types ──────────────────────────────────────────────────────

export interface SavedAnalysis {
  id: string;
  resumeFileName: string;
  jobSource: string;
  score: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  improvementSuggestions: string;
  analyzedAt: string;
}

// ── Saved Analyses API ────────────────────────────────────────────────────────

/** Saves a completed analysis for the authenticated user. */
export async function saveAnalysis(data: {
  resumeFileName: string;
  jobSource: string;
  score: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  improvementSuggestions: string;
}): Promise<SavedAnalysis> {
  const res = await fetch(`${API_BASE}/analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to save analysis");
  }
  return res.json();
}

/** Returns all saved analyses for the authenticated user, newest first. */
export async function getSavedAnalyses(): Promise<SavedAnalysis[]> {
  const res = await fetch(`${API_BASE}/analysis`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch saved analyses");
  return res.json();
}

/** Deletes a saved analysis by ID. */
export async function deleteSavedAnalysis(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/analysis/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete analysis");
}
