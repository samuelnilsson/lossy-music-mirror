/**
 * The Vorbis class.
 */

import { LossyCodec } from './LossyCodec';

/**
 * Class representing the vorbis codec.
 */
export class Vorbis extends LossyCodec {
  public readonly minQuality: number = 0;
  public readonly maxQuality: number = 10;
  public readonly extension: string = 'ogg';
  public readonly encoderLib: string = 'libvorbis';
  public readonly defaultQuality: number = 3;
  public readonly ffmpegName: string = 'vorbis';
}
