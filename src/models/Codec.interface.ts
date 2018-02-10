/**
 * The ICodec interface.
 */

export interface ICodec {
  readonly extension: string;
  readonly isLossless: boolean;
  readonly ffmpegName: string;
}
