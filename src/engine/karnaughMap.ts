import TruthTable from "@/engine/truthTable";

export default class KarnaughMap {
  private truth_table: TruthTable;
  private num_of_km_rows: number;
  private num_of_km_cols: number;

  private row_gray_code: string[];
  private col_gray_code: string[];
  // private kmap_table: number[][];

  constructor(truth_table: TruthTable) {
    this.truth_table = truth_table;

    if (this.truth_table.getNumOfInput() % 2 === 0) {
      this.num_of_km_rows = this.num_of_km_cols =
        this.truth_table.getNumOfInput() / 2;
    } else {
      this.num_of_km_rows = Math.floor(this.truth_table.getNumOfInput() / 2);
      this.num_of_km_cols = Math.ceil(this.truth_table.getNumOfInput() / 2);
    }

    this.row_gray_code = this.generateGrayCode(this.num_of_km_rows);
    this.col_gray_code = this.generateGrayCode(this.num_of_km_cols);
  }

  private generateGrayCode(num_of_variables: number): string[] {
    if (num_of_variables <= 0) {
      return [];
    }
    const gray_code: string[] = ["0", "1"];

    for (let v = 2; v <= num_of_variables; v++) {
      const power_half = 2 ** v / 2;

      const copy: string[] = [];
      for (let i = 0; i < gray_code.length; i++) {
        copy.push(gray_code[i]);
      }
      for (let i = gray_code.length - 1; i >= 0; i--) {
        copy.push(gray_code[i]);
      }

      for (let i = 0; i < power_half; i++) {
        gray_code[i] = "0" + copy[i];
      }
      for (let i = power_half; i < 2 * power_half; i++) {
        gray_code.push("1" + copy[i]);
      }
    }

    return gray_code;
  }
}
