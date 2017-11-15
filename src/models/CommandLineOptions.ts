/**
 * The CommandLineOptions class.
 */

/**
 * Class representing CommandLineOptions.
 */
export class CommandLineOptions {
  public output: string;
  public quality: number;
  public input: string;

  /**
   * Create CommandLineOptions.
   * @param output  - The output directory.
   * @param quality - The vorbis quality.
   */
  constructor(output: string, quality: number, input: string) {
    this.output = output;
    this.quality = quality;
    this.input = input;
  }
}
