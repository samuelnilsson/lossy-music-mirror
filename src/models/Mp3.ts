/**
 * The Mp3 class.
 */

import { ICodec } from './Codec.interface';

/**
 * Class representing the mp3 codec.
 */
export class Mp3 implements ICodec {
  public readonly minQuality: number = 0;
  public readonly maxQuality: number = 9;
  public readonly extension: string = 'mp3';
  public readonly encoderLib: string = 'libmp3lame';
}
