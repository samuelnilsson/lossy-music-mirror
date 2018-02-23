/**
 * The TrueAudio class.
 */

import { LosslessCodec } from './LosslessCodec';

/**
 * Class representing the true audio codec.
 */
export class TrueAudio extends LosslessCodec {
  public readonly extension: string = 'tta';
  public readonly ffmpegName: string = 'tta';
}
