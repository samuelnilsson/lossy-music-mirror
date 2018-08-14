/**
 * The LosslessCodec class.
 */

import { ICodec } from './Codec.interface';

/**
 * Class representing lossy codecs.
 */
export abstract class LosslessCodec implements ICodec {
  public abstract readonly extension: string;
  public abstract readonly ffmpegName: string;
  public readonly isLossless: boolean = true;
}
