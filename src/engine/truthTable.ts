/**
 * TruthTable class represents a truth table for a digital circuit.
 * It allows you to define the number of inputs and outputs, generate the input combinations,
 * and set or get the output values for each combination.
 */
export default class TruthTable {
  private num_of_input: number;
  private num_of_output: number;
  private num_of_rows: number;

  private truth_table_input: number[][];
  private truth_table_output: number[][];

  /**
   * Constructs a TruthTable instance with the specified number of inputs and outputs.
   * @param num_of_input - The number of input pins (must be greater than 0).
   * @param num_of_output - The number of output pins (must be greater than 0).
   */
  constructor(num_of_input: number, num_of_output: number) {
    if (num_of_input < 1) {
      throw new Error("number of input must be greater than zero");
    }
    if (num_of_output < 1) {
      throw new Error("number of output must be greater than zero");
    }
    this.num_of_input = num_of_input;
    this.num_of_output = num_of_output;
    this.num_of_rows = 2 ** num_of_input;

    this.truth_table_input = Array.from({ length: this.num_of_rows }, () =>
      Array(this.num_of_input).fill(0)
    );
    this.truth_table_output = Array.from({ length: this.num_of_rows }, () =>
      Array(this.num_of_output).fill(-1)
    );

    this.generateTruthTableInput();
  }

  /**
   * Returns the number of rows in the truth table.
   * @returns The number of rows.
   */
  public getNumOfRows(): number {
    return this.num_of_rows;
  }
  /**
   * Returns the number of input pins.
   * @returns The number of input pins.
   */
  public getNumOfInput(): number {
    return this.num_of_input;
  }
  /**
   * Returns the number of output pins.
   * @returns The number of output pins.
   */
  public getNumOfOutput(): number {
    return this.num_of_output;
  }
  /**
   * Returns the input combinations of the truth table.
   * @returns A 2D array representing the input combinations.
   */
  public getTruthTableInput(): number[][] {
    return this.truth_table_input;
  }
  /**
   * Returns the output values of the truth table.
   * @returns A 2D array representing the output values.
   */
  public getTruthTableOutput(): number[][] {
    return this.truth_table_output;
  }

  /**
   * Prints the truth table in a readable format.
   * Each row is printed with its index, inputs, and outputs.
   */
  public printTruthTable() {
    for (let i = 0; i < this.num_of_rows; i++) {
      console.log(
        `${i + 1}: ${this.truth_table_input[i].join(
          ", "
        )} | ${this.truth_table_output[i].join(", ")}`
      );
    }
  }

  /**
   * Generates the input part of the truth table based on the number of inputs.
   * The inputs are filled in a binary counting manner.
   */
  private generateTruthTableInput() {
    let rows = this.num_of_rows;
    for (let input = 0; input < this.num_of_input; input++) {
      const repeatation = this.num_of_rows / rows;
      rows /= 2;

      let k = 0;
      for (let rep = 0; rep < repeatation; rep++) {
        for (let i = 0; i < 2; i++) {
          for (let r = 0; r < rows; r++) {
            if (i === 1) {
              this.truth_table_input[k][input] = 1;
            }
            k++;
          }
        }
      }
    }
  }

  /**
   * Checks if the given row index and output pin index are within valid bounds.
   * Throws an error if they are out of bounds.
   * @param row_index - The index of the row to check.
   * @param output_pin_index - The index of the output pin to check.
   */
  private outputBoundCheck(row_index: number, output_pin_index: number) {
    if (0 > row_index || row_index >= this.num_of_rows) {
      throw new Error(
        "'row index' must be greater than -1 and less than 'number of rows'"
      );
    }
    if (0 > output_pin_index || output_pin_index >= this.num_of_output) {
      throw new Error(
        "'output pin index' must be greater than -1 and less than 'number of outputs'"
      );
    }
  }

  /**
   * Sets the output value for a specific row and output pin.
   * The value must be either 0, 1, or -1 (don't care).
   * @param row_index - The index of the row to set the output for.
   * @param output_pin_index - The index of the output pin to set the value for.
   * @param value - The value to set (0, 1, or -1).
   */
  public setOutput(
    output_pin_index: number,
    row_index: number,
    value: number
  ): void {
    this.outputBoundCheck(row_index, output_pin_index);

    if (value !== 0 && value !== 1 && value !== -1) {
      throw new Error("'value' must be either 0, 1 or -1(don't care)");
    }

    this.truth_table_output[row_index][output_pin_index] = value;
  }

  /**
   * Gets the output value for a specific row and output pin.
   * @param row_index - The index of the row to get the output from.
   * @param output_pin_index - The index of the output pin to get the value from.
   * @returns The output value (0, 1, or -1).
   */
  public getOutput(row_index: number, output_pin_index: number): number {
    this.outputBoundCheck(row_index, output_pin_index);
    return this.truth_table_output[row_index][output_pin_index];
  }
}
