import TruthTable from "@/engine/truthTable";
import { HashSet } from "js-sdsl";

type GrayCode = {
  binary: string;
  decimal: number;
};

type Cell = {
  row: number;
  col: number;
};

export default class KarnaughMap {
  private truth_table: TruthTable;

  private row_gray_code: GrayCode[];
  private col_gray_code: GrayCode[];
  private kmap_table: number[][];

  constructor(truth_table: TruthTable) {
    this.truth_table = truth_table;
    let num_of_km_rows = 0;
    let num_of_km_cols = 0;
    if (this.truth_table.getNumOfInput() % 2 === 0) {
      num_of_km_rows = num_of_km_cols = this.truth_table.getNumOfInput() / 2;
    } else {
      num_of_km_rows = Math.floor(this.truth_table.getNumOfInput() / 2);
      num_of_km_cols = Math.ceil(this.truth_table.getNumOfInput() / 2);
    }

    // TODO: If input pins is 1 it fails to generate.
    this.row_gray_code = this.generateGrayCode(num_of_km_rows);
    this.col_gray_code = this.generateGrayCode(num_of_km_cols);

    this.kmap_table = Array.from({ length: this.row_gray_code.length }, () =>
      Array(this.col_gray_code.length).fill("0")
    );
  }

  private generateGrayCode(num_of_variables: number): GrayCode[] {
    if (num_of_variables <= 0) {
      return [];
    }
    const gray_code: GrayCode[] = [
      { binary: "0", decimal: 0 },
      { binary: "1", decimal: 1 },
    ];

    for (let v = 2; v <= num_of_variables; v++) {
      const power_half = 2 ** v / 2;

      const copy: GrayCode[] = [];
      for (let i = 0; i < gray_code.length; i++) {
        copy.push(gray_code[i]);
      }
      for (let i = gray_code.length - 1; i >= 0; i--) {
        copy.push(gray_code[i]);
      }

      for (let i = 0; i < power_half; i++) {
        gray_code[i] = {
          binary: "0" + copy[i].binary,
          decimal: copy[i].decimal,
        };
      }
      for (let i = power_half; i < 2 * power_half; i++) {
        const temp = {
          binary: "1" + copy[i].binary,
          decimal: copy[i].decimal + power_half,
        };
        gray_code.push(temp);
      }
    }

    return gray_code;
  }

  public decimal_to_binary(decimal: number): string {
    if (decimal < 0) {
      throw new Error("Decimal value must be non-negative.");
    }
    let binary = "";
    do {
      binary = (decimal % 2) + binary;
      decimal = Math.floor(decimal / 2);
    } while (decimal > 0);
    return binary;
  }

  public binary_to_decimal(binary: string): number {
    if (!/^[01]+$/.test(binary)) {
      throw new Error("Binary value must consist of only 0s and 1s.");
    }
    let decimal = 0;
    for (let i = 0; i < binary.length; i++) {
      decimal = decimal * 2 + (binary[i] === "1" ? 1 : 0);
    }
    return decimal;
  }

  private generateGrayCodeOptimal(num_of_variables: number): GrayCode[] {
    const gray_code: GrayCode[] = [];
    for (let i = 0; i < 2 ** num_of_variables; i++) {
      const code = i ^ (i >> 1);
      gray_code.push({
        binary: this.decimal_to_binary(code),
        decimal: code,
      });
    }
    return gray_code;
  }

  public applyOutputToKmap(output_pin_index: number) {
    if (
      output_pin_index < 0 ||
      output_pin_index >= this.truth_table.getNumOfOutput()
    ) {
      throw new Error(
        "'output pin index' must be greater than -1 and less than 'number of outputs'"
      );
    }

    const tr_output = this.truth_table.getTruthTableOutput();
    const output_values = [];
    for (let i = 0; i < tr_output.length; i++) {
      output_values.push(tr_output[i][output_pin_index]);
    }

    for (let i = 0; i < this.row_gray_code.length; i++) {
      for (let j = 0; j < this.col_gray_code.length; j++) {
        const row_index = this.row_gray_code[i].binary;
        const col_index = this.col_gray_code[j].binary;
        const decimal_index = this.binary_to_decimal(row_index + col_index);
        this.kmap_table[i][j] = output_values[decimal_index];
      }
    }
  }

