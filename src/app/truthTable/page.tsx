'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import styles from './page.module.css';

export default function TruthTable() {
  const searchParams = useSearchParams();

  const inputs = searchParams.get('inputs') || '2';
  const outputs = searchParams.get('outputs') || '1';

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Truth Table</h1>
      <div className={styles.tableContainer}>
        {/* Truth table will be implemented here */}
        <p>Number of inputs: {inputs}</p>
        <p>Number of outputs: {outputs}</p>
      </div>
    </div>
  );
}
