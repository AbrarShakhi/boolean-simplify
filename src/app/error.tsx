'use client';

import { useEffect } from 'react';
import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Something went wrong!</h2>
      <p className={styles.message}>{error.message}</p>
      <button
        className={styles.button}
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
} 