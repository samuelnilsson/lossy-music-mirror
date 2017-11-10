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

  beforeEach(() => {
    parserStub = sinon.stub(a, 'ArgumentParser');
  });

  afterEach(() => {
    if (parserStub != null) {
      parserStub.restore();
    }
  });

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
  });

  describe('validate', () => {
    let parseStub: sinon.SinonStub;
    let validOptions: CommandLineOptions;
    let parser: CommandLineInputParser;

    beforeEach(() => {
      parser = new CommandLineInputParser();
      validOptions = new CommandLineOptions('output', 3);
      parseStub = sinon.stub(parser, 'parse');
      parseStub.returns(validOptions);
    });

    afterEach(() => {
      if (parseStub != null) {
        parseStub.restore();
      }
    });

    it('should return true if quality is an int between 0-10', () => {
      // Arrange
      validOptions.quality = 0;

      // Act
      const zeroResult: boolean = parser.validate();

      // Arrange
      validOptions.quality = 10;

      // Act
      const tenResult: boolean = parser.validate();

      // Assert
      assert.isTrue(zeroResult);
      assert.isTrue(tenResult);
    });

    it('should return false if quality is a negative number', () => {
      // Arrange
      validOptions.quality = -1;

      // Act
      const result: boolean = parser.validate();

      // Assert
      assert.isFalse(result);
    });

    it('should return false if quality is larger than 10', () => {
      // Arrange
      validOptions.quality = 11;

      // Act
      const result: boolean = parser.validate();

      // Assert
      assert.isFalse(result);
    });

    it('should return false if quality is a decimal', () => {
      // Arrange
      validOptions.quality = 4.4;

      // Act
      const result: boolean = parser.validate();

      // Assert
      assert.isFalse(result);
    });
  });
});
