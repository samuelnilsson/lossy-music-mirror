/**
 * Tests for the CommandLineInputParser class
 */

import * as a from 'argparse';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { CommandLineInputParser } from './CommandLineInputParser';
import { CommandLineOptions } from './models/CommandLineOptions';

describe('CommandLineInputParser', () => {
  let parserStub: sinon.SinonStub;

  describe('parse', () => {
    let parseArgsStub: sinon.SinonStub;
    let addArgumentStub: sinon.SinonStub;
    let validParseArgs: any;

    beforeEach(() => {
      validParseArgs = {
        output: 'any',
        quality: null
      };
      parseArgsStub = sinon.stub();
      addArgumentStub = sinon.stub();
      parserStub = sinon.stub(a, 'ArgumentParser');
      parseArgsStub.returns(validParseArgs);
      parserStub.returns({
        parseArgs: parseArgsStub,
        addArgument: addArgumentStub
      });
    });

    it('should set the output property on CommandLineOptions', () => {
      // Arrange
      const testOutput: string = 'outputDirectory';
      validParseArgs.output = testOutput;
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.equal(result.output, testOutput);
    });

    it('should initialize the output argument', () => {
      // Arrange
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.isTrue(addArgumentStub.withArgs(
        [ 'output' ],
        {
          type: 'string',
          help: 'The output directory path'
        }
      ).calledOnce);
    });

    it('should set the quality property on CommandLineOptions', () => {
      // Arrange
      const testQuality: number = 5;
      validParseArgs.quality = testQuality;
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.equal(result.quality, testQuality);
    });

    it('should set the quality to 3 on CommandLineOptions by default', () => {
      // Arrange
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.equal(result.quality, 3);
    });

    it('should initialize the quality argument', () => {
      // Arrange
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.isTrue(addArgumentStub.withArgs(
        [ '-q', '--quality' ],
        {
          type: 'int',
          help: 'The vorbis quality (0-10 [default = 3])'
        }
      ).calledOnce);
    });

    afterEach(() => {
      if (parserStub != null) {
        parserStub.restore();
      }
    });
  });
});
