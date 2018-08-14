/**
 * The AppleLossless class.
 */

import { LosslessCodec } from './LosslessCodec';

/**
 * Class representing the apple lossless codec.
 */
export class AppleLossless extends LosslessCodec {
  public readonly extension: string = 'm4a';
  public readonly ffmpegName: string = 'alac';
}
