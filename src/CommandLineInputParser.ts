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

    return <CommandLineOptions>this.parser.parseArgs();
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
  }
}
