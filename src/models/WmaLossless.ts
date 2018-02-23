/**
 * The WmaLossless class.
 */

import { LosslessCodec } from './LosslessCodec';

/**
 * Class representing the wma lossless codec.
 */
export class WmaLossless extends LosslessCodec {
  public readonly extension: string = 'wma';
  public readonly ffmpegName: string = 'wmalossless';
}
