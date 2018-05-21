/**
 * The Mp3 class.
 */

import { EncoderMode } from './EncoderMode';
import { LossyCodec } from './LossyCodec';

/**
 * Class representing the mp3 codec.
 */
export class Mp3 extends LossyCodec {
  public readonly minQuality: number = 0;
  public readonly maxQuality: number = 9;
  public readonly extension: string = 'mp3';
  public readonly encoderLib: string = 'libmp3lame';
  public readonly defaultQuality: number = 4;
  public readonly ffmpegName: string = 'mp3';
  public readonly encoderMode: EncoderMode = EncoderMode.Quality;
}
