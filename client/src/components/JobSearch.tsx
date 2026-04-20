import { useState } from "react";
import { Search, MapPin, Wifi, Loader2, Briefcase } from "lucide-react";
import { searchJobs, type JobSearchResult } from "../services/api";
import JobCard from "./JobCard";
import styles from "./JobSearch.module.css";

export default function JobSearch() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobSearchResult[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);
    setJobs([]);
    setSources([]);
    setTotalCount(0);
    try {
      const res = await searchJobs({ query, location, remoteOnly });
      setJobs(res.jobs);
      setSources(res.sources);
      setTotalCount(res.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Briefcase size={22} className={styles.headerIcon} />
        <h2>Job Search</h2>
      </div>
      <p className={styles.subtitle}>
        Search across multiple job boards simultaneously
      </p>

      <form onSubmit={handleSearch} className={styles.form}>
        <div className={styles.inputGroup}>
          <Search size={16} className={styles.inputIcon} />
          <input
            type="text"
            placeholder="Job title or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <MapPin size={16} className={styles.inputIcon} />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={styles.input}
          />
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
          />
          <Wifi size={14} />
          <span>Remote only</span>
        </label>
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? (
            <Loader2 size={16} className={styles.spin} />
          ) : (
            <Search size={16} />
          )}
          Search
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {searched && !loading && !error && (
        <div className={styles.meta}>
          <span>{totalCount} results found</span>
          {sources.length > 0 && (
            <span className={styles.sources}>
              Sources: {sources.join(", ")}
            </span>
          )}
        </div>
      )}

      {loading && (
        <div className={styles.loadingState}>
          <Loader2 size={28} className={styles.spin} />
          <span>Searching job boards...</span>
        </div>
      )}

      <div className={styles.results}>
        {jobs.map((job, i) => (
          <JobCard key={i} job={job} />
        ))}
      </div>
    </section>
  );
}
