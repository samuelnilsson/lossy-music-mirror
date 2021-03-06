/**
 * The LossyCodec class.
 */

import { ICodec } from './Codec.interface';
import { EncoderMode } from './EncoderMode';

/**
 * Class representing lossy codecs.
 */
export abstract class LossyCodec implements ICodec {
  public abstract readonly extension: string;
  public abstract readonly minQuality: number;
  public abstract readonly maxQuality: number;
  public abstract readonly encoderLib: string;
  public abstract readonly defaultQuality: number;
  public abstract readonly ffmpegName: string;
  public abstract readonly encoderMode: EncoderMode;
  public readonly isLossless: boolean = false;
}
