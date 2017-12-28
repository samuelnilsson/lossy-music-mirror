/**
 * The main app module.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as commandLineInputParser from './commandLineInputParser';
import * as directoryIterator from './directoryIterator';
import * as ffmpeg from './ffmpeg';
import * as file from './file';
import { CommandLineOptions } from './models/CommandLineOptions';

function run(options: CommandLineOptions): void {
  if (!commandLineInputParser.validate(options)) {
    console.info('Validation failed.');
  } else {
    let numberOfFiles: number = 0;
    directoryIterator.run(options.input, (filePath: string): void => {
      if (ffmpeg.isLosslessAudioFile(filePath)) {
        numberOfFiles += 1;
      }
    });

    let counter: number = 0;
    directoryIterator.run(options.input, (filePath: string): void => {
      if (ffmpeg.isLosslessAudioFile(filePath)) {
        const relativeOutputPath: string = file.getRelativePath(options.input, filePath);
        const resolvedOutputPath: string = path.join(options.output, relativeOutputPath);
        file.createDirectory(resolvedOutputPath);
        counter += 1;
        process.stdout.write(`${counter}/${numberOfFiles}: `);
        ffmpeg.transcode(filePath, resolvedOutputPath, options);
      }
    });
  }
}

export {
  run
};
