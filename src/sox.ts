/**
 * Contains functions that performs operations using sox
 */

import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Transcodes the file into ogg vorbis and writes it to outputDirectory.
 * @param file - The path to the file to transcode.
 * @param outputDirectory - The directory to write the transcoded file to.
 */
function transcode(file: string, outputDirectory: string): void {
  const fileName: string = path.parse(file).name;
  const outputPath: string = path.join(outputDirectory, `${fileName}.ogg`);
  console.info(`Converting ${file} to ${outputPath}`);
  const command: string = `sox "${file}" "${outputPath}"`;
  execSync(command);
}

export {
  transcode
};
