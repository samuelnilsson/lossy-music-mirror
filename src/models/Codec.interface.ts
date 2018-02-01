/**
 * The ICodec interface.
 */

export interface ICodec {
  readonly minQuality: number;
  readonly maxQuality: number;
  readonly extension: string;
  readonly encoderLib: string;
}
