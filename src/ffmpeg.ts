/**
 * Contains functions that performs operations using ffmpeg
 */

import { execSync } from 'child_process';
import * as path from 'path';
import { CommandLineOptions } from './models/CommandLineOptions';

/**
 * Transcodes the file into ogg vorbis and writes it to outputDirectory.
 * @param file            - The path to the file to transcode.
 * @param outputDirectory - The directory to write the transcoded file to.
 * @param options         - Options from the command line.
 */
function transcode(file: string, outputDirectory: string, options: CommandLineOptions): void {
  const fileName: string = path.parse(file).name;
  const outputPath: string = path.join(outputDirectory, `${fileName}.ogg`);
  console.info(`Converting ${file} to ${outputPath}`);
  const command: string = `ffmpeg -hide_banner -loglevel error -i "${file}" -c:a libvorbis -q:a ${options.quality} "${outputPath}"`;
  execSync(command);
}

export {
  transcode
};
