import TruthTable from "@/engine/truthTable";

type GrayCode = {
  binary: string;
  decimal: number;
};

export default class KarnaughMap {
  private truth_table: TruthTable;
  private num_of_km_rows: number;
  private num_of_km_cols: number;

  private row_gray_code: GrayCode[];
  private col_gray_code: GrayCode[];
  private kmap_table: number[][];

  constructor(truth_table: TruthTable) {
    this.truth_table = truth_table;

    if (this.truth_table.getNumOfInput() % 2 === 0) {
      this.num_of_km_rows = this.num_of_km_cols =
        this.truth_table.getNumOfInput() / 2;
    } else {
      this.num_of_km_rows = Math.ceil(this.truth_table.getNumOfInput() / 2);
      this.num_of_km_cols = Math.floor(this.truth_table.getNumOfInput() / 2);
    }

    // TODO: If input pins is 1 it fails to generate.
    this.row_gray_code = this.generateGrayCode(this.num_of_km_rows);
    this.col_gray_code = this.generateGrayCode(this.num_of_km_cols);

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

  public solve(): string {
    return "";
  }
}
