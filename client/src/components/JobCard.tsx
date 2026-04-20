import {
  ExternalLink,
  Building2,
  MapPin,
  Tag,
  Wifi,
  Building,
  Shuffle,
} from "lucide-react";
import type { JobSearchResult } from "../services/api";
import styles from "./JobCard.module.css";

function getWorkMode(job: JobSearchResult) {
  const text =
    `${job.title} ${job.location} ${job.description} ${job.tags.join(" ")}`.toLowerCase();
  if (text.includes("hybrid"))
    return { label: "Hybrid", icon: Shuffle, className: styles.workModeHybrid };
  if (
    text.includes("remote") ||
    text.includes("anywhere") ||
    text.includes("work from home")
  )
    return { label: "Remote", icon: Wifi, className: styles.workModeRemote };
  if (
    text.includes("on-site") ||
    text.includes("onsite") ||
    text.includes("in-office")
  )
    return {
      label: "On-site",
      icon: Building,
      className: styles.workModeOnsite,
    };
  return null;
}

interface JobCardProps {
  job: JobSearchResult;
}

export default function JobCard({ job }: JobCardProps) {
  const workMode = getWorkMode(job);
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
        {workMode && (
          <span className={`${styles.workMode} ${workMode.className}`}>
            <workMode.icon size={12} /> {workMode.label}
          </span>
        )}
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
