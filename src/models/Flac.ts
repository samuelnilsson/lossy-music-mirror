/**
 * The Flac class.
 */

import { LosslessCodec } from './LosslessCodec';

/**
 * Class representing the flac codec.
 */
export class Flac extends LosslessCodec {
  public readonly extension: string = 'flac';
  public readonly ffmpegName: string = 'flac';
}
