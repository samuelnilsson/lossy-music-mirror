/**
 * The WavPack class.
 */

import { LosslessCodec } from './LosslessCodec';

/**
 * Class representing the wavpack codec.
 */
export class WavPack extends LosslessCodec {
  public readonly extension: string = 'wv';
  public readonly ffmpegName: string = 'wavpack';
}
