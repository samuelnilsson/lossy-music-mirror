/**
 * The Vorbis class.
 */

import { ICodec } from './Codec.interface';

/**
 * Class representing the vorbis codec.
 */
export class Vorbis implements ICodec {
  public readonly minQuality: number = 0;
  public readonly maxQuality: number = 10;
  public readonly extension: string = 'ogg';
  public readonly encoderLib: string = 'libvorbis';
}
