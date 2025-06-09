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

/**
 * Represents a Karnaugh Map (K-map) for boolean function minimization.
 * A Karnaugh Map is a visual method used to simplify boolean algebra expressions.
 * It provides a systematic way to find the minimum sum of products (SOP) form
 * of a boolean function.
 */
export default class KarnaughMap {
  private truth_table: TruthTable;
  private num_of_variables_in_rows: number;
  private num_of_variables_in_cols: number;

  private row_gray_code: GrayCode[];
  private col_gray_code: GrayCode[];
  private kmap_table: number[][];

  constructor(truth_table: TruthTable) {
    this.truth_table = truth_table;
    if (this.truth_table.getNumOfInput() % 2 === 0) {
      this.num_of_variables_in_rows = this.num_of_variables_in_cols =
        this.truth_table.getNumOfInput() / 2;
    } else {
      this.num_of_variables_in_rows = Math.floor(
        this.truth_table.getNumOfInput() / 2
      );
      this.num_of_variables_in_cols = Math.ceil(
        this.truth_table.getNumOfInput() / 2
      );
    }

    // TODO: If input pins is 1 it fails to generate.
    this.row_gray_code = this.generateGrayCode(this.num_of_variables_in_rows);
    this.col_gray_code = this.generateGrayCode(this.num_of_variables_in_cols);

    this.kmap_table = Array.from({ length: this.row_gray_code.length }, () =>
      Array(this.col_gray_code.length).fill("0")
    );
  }

  /**
   * Generates a Gray code sequence for a given number of variables.
   * Gray code is a binary numeral system where two successive values differ in only one bit.
   * @param num_of_variables - Number of variables to generate Gray code for
   * @returns Array of Gray code objects containing binary representation and decimal value
   */
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

  /**
   * Converts a decimal number to its binary string representation.
   * @param decimal - The decimal number to convert
   * @returns Binary string representation
   * @throws Error if decimal is negative
   */
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

  /**
   * Converts a binary string to its decimal number representation.
   * @param binary - The binary string to convert
   * @returns Decimal number representation
   * @throws Error if binary string contains non-binary characters
   */
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

  /**
   * Applies the output values from the truth table to the Karnaugh Map.
   * Maps each output value to its corresponding position in the K-map based on
   * the Gray code ordering of rows and columns.
   * @param output_pin_index - Index of the output pin in the truth table
   * @throws Error if output pin index is invalid
   */
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

  /**
   * Finds all possible quads (groups of 4 adjacent 1s) in the Karnaugh Map.
   * Quads are used to identify terms that can be combined in the simplified boolean expression.
   * @returns Array of quads, where each quad is an array of cell coordinates
   */
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

  /**
   * Handles boundary conditions for the Karnaugh Map by wrapping around edges.
   * Since K-maps are considered to wrap around both horizontally and vertically,
   * this method ensures proper indexing when accessing cells beyond the map boundaries.
   * @param row - Row index
   * @param col - Column index
   * @returns Tuple of [row, col] with wrapped indices
   */
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

  /**
   * Generates the Sum of Products (SOP) equation from the identified quads.
   * Each quad represents a product term in the simplified boolean expression.
   * @param quads - Array of quads identified in the K-map
   * @returns Array of product terms, where each term is an array of literals
   */
  public EquationSOP(quads: Cell[][]): string[][] {
    const sop: string[][] = [];
    for (const quad of quads) {
      const row_set = new HashSet<number>();
      const col_set = new HashSet<number>();

      for (const cell of quad) {
        if (row_set.find(cell.row) !== row_set.end()) {
          row_set.insert(cell.row);
        }
        if (col_set.find(cell.col) !== col_set.end()) {
          col_set.insert(cell.col);
        }
      }
      const products: string[] = [];

      const any_row = row_set.back();
      if (any_row !== undefined) {
        const gray_code_len = this.row_gray_code[0].binary.length;
        for (let i = 0; i < gray_code_len; i++) {
          const bit = this.row_gray_code[any_row].binary[i];
          let include = true;
          for (const r of row_set) {
            if (bit !== this.row_gray_code[r].binary[i]) {
              include = false;
              break;
            }
          }
          if (include) {
            if (bit === "0") {
              products.push(`i${i+ 1}'`);
            } else {
              products.push(`i${i+ 1}`);
            }
          }
        }
      }

      const any_col = col_set.back();
      if (any_col !== undefined) {
        const gray_code_len = this.col_gray_code[0].binary.length;
        for (let i = 0; i < gray_code_len; i++) {
          const bit = this.col_gray_code[any_col].binary[i];
          let include = true;
          for (const c of col_set) {
            if (bit !== this.col_gray_code[c].binary[i]) {
              include = false;
              break;
            }
          }
          if (include) {
            if (bit === "0") {
              products.push(`i${i + this.num_of_variables_in_rows + 1}'`);
            } else {
              products.push(`i${i + this.num_of_variables_in_rows+ 1}`);
            }
          }
        }
      }

      sop.push(products);
    }
    return sop;
  }

  /**
   * Converts a Sum of Products (SOP) array into a formatted string representation.
   * Each product term is joined with a dot (·) and all products are joined with a plus (+).
   * 
   * @param sop - Array of product terms, where each term is an array of literals
   * @returns Formatted string representation of the SOP expression
   * @example
   * // Input: [["i1", "i3'"], ["i0", "i3'"]]
   * // Output: "i1 · i3' + i0 · i3'"
   */
  public sopToString(sop: string[][]): string {
    if (sop.length === 0) return "";
    
    return sop.map(products => products.join(" · ")).join(" + ");
  }
}
