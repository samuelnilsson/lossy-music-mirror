/**
 * The main app module.
 */

import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import * as path from 'path';
import * as audio from './audio';
import * as commandLineInputParser from './commandLineInputParser';
import * as directoryIterator from './directoryIterator';
import * as file from './file';
import { ICodec } from './models/Codec.interface';
import { CommandLineOptions } from './models/CommandLineOptions';

const self: any = exports;

async function run(options: CommandLineOptions): Promise<void> {
  if (!commandLineInputParser.validate(options)) {
    console.info('Validation failed.');
  } else {
    if (options.deleteFiles) {
      const filesToDelete: string[] = self.getFilesToDelete(options.input, options.output, options.codec);
      let shouldDelete: boolean = false;

      if (options.noAsk) {
        shouldDelete = true;
      } else {
        shouldDelete = await self.askUserForDelete(filesToDelete);
      }

      if (shouldDelete) {
        file.deleteFiles(filesToDelete, true);
      } else {
        console.info('Exiting.');

        return;
      }
    }
    self.startTranscode(options);
  }
}

function getFilesToDelete(inputDirectory: string, outputDirectory: string, outputCodec: ICodec): string[] {
  const filesToDelete: string[] = [];

  if (fs.existsSync(outputDirectory)) {
    directoryIterator.run(outputDirectory, (filePath: string): void => {
      const codec: ICodec = audio.getCodec(filePath);
      const isAudioFile: boolean = codec != null;

      if (isAudioFile && audio.isSameCodec(codec, outputCodec)) {
        const relativeOutputPath: string = file.getRelativePath(outputDirectory, filePath);
        const resolvedInputPath: string = path.join(inputDirectory, relativeOutputPath);

        const matchingInputFiles: string[] = file.getFilesByFilename(resolvedInputPath, file.getFilename(filePath));
        const hasMatchingLosslessFile: boolean = matchingInputFiles.some((f: string) => {
          return audio.isLossless(f);
        });

        if (!hasMatchingLosslessFile) {
          filesToDelete.push(filePath);
        }
      } else {
        filesToDelete.push(filePath);
      }
    });
  }

  return filesToDelete;
}

function countNumberOfLosslessFiles(directory: string): number {
  let numberOfFiles: number = 0;
  directoryIterator.run(directory, (filePath: string): void => {
    if (audio.isLossless(filePath)) {
      numberOfFiles += 1;
    }
  });

  return numberOfFiles;
}

function startTranscode(options: CommandLineOptions): void {
  const numberOfLosslessFiles: number = self.countNumberOfLosslessFiles(options.input);

  let counter: number = 0;
  directoryIterator.run(options.input, (filePath: string): void => {
    if (audio.isLossless(filePath)) {
      const relativeOutputPath: string = file.getRelativePath(options.input, filePath);
      const resolvedOutputPath: string = path.join(options.output, relativeOutputPath);
      file.createDirectory(resolvedOutputPath);
      counter += 1;
      process.stdout.write(`${counter}/${numberOfLosslessFiles}: `);
      audio.transcode(filePath, resolvedOutputPath, options);
    }
  });
}

async function askUserForDelete(files: string[]): Promise<boolean> {
  if (files.length === 0) {
    return true;
  }

  files.forEach((f: string) => {
    console.info(f);
  });

  const question: inquirer.Question = {
    type: 'confirm',
    name: 'confirmDelete',
    message: 'The files listed above will be deleted. Are you sure you want to continue?'
  };

  const answer: inquirer.Answers = await inquirer.prompt(question);

  /* tslint:disable:no-string-literal */
  return answer['confirmDelete'];
  /* tslint:enable:no-string-literal */
}

export {
  run,
  getFilesToDelete,
  countNumberOfLosslessFiles,
  startTranscode,
  askUserForDelete
};
