/**
 * The CommandLineOptions class.
 */

import { LossyCodec } from './LossyCodec';

/**
 * Class representing CommandLineOptions.
 */
export class CommandLineOptions {
  public output: string;
  public quality: number;
  public input: string;
  public codec: LossyCodec;

  /**
   * Create CommandLineOptions.
   * @param output  - The output directory.
   * @param quality - The output audio quality.
   * @param input   - The input directory.
   * @param codec   - The output codec.
   */
  constructor(output: string, quality: number, input: string, codec: LossyCodec) {
    this.output = output;
    this.quality = quality;
    this.input = input;
    this.codec = codec;
  }
}
