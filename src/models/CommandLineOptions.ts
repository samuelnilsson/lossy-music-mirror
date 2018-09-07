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
  public deleteFiles: boolean;
  public noAsk: boolean;

  /**
   * Create CommandLineOptions.
   * @param output      - The output directory.
   * @param quality     - The output audio quality.
   * @param input       - The input directory.
   * @param codec       - The output codec.
   * @param deleteFiles - True if files should be deleted.
   * @param noAsk       - True if the program should not ask any questions.
   */
  constructor(output: string, quality: number, input: string, codec: LossyCodec, deleteFiles: boolean, noAsk: boolean) {
    this.output = output;
    this.quality = quality;
    this.input = input;
    this.codec = codec;
    this.deleteFiles = deleteFiles;
    this.noAsk = noAsk;
  }
}
