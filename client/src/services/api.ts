const API_BASE = "http://localhost:5266/api";

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

  const res = await fetch(`${API_BASE}/jobsearch/search?${searchParams}`);
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
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Analysis failed: ${res.statusText}`);
  }
  return res.json();
}
