#!/usr/bin/env node

/**
 * The starting script of the program.
 */

import { ArgumentParserOptions } from 'argparse';
import * as fs from 'fs-extra';
import * as path from 'path';
import { CommandLineInputParser } from './CommandLineInputParser';
import { DirectoryIterator } from './DirectoryIterator';
import { CommandLineOptions } from './models/CommandLineOptions';
import { File } from './models/File';
import * as sox from './sox';

const parser: CommandLineInputParser = new CommandLineInputParser({
  version: '0.0.0',
  addHelp: true
});

const options: CommandLineOptions = parser.parse();

const outputDirectory: string = options.output;

run();

/**
 * Initializes and starts the DirectoryIterator and transcoder.
 */
function run(): void {
  const iterator: DirectoryIterator = new DirectoryIterator('./', (file: File): void => {
    if (isLosslessAudioFile(file)) {
      const relativeOutputPath: string = path.relative(path.resolve('./'), file.getDirectory());
      const absoluteOutputPath: string = path.join(path.resolve(outputDirectory), relativeOutputPath);
      createDirectory(absoluteOutputPath);
      sox.transcode(file.getAbsolutePath(), absoluteOutputPath);
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
function isLosslessAudioFile(file: File): boolean {
  const LOSSLESS_EXTENSIONS: string[] = ['flac'];

  return LOSSLESS_EXTENSIONS.some((extension: string) => {
    return extension === file.getExtension();
  });
}
