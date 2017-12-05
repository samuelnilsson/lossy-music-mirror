#!/usr/bin/env node

/**
 * The starting script of the program.
 */

import { ArgumentParserOptions } from 'argparse';
import * as fs from 'fs-extra';
import * as path from 'path';
import { CommandLineInputParser } from './CommandLineInputParser';
import { DirectoryIterator } from './DirectoryIterator';
import * as ffmpeg from './ffmpeg';
import * as file from './file';
import { CommandLineOptions } from './models/CommandLineOptions';

const parser: CommandLineInputParser = new CommandLineInputParser({
  version: '0.0.0',
  addHelp: true
});

if (!parser.validate()) {
  console.log('Validation failed.');
  process.exit();
}
const options: CommandLineOptions = parser.parse();

run();

/**
 * Initializes and starts the DirectoryIterator and transcoder.
 */
function run(): void {
  let numberOfFiles: number = 0;
  let iterator: DirectoryIterator = new DirectoryIterator(options.input, (filePath: string): void => {
    if (isLosslessAudioFile(filePath)) {
      numberOfFiles += 1;
    }
  });
  iterator.run();

  let counter: number = 0;
  iterator = new DirectoryIterator(options.input, (filePath: string): void => {
    if (isLosslessAudioFile(filePath)) {
      const relativeOutputPath: string = path.relative(path.resolve(options.input), file.getDirectory(filePath));
      const absoluteOutputPath: string = path.join(path.resolve(options.output), relativeOutputPath);
      createDirectory(absoluteOutputPath);
      counter += 1;
      process.stdout.write(`${counter}/${numberOfFiles}: `);
      ffmpeg.transcode(file.getAbsolutePath(filePath), absoluteOutputPath, options);
    }
  });
  iterator.run();
}

/**
 * Creates a directory.
 * @param The absolute path to the directory to create.
 */
function createDirectory(directory: string): void {
  if (!fs.existsSync(directory)) {
    fs.ensureDirSync(directory);
  }
}

/**
 * Determines if a file is a lossless audio file.
 * @param  The file.
 * @returns True if the file is a lossless audio file and false otherwise.
 */
function isLosslessAudioFile(filePath: string): boolean {
  const LOSSLESS_EXTENSIONS: string[] = ['flac'];

  return LOSSLESS_EXTENSIONS.some((extension: string) => {
    return extension === file.getExtension(filePath);
  });
}
