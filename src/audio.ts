/**
 * Contains functions that performs operations on audio files
 */

import * as spawn from 'cross-spawn';
import * as fs from 'fs-extra';
import * as path from 'path-extra';
import * as file from './file';
import { CommandLineOptions } from './models/CommandLineOptions';

/**
 * Transcodes the file into ogg vorbis and writes it to outputDirectory.
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
 * @param  The file.
 * @returns True if the file is a lossless audio file and false otherwise.
 */
function isLossless(filePath: string): boolean {
  const LOSSLESS_EXTENSIONS: string[] = ['flac'];

  return LOSSLESS_EXTENSIONS.some((extension: string) => {
    return extension === file.getExtension(filePath);
  });
}

export {
  transcode,
  isLossless
};
