/**
 * The CommandLineInputParser class.
 */

import { ArgumentParser, ArgumentParserOptions } from 'argparse';
import { CommandLineOptions } from './models/CommandLineOptions';
import { File } from './models/File';

/**
 * Class representing a CommandLineInputParser.
 */
export class CommandLineInputParser {
  private parser: ArgumentParser;
  private optionsInitialized: boolean;

  /**
   * Create a CommandLineInputParser.
   * @param [options] Additional options for the argument parser.
   */
  constructor(options: ArgumentParserOptions = {}) {
    this.parser = new ArgumentParser(options);
    this.optionsInitialized = false;
  }

  /**
   * Validates the command line input. Prints validation error messages to the
   * console.
   * @returns True if the validation succeeded and false otherwise.
   */
  public validate(): boolean {
    const options: CommandLineOptions = this.parse();

    return this.validQuality(options.quality)
      && this.validInput(options.input);
  }

  /**
   * Parses the command line options.
   * @returns The parsed command line options.
   */
  public parse(): CommandLineOptions {
    this.initializeOptions();
    const parsedArguments: any = this.parser.parseArgs();

    const output: string = parsedArguments.output;

    let quality: number = parsedArguments.quality;
    if (quality == null) {
      quality = 3;
    }

    let input: string = parsedArguments.input;
    if (input == null) {
      input = './';
    }

    return new CommandLineOptions(
      output,
      quality,
      input
    );
  }

  /**
   * Initializes the command line options.
   */
  private initializeOptions(): void {
    if (!this.optionsInitialized) {
      this.parser.addArgument(
        [ 'output' ],
        {
          type: 'string',
          help: 'The output directory path'
        }
      );
      this.parser.addArgument(
        [ '-q', '--quality' ],
        {
          type: 'int',
          help: 'The vorbis quality (0-10 [default = 3])'
        }
      );
      this.parser.addArgument(
        [ '-i', '--input' ],
        {
          type: 'string',
          help: 'The input directory path'
        }
      );
      this.optionsInitialized = true;
    }
  }

  /**
   * Validates the quality command line input. Prints validation error messages
   * to the console.
   * @returns True if the validation succeeded and false otherwise.
   */
  private validQuality(quality: number): boolean {
    if (quality < 0 || quality > 10) {
      console.info(`lossy-music-mirror: error: argument "-q/--quality": The ` +
                   `value must be between 0 and 10`);

      return false;
    }
    if (this.isDecimal(quality)) {
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
  private validInput(input: string): boolean {
    const file: File = new File(input);
    if (!file.isDirectory()) {
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
  private isDecimal(n: number): boolean {
    return n % 1 !== 0;
  }
}