  public FindQuads(): Cell[][] {
    const quads: Cell[][] = [];

    const part_of_quad: number[][] = Array.from(
      { length: this.row_gray_code.length },
      () => Array(this.col_gray_code.length).fill(-1)
    );

    for (let i = 0; i < this.kmap_table.length; i++) {
      for (let j = 0; j < this.kmap_table[i].length; j++) {
        if (this.kmap_table[i][j] !== 1 || part_of_quad[i][j] !== -1) {
          continue;
        }
        const quad: Cell[] = [];
        const visited: boolean[][] = Array.from(
          { length: this.row_gray_code.length },
          () => Array(this.col_gray_code.length).fill(false)
        );

        // RIGHT
        let pow = 1;
        let [ai, aj] = [i, j];
        let [x, xx] = [1, 1];
        let [ti, tj] = this.otherBoundary(ai, aj + 1);
        visited[ai][aj] = true;
        while (this.kmap_table[ti][tj] !== 0 && !visited[ti][tj]) {
          visited[ti][tj] = true;
          x++;

          if (2 ** pow === x) {
            pow++;
            xx = x;
          }
          [ti, tj] = this.otherBoundary(ti, tj + 1);
        }
        x = xx;

        // LEFT
        [ti, tj] = this.otherBoundary(ai, aj - 1);
        while (this.kmap_table[ti][tj] !== 0 && !visited[ti][tj]) {
          visited[ti][tj] = true;
          x++;

          if (2 ** pow === x) {
            pow++;
            aj = tj;
            xx = x;
          }
          [ti, tj] = this.otherBoundary(ti, tj - 1);
        }
        x = xx;
        const rlen = xx;

        // DOWN
        pow = 1;
        x = xx = 1;
        [ti, tj] = this.otherBoundary(ai + 1, aj);
        while (this.kmap_table[ti][tj] !== 0 && !visited[ti][tj]) {
          for (let index = 1; index < rlen; index++) {
            const [vi, vj] = this.otherBoundary(ti, tj + index);
            if (this.kmap_table[vi][vj] === 0) {
              break;
            }
          }

          visited[ti][tj] = true;
          x++;

          if (2 ** pow === x) {
            pow++;
            xx = x;
          }
          [ti, tj] = this.otherBoundary(ti + 1, tj);
        }
        x = xx;

        // UP
        [ti, tj] = this.otherBoundary(ai - 1, aj);
        while (this.kmap_table[ti][tj] !== 0 && !visited[ti][tj]) {
          for (let index = 1; index < rlen; index++) {
            const [vi, vj] = this.otherBoundary(ti, tj + index);
            if (this.kmap_table[vi][vj] === 0) {
              break;
            }
          }

          visited[ti][tj] = true;
          x++;

          if (2 ** pow === x) {
            pow++;
            ai = ti;
            xx = x;
          }
          [ti, tj] = this.otherBoundary(ti - 1, tj);
        }
        x = xx;

        // PUSH ALLS QUAD
        for (let index = 0; index < xx; index++) {
          for (let jndex = 0; jndex < rlen; jndex++) {
            [ti, tj] = this.otherBoundary(ai + index, aj + jndex);
            quad.push({ row: ti, col: tj });
            part_of_quad[ti][tj] = quads.length;
          }
        }
        quads.push(quad);
      }
    }
    return quads;
  }

  private otherBoundary(row: number, col: number): [number, number] {
    if (row < 0) {
      const nr = Math.abs(row) % this.row_gray_code.length;
      row = this.row_gray_code.length - nr;
    } else if (row >= this.row_gray_code.length) {
      row = row % this.row_gray_code.length;
    }
    if (col < 0) {
      const nc = Math.abs(col) % this.col_gray_code.length;
      col = this.col_gray_code.length - nc;
    } else if (col === this.col_gray_code.length) {
      col = col % this.col_gray_code.length;
    }

    return [row, col];
  }

  public printKmap(): void {
    console.log(
      "    " + this.col_gray_code.map((gc) => gc.binary.padStart(2)).join("  ")
    );
    console.log("   " + "-".repeat(this.col_gray_code.length * 3 + 1));
    for (let i = 0; i < this.kmap_table.length; i++) {
      let row = this.row_gray_code[i].binary.padStart(2) + " |";
      for (let j = 0; j < this.kmap_table[i].length; j++) {
        const value = this.kmap_table[i][j];
        row += " " + (value === -1 ? "X" : value) + " ";
      }
      console.log(row);
    }
  }

  public printQuad(quad: Cell[]): void {
    const table = Array.from({ length: this.row_gray_code.length }, () =>
      Array(this.col_gray_code.length).fill(0)
    );
    for (const cell of quad) {
      if (
        cell.row < 0 ||
        cell.row >= this.row_gray_code.length ||
        cell.col < 0 ||
        cell.col >= this.col_gray_code.length
      ) {
        console.log(cell);
        throw new Error("Cell out of bounds");
      }
      table[cell.row][cell.col] = 1;
    }
    console.log(
      "    " + this.col_gray_code.map((gc) => gc.binary.padStart(2)).join("  ")
    );
    console.log("   " + "-".repeat(this.col_gray_code.length * 3 + 1));
    for (let i = 0; i < table.length; i++) {
      let row = this.row_gray_code[i].binary.padStart(2) + " |";
      for (let j = 0; j < table[i].length; j++) {
        const value = table[i][j];
        row += " " + value + " ";
      }
      console.log(row);
    }
  }
}
