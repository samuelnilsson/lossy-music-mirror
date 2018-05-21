/**
 * The Opus class.
 */

import { EncoderMode } from './EncoderMode';
import { LossyCodec } from './LossyCodec';

/**
 * Class representing the opus codec.
 */
export class Opus extends LossyCodec {
  public readonly minQuality: number = 500;
  public readonly maxQuality: number = 256000;
  public readonly extension: string = 'opus';
  public readonly encoderLib: string = 'libopus';
  public readonly defaultQuality: number = 64000;
  public readonly ffmpegName: string = 'opus';
  public readonly encoderMode: EncoderMode = EncoderMode.Bitrate;
}
