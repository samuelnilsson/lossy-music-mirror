/**
 * The CommandLineInputParser class.
 */

import { ArgumentParser, ArgumentParserOptions } from 'argparse';
import { CommandLineOptions } from './models/CommandLineOptions';

/**
 * Class representing a CommandLineInputParser.
 */
export class CommandLineInputParser {
  private parser: ArgumentParser;

  /**
   * Create a CommandLineInputParser.
   * @param [options] Additional options for the argument parser.
   */
  constructor(options: ArgumentParserOptions = {}) {
    this.parser = new ArgumentParser(options);
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

    return new CommandLineOptions(
      output,
      quality
    );
  }

  /**
   * Initializes the command line options.
   */
  private initializeOptions(): void {
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
  }
}
