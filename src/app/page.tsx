"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { Button } from "@/components/Button/Button";

export default function Home() {
  const router = useRouter();
  const [inputs, setInputs] = useState<number>(2);
  const [outputs, setOutputs] = useState<number>(1);

  const handleInputsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      setInputs(2);
      return;
    }
    const valstr = e.target.value.trim();
    const value = parseInt(valstr[valstr.length - 1]);
    if (value > 9 || value < 2) {
      setInputs(2);
    } else {
      setInputs(value);
    }
  };

  const handleOutputsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      setOutputs(1);
      return;
    }
    const valstr = e.target.value.trim();
    const value = parseInt(valstr[valstr.length - 1]);
    if (value > 9 || value < 1) {
      setOutputs(1);
    } else {
      setOutputs(value);
    }
  };

  const handleContinue = () => {
    router.push(`/truthTable?inputs=${inputs}&outputs=${outputs}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Karnaugh Map Solver</h1>
      <div className={styles.configSection}>
        <div className={styles.inputGroup}>
          <label htmlFor="inputs">Number of Inputs:</label>
          <input
            type="number"
            id="inputs"
            min="2"
            max="9"
            value={inputs}
            onChange={handleInputsChange}
            className={styles.input}
          />
          <span className={styles.hint}>(2-9)</span>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="outputs">Number of Outputs:</label>
          <input
            type="number"
            id="outputs"
            min="1"
            max="9"
            value={outputs}
            onChange={handleOutputsChange}
            className={styles.input}
          />
          <span className={styles.hint}>(1-9)</span>
        </div>

        <Button onClick={handleContinue}>
          Continue and Generate Truth Table
        </Button>
      </div>
    </div>
  );
}
