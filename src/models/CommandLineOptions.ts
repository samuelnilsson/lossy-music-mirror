/**
 * The CommandLineOptions class.
 */

export enum Codec {
  Vorbis,
  Mp3
}

/**
 * Class representing CommandLineOptions.
 */
export class CommandLineOptions {
  public output: string;
  public quality: number;
  public input: string;
  public codec: Codec;

  /**
   * Create CommandLineOptions.
   * @param output  - The output directory.
   * @param quality - The vorbis quality.
   */
  constructor(output: string, quality: number, input: string, codec: Codec) {
    this.output = output;
    this.quality = quality;
    this.input = input;
    this.codec = codec;
  }
}
