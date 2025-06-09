"use client";

import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import TruthTable from "../../engine/truthTable";
// import KarnaughMap from "../../engine/karnaughMap";
import { useState, useEffect } from "react";
import { Button } from "@/components/Button/Button";

type PenType = 1 | 0 | -1;

export default function TruthTablePage() {
  const searchParams = useSearchParams();

  const inputs = searchParams.get("inputs") || "2";
  const outputs = searchParams.get("outputs") || "1";

  const numInputs = parseInt(inputs, 10);
  const numOutputs = parseInt(outputs, 10);
  if (isNaN(numInputs) || isNaN(numOutputs)) {
    throw new Error("Invalid number of inputs or outputs");
  }
  if (numInputs < 2 || numInputs > 9) {
    throw new Error("Number of inputs must be between 1 and 9");
  }
  if (numOutputs < 1 || numOutputs > 9) {
    throw new Error("Number of outputs must be between 1 and 9");
  }

  const [truthTable, setTruthTable] = useState<TruthTable | null>(null);
  const [inputArray, setInputArray] = useState<number[][]>([]);
  const [outputArray, setOutputArray] = useState<number[][]>([]);
  const [selectedPen, setSelectedPen] = useState<PenType>(1);

  useEffect(() => {
    const tr = new TruthTable(numInputs, numOutputs);
    setTruthTable(tr);
    setInputArray(tr.getTruthTableInput());
    setOutputArray(tr.getTruthTableOutput());
  }, [numInputs, numOutputs]);

  const handleOutputClick = (rowIndex: number, outputIndex: number) => {
    if (!truthTable) return;

    const newOutputArray = [...outputArray];
    newOutputArray[rowIndex][outputIndex] = selectedPen;
    setOutputArray(newOutputArray);

    truthTable.setOutput(outputIndex, rowIndex, selectedPen);
  };

  const handleFillOutput = (outputIndex: number) => {
    if (!truthTable) return;

    const newOutputArray = outputArray.map((row) => {
      const newRow = [...row];
      newRow[outputIndex] = selectedPen;
      return newRow;
    });
    setOutputArray(newOutputArray);

    for (let rowIndex = 0; rowIndex < inputArray.length; rowIndex++) {
      truthTable.setOutput(outputIndex, rowIndex, selectedPen);
    }
  };

  const renderOutputValue = (value: number) => {
    if (value === -1) return "x";
    return value.toString();
  };

  const getOutputButtonClass = (value: number) => {
    return `${styles.outputButton} ${
      value === 1
        ? styles.outputOne
        : value === 0
        ? styles.outputZero
        : styles.outputX
    }`;
  };

  if (truthTable) {
  }

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Truth Table</h1>
          <div className={styles.penContainer}>
            <Button
              onClick={() => setSelectedPen(1)}
              className={`${styles.penButton} ${
                selectedPen === 1 ? styles.selectedPen : ""
              }`}
            >
              1
            </Button>
            <Button
              onClick={() => setSelectedPen(0)}
              className={`${styles.penButton} ${
                selectedPen === 0 ? styles.selectedPen : ""
              }`}
            >
              0
            </Button>
            <Button
              onClick={() => setSelectedPen(-1)}
              className={`${styles.penButton} ${
                selectedPen === -1 ? styles.selectedPen : ""
              }`}
            >
              x
            </Button>
          </div>
        </div>
        <div className={styles.fillButtonsWrapper}>
          <div className={styles.fillButtons}>
            {Array.from({ length: numOutputs }, (_, i) => (
              <Button
                key={`fill-${i}`}
                onClick={() => handleFillOutput(i)}
                className={styles.fillButton}
              >
                Fill o{i + 1}
              </Button>
            ))}
          </div>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.truthTable}>
            <thead>
              <tr>
                {Array.from({ length: numInputs }, (_, i) => (
                  <th key={`input-${i}`}>i{i + 1}</th>
                ))}
                {Array.from({ length: numOutputs }, (_, i) => (
                  <th key={`output-${i}`}>o{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inputArray.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {row.map((input, inputIndex) => (
                    <td key={`input-${rowIndex}-${inputIndex}`}>{input}</td>
                  ))}
                  {outputArray[rowIndex]?.map((output, outputIndex) => (
                    <td key={`output-${rowIndex}-${outputIndex}`}>
                      <Button
                        onClick={() => handleOutputClick(rowIndex, outputIndex)}
                        className={getOutputButtonClass(output)}
                      >
                        {renderOutputValue(output)}
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>bottons</div>
      <div>kmap not impilments</div>
    </div>
  );
}
