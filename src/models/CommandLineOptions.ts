/**
 * The CommandLineOptions class.
 */

import { ICodec } from './Codec.interface';

/**
 * Class representing CommandLineOptions.
 */
export class CommandLineOptions {
  public output: string;
  public quality: number;
  public input: string;
  public codec: ICodec;

  /**
   * Create CommandLineOptions.
   * @param output  - The output directory.
   * @param quality - The vorbis quality.
   */
  constructor(output: string, quality: number, input: string, codec: ICodec) {
    this.output = output;
    this.quality = quality;
    this.input = input;
    this.codec = codec;
  }
}
