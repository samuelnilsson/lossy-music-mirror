/**
 * Contains functions that performs operations using sox
 */

import { execSync } from 'child_process';
import * as path from 'path';

function transcode(file: string, outputDirectory: string): void {
  const fileName: string = path.parse(file).name;
  const command: string = `sox "${file}" "${outputDirectory}/${fileName}.ogg"`;
  execSync(command);
};

export {
  transcode
};
