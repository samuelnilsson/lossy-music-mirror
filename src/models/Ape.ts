/**
 * The Ape class.
 */

import { LosslessCodec } from './LosslessCodec';

/**
 * Class representing the ape codec.
 */
export class Ape extends LosslessCodec {
  public readonly extension: string = 'ape';
  public readonly ffmpegName: string = 'ape';
}
