import type { ReactNode } from "react";
import styles from "./LoadingAnimation.module.css";

interface LoadingAnimationProps {
  children: ReactNode;
  message: string;
}

export default function LoadingAnimation({
  children,
  message,
}: LoadingAnimationProps) {
  return (
    <div className={styles.container}>
      <div className={styles.animationWrapper}>{children}</div>
      <span className={styles.message}>
        {message}
        <span className={styles.dots} />
      </span>
    </div>
  );
}
