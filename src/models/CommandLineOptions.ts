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

  /**
   * Create CommandLineOptions.
   * @param output      - The output directory.
   * @param quality     - The output audio quality.
   * @param input       - The input directory.
   * @param codec       - The output codec.
   * @param deleteFiles - True if files should be deleted.
   */
  constructor(output: string, quality: number, input: string, codec: LossyCodec, deleteFiles: boolean) {
    this.output = output;
    this.quality = quality;
    this.input = input;
    this.codec = codec;
    this.deleteFiles = deleteFiles;
  }
}
