import { useState, useRef, useEffect } from "react";
import {
  Search,
  MapPin,
  Wifi,
  Loader2,
  Briefcase,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const filtersRef = useRef<HTMLDivElement>(null);

  const JOBS_PER_PAGE = 5;
  const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
  const paginatedJobs = jobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE,
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filtersRef.current &&
        !filtersRef.current.contains(e.target as Node)
      ) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);
    setJobs([]);
    setSources([]);
    setTotalCount(0);
    setCurrentPage(1);
    try {
      const res = await searchJobs({
        query,
        location,
        remoteOnly,
        pageSize: 200,
      });
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
        <div className={styles.filtersWrapper} ref={filtersRef}>
          <button
            type="button"
            className={styles.filtersButton}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
          {filtersOpen && (
            <div className={styles.filtersDropdown}>
              <div className={styles.filterField}>
                <label className={styles.filterLabel}>
                  <MapPin size={14} />
                  Location
                </label>
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
              </div>
              <div className={styles.filterField}>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                  />
                  <Wifi size={14} />
                  <span>Remote only</span>
                </label>
              </div>
            </div>
          )}
        </div>
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
        {paginatedJobs.map((job, i) => (
          <JobCard key={i} job={job} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className={styles.pageInfo}>
            {currentPage} / {totalPages}
          </span>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
