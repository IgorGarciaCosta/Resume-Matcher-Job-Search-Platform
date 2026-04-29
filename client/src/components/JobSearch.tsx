import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  MapPin,
  Wifi,
  Loader2,
  Briefcase,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
} from "lucide-react";
import { searchJobs, type JobSearchResult } from "../services/api";
import { resolveCountry, type CountryCoord } from "../data/countryCoordinates";
import JobCard from "./JobCard";
import GlobeView from "./GlobeView";
import LoadingAnimation from "./LoadingAnimation";
import SearchingCharacter from "./SearchingCharacter";
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
  const [selectedCountry, setSelectedCountry] = useState<CountryCoord | null>(
    null,
  );
  const [selectedJobIndex, setSelectedJobIndex] = useState<number | null>(null);
  const [globeFilterIso, setGlobeFilterIso] = useState<string | null>(null);
  const [globeFilterName, setGlobeFilterName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const jobsRef = useRef(jobs);
  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);
  const filtersRef = useRef<HTMLDivElement>(null);

  const handleJobSelect = (job: JobSearchResult, index: number) => {
    const country = resolveCountry(job.location);
    setSelectedCountry(country);
    setSelectedJobIndex(index);
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setToastKey((k) => k + 1);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const handleGlobeCountryClick = useCallback(
    (iso: string, name: string) => {
      // Clear any job-based selection so globe click takes priority
      setSelectedCountry(null);
      setSelectedJobIndex(null);

      const matching = jobsRef.current.filter(
        (job) => resolveCountry(job.location)?.iso === iso,
      );
      if (matching.length === 0) {
        showToast(`No jobs found in ${name}`);
        setGlobeFilterIso(null);
        setGlobeFilterName("");
        return;
      } else {
        setGlobeFilterIso(iso);
        setGlobeFilterName(name);
        setCurrentPage(1);
      }
    },
    [showToast],
  );

  const clearGlobeFilter = () => {
    setGlobeFilterIso(null);
    setGlobeFilterName("");
    setCurrentPage(1);
    setSelectedJobIndex(null);
    setSelectedCountry(null);
  };

  const handleGlobeBackgroundClick = useCallback(() => {
    setSelectedCountry(null);
    setSelectedJobIndex(null);
  }, []);

  const JOBS_PER_PAGE = 5;

  const filteredJobs = globeFilterIso
    ? jobs.filter((job) => resolveCountry(job.location)?.iso === globeFilterIso)
    : jobs;

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
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
    <div className={styles.splitLayout}>
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
            <span>
              {globeFilterIso
                ? `${filteredJobs.length} of ${totalCount} results in ${globeFilterName}`
                : `${totalCount} results found`}
            </span>
            {sources.length > 0 && !globeFilterIso && (
              <span className={styles.sources}>
                Sources: {sources.join(", ")}
              </span>
            )}
          </div>
        )}

        {globeFilterIso && (
          <button className={styles.filterBadge} onClick={clearGlobeFilter}>
            <Globe size={13} />
            {globeFilterName}
            <X size={13} />
          </button>
        )}

        {loading && (
          <LoadingAnimation message="Searching job boards">
            <SearchingCharacter />
          </LoadingAnimation>
        )}

        <div className={styles.results}>
          {paginatedJobs.map((job, i) => {
            const globalIndex = (currentPage - 1) * JOBS_PER_PAGE + i;
            return (
              <JobCard
                key={globalIndex}
                job={job}
                selected={selectedJobIndex === globalIndex}
                onSelect={() => handleJobSelect(job, globalIndex)}
              />
            );
          })}
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

      <aside className={styles.globePanel}>
        <GlobeView
          selectedCountry={selectedCountry}
          globeFilterIso={globeFilterIso}
          onCountryClick={handleGlobeCountryClick}
          onBackgroundClick={handleGlobeBackgroundClick}
        />
      </aside>

      {toast && (
        <div key={toastKey} className={styles.toast}>
          {toast}
        </div>
      )}
    </div>
  );
}
