/**
 * Contains functions that performs operations on audio files
 */

import { SpawnSyncReturns } from 'child_process';
import * as spawn from 'cross-spawn';
import * as fs from 'fs-extra';
import * as path from 'path-extra';
import { Ape } from './models/Ape';
import { AppleLossless } from './models/AppleLossless';
import { ICodec } from './models/Codec.interface';
import { CommandLineOptions } from './models/CommandLineOptions';
import { Flac } from './models/Flac';
import { Mp3 } from './models/Mp3';
import { TrueAudio } from './models/TrueAudio';
import { Vorbis } from './models/Vorbis';
import { WavPack } from './models/WavPack';
import { WmaLossless } from './models/WmaLossless';

const self: any = exports;

/**
 * Transcodes the file according to the options and writes it to outputDirectory.
 * @param file            - The path to the file to transcode.
 * @param outputDirectory - The directory to write the transcoded file to.
 * @param options         - Options from the command line.
 */
function transcode(filePath: string, outputDirectory: string, options: CommandLineOptions): void {
  const fileName: string = path.parse(filePath).name;
  const outputPath: string = path.join(outputDirectory, `${fileName}.${options.codec.extension}`);

  if (!fs.existsSync(outputPath)) {
    console.info(`Converting ${filePath} to ${outputPath}`);
    const ffmpegOptions: string[] = [
      '-hide_banner',
      '-loglevel', 'error',
      '-i', filePath,
      '-c:a', options.codec.encoderLib,
      '-q:a', options.quality.toString(),
      '-vn',
      outputPath
    ];
    spawn.sync('ffmpeg', ffmpegOptions, { stdio: 'inherit' });
  } else {
    console.info(`Skipping conversion to ${outputPath} since it already exists`);
  }
}

/**
 * Determines if a file is a lossless audio file.
 * @param   The path to the file.
 * @returns True if the file is a lossless audio file and false otherwise.
 */
function isLossless(filePath: string): boolean {
  const codec: ICodec = self.getCodec(filePath);

  return codec !== null ? codec.isLossless : null;
}

/**
 * Determines the audio codec of a file.
 * @param   The file.
 * @returns The audio codec of the file or null if the codec is not supported or the
 *          file is not an audio file.
 */
function getCodec(filePath: string): ICodec {
  const ffprobeOptions: string[] = [
    '-v', 'error',
    '-select_streams', 'a:0',
    '-show_entries', 'stream=codec_name',
    '-of', 'default=nokey=1:noprint_wrappers=1',
    filePath
  ];
  const cmdResult: SpawnSyncReturns<Buffer> = spawn.sync('ffprobe', ffprobeOptions, { stdio: 'pipe' });

  const successExitCode: number = 0;

  if (cmdResult.status !== successExitCode) {
    return null;
  } else {
    const cmdOutput: string = String(cmdResult.stdout).trim();
    switch (cmdOutput) {
      case (new Mp3().ffmpegName): {
        return new Mp3();
      }
      case (new Vorbis().ffmpegName): {
        return new Vorbis();
      }
      case (new Flac().ffmpegName): {
        return new Flac();
      }
      case (new Ape().ffmpegName): {
        return new Ape();
      }
      case (new AppleLossless().ffmpegName): {
        return new AppleLossless();
      }
      case (new WmaLossless().ffmpegName): {
        return new WmaLossless();
      }
      case (new WavPack().ffmpegName): {
        return new WavPack();
      }
      case (new TrueAudio().ffmpegName): {
        return new TrueAudio();
      }
      default:
        return null;
    }
  }
}

export {
  transcode,
  isLossless,
  getCodec
};
