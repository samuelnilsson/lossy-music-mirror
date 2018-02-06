/**
 * The CommandLineInputParser module. Contains functions that handle command line input.
 */

import { ArgumentParser, ArgumentParserOptions } from 'argparse';
import * as file from './file';
import { ICodec } from './models/Codec.interface';
import { CommandLineOptions } from './models/CommandLineOptions';
import { Mp3 } from './models/Mp3';
import { Vorbis } from './models/Vorbis';

/**
 * Validates the command line options. Prints validation error messages to the
 * console.
 * @param   The command line options.
 * @returns True if the validation succeeded and false otherwise.
 */
function validate(options: CommandLineOptions): boolean {
  return validQuality(options.quality, options.codec)
    && validInput(options.input);
}

/**
 * Parses the command line options.
 * @param   Optional additional argument parser options.
 * @returns The parsed command line options.
 */
function parse(argParseOptions: ArgumentParserOptions = {}): CommandLineOptions {
  const parser: ArgumentParser = new ArgumentParser(argParseOptions);
  initializeOptions(parser);
  const parsedArguments: any = parser.parseArgs();

  const output: string = parsedArguments.output;

  let input: string = parsedArguments.input;
  if (input == null) {
    input = './';
  }

  const codecString: string = parsedArguments.codec;
  const codec: ICodec = mapCodec(codecString);

  let quality: number = parsedArguments.quality;
  if (quality == null) {
    quality = codec.defaultQuality;
  }

  return new CommandLineOptions(
    output,
    quality,
    input,
    codec
  );
}

/**
 * Initializes the command line options.
 */
function initializeOptions(parser: ArgumentParser): void {
  parser.addArgument(
    [ 'output' ],
    {
      type: 'string',
      help: 'The output directory path'
    }
  );
  parser.addArgument(
    [ '-q', '--quality' ],
    {
      type: 'int',
      help: 'The output quality (0-10 [default = 3] for vorbis or 0-9 [default = 4] (lower value is higher quality) for mp3)'
    }
  );
  parser.addArgument(
    [ '-i', '--input' ],
    {
      type: 'string',
      help: 'The input directory path [default = ./]'
    }
  );
  parser.addArgument(
    [ '-c', '--codec' ],
    {
      type: 'string',
      help: 'The output codec [default = vorbis]',
      defaultValue: 'vorbis',
      choices: ['vorbis', 'mp3']
    }
  );
}

/**
 * Validates the quality command line input for the given output codec. Prints
 * validation error messages to the console.
 * @returns True if the validation succeeded and false otherwise.
 */
function validQuality(quality: number, codec: ICodec): boolean {
  if (quality < codec.minQuality || quality > codec.maxQuality) {
    console.info(`lossy-music-mirror: error: argument "-q/--quality": The ` +
                 `value must be between ${codec.minQuality} and ${codec.maxQuality}`);

    return false;
  }
  if (isDecimal(quality)) {
    console.info(`lossy-music-mirror: error: argument "-q/--quality": The ` +
                 `value can't be a decimal`);

    return false;
  }

  return true;
}

/**
 * Validates the input directory command line input. Prints validation error
 * messages to the console.
 * @returns True if the validation succeeded and false otherwise.
 */
function validInput(input: string): boolean {
  if (!file.isDirectory(input)) {
    console.info(`lossy-music-mirror: error: argument "-i/--input": The ` +
                 `value must be an existing directory`);

    return false;
  }

  return true;
}

/**
 * Determines if n is a decimal.
 * @returns True if n is a decimal and false otherwise.
 */
function isDecimal(n: number): boolean {
  return n % 1 !== 0;
}

function mapCodec(codec: string): ICodec {
  switch (codec) {
    case 'mp3': {
      return new Mp3();
    }
    default: {
      return new Vorbis();
    }
  }
}

export {
  parse,
  validate
};
