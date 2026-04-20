import { ExternalLink, Building2, MapPin, Tag } from "lucide-react";
import type { JobSearchResult } from "../services/api";
import styles from "./JobCard.module.css";

interface JobCardProps {
  job: JobSearchResult;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.jobTitle}>{job.title}</h3>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      <div className={styles.jobMeta}>
        <span>
          <Building2 size={13} /> {job.company}
        </span>
        <span>
          <MapPin size={13} /> {job.location}
        </span>
        {job.salary && <span className={styles.salary}>{job.salary}</span>}
        {job.jobType && <span className={styles.jobType}>{job.jobType}</span>}
        <span className={styles.source}>{job.source}</span>
      </div>
      <p className={styles.description}>
        {job.description.length > 200
          ? job.description.slice(0, 200) + "..."
          : job.description}
      </p>
      {job.tags.length > 0 && (
        <div className={styles.tags}>
          <Tag size={12} />
          {job.tags.slice(0, 5).map((tag, j) => (
            <span key={j} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
